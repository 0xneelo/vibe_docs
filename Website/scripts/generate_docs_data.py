from __future__ import annotations

import html
import json
import re
import shutil
import unicodedata
from dataclasses import dataclass, field
from datetime import UTC, datetime
from pathlib import Path
from typing import Iterable

import markdown


SCRIPT_DIR = Path(__file__).resolve().parent
WEBSITE_ROOT = SCRIPT_DIR.parent
REPO_ROOT = WEBSITE_ROOT.parent
DOCS_ROOT = REPO_ROOT / "Docs" / "public"
GENERATED_ROOT = WEBSITE_ROOT / "public" / "generated"
ASSET_ROOT = WEBSITE_ROOT / "public" / "content-assets"
OUTPUT_FILE = GENERATED_ROOT / "docs-data.json"

COLLECTION_README = "README.md"
HEADING_RE = re.compile(r"<h([1-6])>(.*?)</h\1>", re.IGNORECASE | re.DOTALL)
STRIP_TAGS_RE = re.compile(r"<[^>]+>")
LINK_RE = re.compile(r"(!?)\[([^\]]+)\]\(([^)]+)\)")
NUMERIC_RE = re.compile(r"\d+|[A-Za-z]+")


@dataclass(slots=True)
class Page:
    id: str
    source_path: Path
    collection_key: str
    collection_slug: str
    relative_path: Path
    route_slug: str
    title: str
    summary: str
    sort_key: tuple
    html: str = ""
    headings: list[dict] = field(default_factory=list)
    prev_id: str | None = None
    next_id: str | None = None

    @property
    def href(self) -> str:
        return f"/docs/{self.collection_slug}/{self.route_slug}"


@dataclass(slots=True)
class Collection:
    key: str
    slug: str
    source_dir: Path
    title: str
    summary: str
    overview_source: Path | None = None
    overview_html: str = ""
    overview_headings: list[dict] = field(default_factory=list)
    overview_title: str = ""
    pages: list[Page] = field(default_factory=list)

    @property
    def href(self) -> str:
        return f"/collections/{self.slug}"


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r"[^a-z0-9]+", "-", ascii_text)
    return ascii_text.strip("-") or "page"


def short_text(value: str, limit: int = 180) -> str:
    compact = re.sub(r"\s+", " ", value).strip()
    if len(compact) <= limit:
        return compact
    return compact[: limit - 1].rstrip() + "..."


def numeric_sort_key(parts: Iterable[str]) -> tuple:
    key: list[tuple[int, object]] = []
    for part in parts:
        for token in NUMERIC_RE.findall(part):
            if token.isdigit():
                key.append((0, int(token)))
            else:
                key.append((1, token.lower()))
    return tuple(key)


def read_text(path: Path) -> str:
    for encoding in ("utf-8", "utf-8-sig", "cp1252", "latin-1"):
        try:
            return path.read_text(encoding=encoding).lstrip("\ufeff")
        except UnicodeDecodeError:
            continue
    raise UnicodeDecodeError("unknown", b"", 0, 1, f"Unable to decode {path}")


def strip_markdown_inline(value: str) -> str:
    cleaned = value.replace("`", "")
    cleaned = re.sub(r"!\[([^\]]*)\]\([^)]+\)", r"\1", cleaned)
    cleaned = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", cleaned)
    cleaned = re.sub(r"[*_~#>]", "", cleaned)
    cleaned = cleaned.replace("\\", "")
    return short_text(cleaned)


def extract_title(markdown_text: str, fallback: str) -> str:
    for line in markdown_text.splitlines():
        if line.strip().startswith("#"):
            return strip_markdown_inline(line.lstrip("#").strip()) or fallback
    return fallback


def extract_summary(markdown_text: str) -> str:
    in_code_block = False
    for raw_line in markdown_text.splitlines():
        line = raw_line.strip()
        if line.startswith("```"):
            in_code_block = not in_code_block
            continue
        if in_code_block or not line:
            continue
        if line.startswith("#") or re.fullmatch(r"[-_*]{3,}", line):
            continue
        if line.startswith("|") or line.startswith(">"):
            continue
        return strip_markdown_inline(line)
    return ""


def split_anchor(target: str) -> tuple[str, str]:
    if "#" not in target:
        return target, ""
    path, anchor = target.split("#", 1)
    return path, anchor


def route_slug_from_relative(relative_path: Path) -> str:
    parts = list(relative_path.parts)
    stem = Path(parts[-1]).stem
    slug_parts = [slugify(part) for part in parts[:-1]]
    slug_parts.append("overview" if stem.lower() == "readme" else slugify(stem))
    return "/".join(slug_parts)


def add_heading_ids(rendered_html: str) -> tuple[str, list[dict]]:
    used_ids: dict[str, int] = {}
    headings: list[dict] = []

    def unique_id(text: str) -> str:
        base = slugify(text)
        count = used_ids.get(base, 0)
        used_ids[base] = count + 1
        return base if count == 0 else f"{base}-{count + 1}"

    def replace(match: re.Match[str]) -> str:
        level = int(match.group(1))
        inner_html = match.group(2)
        label = html.unescape(STRIP_TAGS_RE.sub("", inner_html)).strip()
        if not label:
            return match.group(0)
        heading_id = unique_id(label)
        headings.append({"level": level, "title": label, "id": heading_id})
        return f'<h{level} id="{heading_id}">{inner_html}</h{level}>'

    return HEADING_RE.sub(replace, rendered_html), headings


def discover_collections() -> list[Collection]:
    collections: list[Collection] = []
    for collection_dir in sorted((path for path in DOCS_ROOT.iterdir() if path.is_dir()), key=lambda p: numeric_sort_key([p.name])):
        overview_source = collection_dir / COLLECTION_README
        overview_text = read_text(overview_source) if overview_source.exists() else ""
        title = extract_title(overview_text, collection_dir.name.replace("_", " "))
        summary = extract_summary(overview_text)

        collection = Collection(
            key=collection_dir.name,
            slug=slugify(collection_dir.name),
            source_dir=collection_dir,
            title=title,
            summary=summary,
            overview_source=overview_source if overview_source.exists() else None,
            overview_title=title,
        )

        markdown_files = [
            path for path in collection_dir.rglob("*.md")
            if path.name != COLLECTION_README or path.parent != collection_dir
        ]
        markdown_files.sort(key=lambda p: numeric_sort_key(p.relative_to(collection_dir).parts))

        for path in markdown_files:
            rel = path.relative_to(collection_dir)
            source_text = read_text(path)
            route_slug = route_slug_from_relative(rel)
            collection.pages.append(
                Page(
                    id=f"{collection.slug}::{route_slug}",
                    source_path=path.resolve(),
                    collection_key=collection.key,
                    collection_slug=collection.slug,
                    relative_path=rel,
                    route_slug=route_slug,
                    title=extract_title(source_text, rel.stem),
                    summary=extract_summary(source_text),
                    sort_key=numeric_sort_key(rel.parts),
                )
            )

        if not collection.summary and collection.pages:
            collection.summary = collection.pages[0].summary

        collections.append(collection)

    return collections


def build_source_lookup(collections: list[Collection]) -> dict[Path, tuple[str, object]]:
    lookup: dict[Path, tuple[str, object]] = {}
    for collection in collections:
        if collection.overview_source:
            lookup[collection.overview_source.resolve()] = ("collection", collection)
        for page in collection.pages:
            lookup[page.source_path.resolve()] = ("page", page)
    return lookup


def rewrite_markdown_links(text: str, source_path: Path, source_lookup: dict[Path, tuple[str, object]]) -> str:
    def replace(match: re.Match[str]) -> str:
        bang, label, target = match.groups()
        target = target.strip()
        if not target or target.startswith(("http://", "https://", "mailto:", "tel:", "#")):
            return match.group(0)

        target_path, anchor = split_anchor(target)
        resolved = (source_path.parent / target_path).resolve()

        if target_path.lower().endswith(".md"):
            destination = source_lookup.get(resolved)
            if not destination:
                return match.group(0)

            kind, payload = destination
            if kind == "collection":
                href = payload.href
            else:
                href = payload.href

            if anchor:
                href = f"{href}#{slugify(anchor)}"
            return f'{bang}[{label}]({href})'

        if resolved.exists() and DOCS_ROOT in resolved.parents:
            asset_rel = resolved.relative_to(DOCS_ROOT).as_posix()
            href = f"/content-assets/{asset_rel}"
            if anchor:
                href = f"{href}#{anchor}"
            return f'{bang}[{label}]({href})'

        return match.group(0)

    return LINK_RE.sub(replace, text)


def render_html(source_text: str, source_path: Path, source_lookup: dict[Path, tuple[str, object]]) -> tuple[str, list[dict]]:
    prepared = rewrite_markdown_links(source_text, source_path, source_lookup)
    html_body = markdown.markdown(
        prepared,
        extensions=["extra", "sane_lists", "smarty"],
        output_format="html5",
    )
    return add_heading_ids(html_body)


def copy_supporting_assets() -> None:
    if ASSET_ROOT.exists():
        shutil.rmtree(ASSET_ROOT)
    ASSET_ROOT.mkdir(parents=True, exist_ok=True)

    for path in DOCS_ROOT.rglob("*"):
        if not path.is_file() or path.suffix.lower() == ".md":
            continue
        destination = ASSET_ROOT / path.relative_to(DOCS_ROOT)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(path, destination)


def build_payload(collections: list[Collection]) -> dict:
    source_lookup = build_source_lookup(collections)

    for collection in collections:
        if collection.overview_source:
            overview_text = read_text(collection.overview_source)
            collection.overview_html, collection.overview_headings = render_html(
                overview_text,
                collection.overview_source,
                source_lookup,
            )

        collection.pages.sort(key=lambda page: page.sort_key)
        for index, page in enumerate(collection.pages):
            page_text = read_text(page.source_path)
            page.html, page.headings = render_html(page_text, page.source_path, source_lookup)
            if index > 0:
                page.prev_id = collection.pages[index - 1].id
            if index < len(collection.pages) - 1:
                page.next_id = collection.pages[index + 1].id

    pages = [page for collection in collections for page in collection.pages]

    return {
        "generatedAt": datetime.now(UTC).isoformat(),
        "collections": [
            {
                "key": collection.key,
                "slug": collection.slug,
                "title": collection.title,
                "summary": collection.summary,
                "href": collection.href,
                "overviewTitle": collection.overview_title or collection.title,
                "overviewHtml": collection.overview_html,
                "overviewHeadings": collection.overview_headings,
                "pageIds": [page.id for page in collection.pages],
                "pageCount": len(collection.pages),
            }
            for collection in collections
        ],
        "pages": [
            {
                "id": page.id,
                "collectionKey": page.collection_key,
                "collectionSlug": page.collection_slug,
                "relativePath": page.relative_path.as_posix(),
                "routeSlug": page.route_slug,
                "href": page.href,
                "title": page.title,
                "summary": page.summary,
                "html": page.html,
                "headings": page.headings,
                "prevId": page.prev_id,
                "nextId": page.next_id,
            }
            for page in pages
        ],
    }


def main() -> None:
    if not DOCS_ROOT.exists():
        raise SystemExit(f"Missing docs root: {DOCS_ROOT}")

    collections = discover_collections()
    GENERATED_ROOT.mkdir(parents=True, exist_ok=True)
    copy_supporting_assets()
    payload = build_payload(collections)
    OUTPUT_FILE.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Generated {OUTPUT_FILE} with {len(payload['pages'])} pages across {len(payload['collections'])} collections.")


if __name__ == "__main__":
    main()
