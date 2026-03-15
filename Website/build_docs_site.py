from __future__ import annotations

import html
import json
import os
import re
import shutil
import unicodedata
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

import markdown


ROOT = Path(__file__).resolve().parent
OUTPUT_DIR = ROOT / "site"
THEME_DIR = ROOT / "docs_site_theme"
ASSETS_DIR = OUTPUT_DIR / "assets"

EXCLUDED_PARTS = {
    ".git",
    ".cursor",
    "__pycache__",
    "site",
    "docs_site_theme",
}

COLLECTION_README_NAMES = {"readme.md"}
HEADING_RE = re.compile(r"<h([1-6])>(.*?)</h\1>", re.IGNORECASE | re.DOTALL)
STRIP_TAGS_RE = re.compile(r"<[^>]+>")
LINK_RE = re.compile(r"(!?)\[([^\]]+)\]\(([^)]+)\)")
NUMERIC_RE = re.compile(r"\d+|[A-Za-z]+")


@dataclass(slots=True)
class Page:
    source_path: Path
    relative_path: Path
    collection_key: str
    collection_slug: str
    title: str
    summary: str
    url_path: str
    output_path: Path
    sort_key: tuple
    headings: list[dict] = field(default_factory=list)
    body_html: str = ""


@dataclass(slots=True)
class Collection:
    key: str
    slug: str
    title: str
    summary: str
    pages: list[Page] = field(default_factory=list)

    @property
    def landing_page(self) -> Page:
        for page in self.pages:
            if page.relative_path.name.lower() in COLLECTION_README_NAMES:
                return page
        return self.pages[0]


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r"[^a-z0-9]+", "-", ascii_text)
    return ascii_text.strip("-") or "page"


def humanize_name(value: str) -> str:
    text = value.replace("_", " ").replace("-", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text or "Untitled"


def short_text(value: str, limit: int = 180) -> str:
    compact = re.sub(r"\s+", " ", value).strip()
    if len(compact) <= limit:
        return compact
    return compact[: limit - 1].rstrip() + "..."


def read_text_file(path: Path) -> str:
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


def numeric_sort_key(parts: Iterable[str]) -> tuple:
    key: list[tuple[int, object]] = []
    for part in parts:
        for token in NUMERIC_RE.findall(part):
            if token.isdigit():
                key.append((0, int(token)))
            else:
                key.append((1, token.lower()))
    return tuple(key)


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
        if line.startswith("#"):
            continue
        if re.fullmatch(r"[-_*]{3,}", line):
            continue
        if line.startswith("|") or line.startswith(">"):
            continue
        return strip_markdown_inline(line)
    return ""


def should_include_markdown(path: Path) -> bool:
    rel_parts = path.relative_to(ROOT).parts
    if any(part in EXCLUDED_PARTS for part in rel_parts):
        return False
    if any(part.startswith(".") and part != ".nojekyll" for part in rel_parts):
        return False
    lowered_parts = [part.lower() for part in rel_parts]
    if any("transcript" in part for part in lowered_parts):
        return False
    if any(part in {"source-notes", "voice-notes"} for part in lowered_parts):
        return False
    return path.suffix.lower() == ".md"


def discover_markdown_files() -> list[Path]:
    files: list[Path] = []
    for path in ROOT.rglob("*.md"):
        if should_include_markdown(path):
            files.append(path)
    return sorted(files)


def build_page_output(relative_path: Path) -> tuple[str, Path]:
    parts = list(relative_path.parts)
    stem = Path(parts[-1]).stem

    if len(parts) == 1:
        url_parts = ["pages", "repository", slugify(stem)]
    elif len(parts) == 2 and parts[-1].lower() in COLLECTION_README_NAMES:
        url_parts = ["collections", slugify(parts[0])]
    else:
        slug_parts = [slugify(part) for part in parts[:-1]]
        url_parts = ["docs", *slug_parts, slugify(stem)]

    url_path = "/".join(url_parts) + "/"
    output_path = OUTPUT_DIR.joinpath(*url_parts, "index.html")
    return url_path, output_path


def rewrite_markdown_links(text: str, page: Page, source_map: dict[Path, Page]) -> str:
    def replace(match: re.Match[str]) -> str:
        bang, label, target = match.groups()
        target = target.strip()
        if not target or target.startswith(("http://", "https://", "mailto:", "#")):
            return match.group(0)

        target_path, anchor = split_anchor(target)

        if target_path.lower().endswith(".md"):
            resolved = (page.source_path.parent / target_path).resolve()
            destination = source_map.get(resolved)
            if not destination:
                return match.group(0)
            href = relative_href(page.output_path, destination.output_path)
            if anchor:
                href = f"{href}#{slugify(anchor)}"
            return f'{bang}[{label}]({href})'

        return match.group(0)

    return LINK_RE.sub(replace, text)


def split_anchor(target: str) -> tuple[str, str]:
    if "#" not in target:
        return target, ""
    path, anchor = target.split("#", 1)
    return path, anchor


def relative_href(from_path: Path, to_path: Path) -> str:
    return Path(os.path.relpath(to_path.parent, start=from_path.parent)).as_posix() + "/"


def relative_file_href(from_path: Path, to_path: Path) -> str:
    return Path(os.path.relpath(to_path, start=from_path.parent)).as_posix()


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
        return (
            f'<h{level} id="{heading_id}">'
            f'<a class="heading-anchor" href="#{heading_id}" '
            f'aria-label="Link to {html.escape(label)}">#</a>{inner_html}</h{level}>'
        )

    return HEADING_RE.sub(replace, rendered_html), headings


def build_collections(files: list[Path]) -> tuple[list[Collection], list[Page]]:
    pages: list[Page] = []
    collections_by_key: dict[str, Collection] = {}

    for source_path in files:
        relative_path = source_path.relative_to(ROOT)
        source_text = read_text_file(source_path)

        if len(relative_path.parts) == 1:
            collection_key = "__repository__"
            collection_slug = "repository"
            collection_title = "Repository"
        else:
            collection_key = relative_path.parts[0]
            collection_slug = slugify(collection_key)
            collection_title = humanize_name(collection_key)

        url_path, output_path = build_page_output(relative_path)
        page = Page(
            source_path=source_path.resolve(),
            relative_path=relative_path,
            collection_key=collection_key,
            collection_slug=collection_slug,
            title=extract_title(source_text, humanize_name(source_path.stem)),
            summary=extract_summary(source_text),
            url_path=url_path,
            output_path=output_path,
            sort_key=numeric_sort_key(relative_path.parts),
        )
        pages.append(page)

        collection = collections_by_key.get(collection_key)
        if not collection:
            collections_by_key[collection_key] = Collection(
                key=collection_key,
                slug=collection_slug,
                title=collection_title,
                summary="",
                pages=[page],
            )
        else:
            collection.pages.append(page)

    for collection in collections_by_key.values():
        collection.pages.sort(key=lambda item: item.sort_key)
        readme_page = next(
            (page for page in collection.pages if page.relative_path.name.lower() in COLLECTION_README_NAMES),
            None,
        )
        if readme_page:
            readme_text = read_text_file(readme_page.source_path)
            collection.title = extract_title(readme_text, collection.title)
            collection.summary = extract_summary(readme_text) or readme_page.summary
        elif collection.pages:
            collection.summary = collection.pages[0].summary

    collections = sorted(
        collections_by_key.values(),
        key=lambda item: numeric_sort_key([item.key, item.title]),
    )
    return collections, pages


def render_markdown_page(page: Page, source_map: dict[Path, Page]) -> None:
    source_text = read_text_file(page.source_path)
    prepared_text = rewrite_markdown_links(source_text, page, source_map)
    body_html = markdown.markdown(
        prepared_text,
        extensions=["extra", "sane_lists", "smarty"],
        output_format="html5",
    )
    body_html, headings = add_heading_ids(body_html)
    page.body_html = body_html
    page.headings = headings


def render_collection_nav(collections: list[Collection], current_page: Page) -> str:
    items: list[str] = []
    for collection in collections:
        items.append(
            "<section class=\"nav-collection\">"
            f"<h3>{html.escape(collection.title)}</h3>"
            "<ul>"
        )
        for page in collection.pages:
            is_active = " is-active" if page.output_path == current_page.output_path else ""
            href = relative_href(current_page.output_path, page.output_path)
            items.append(
                f'<li><a class="nav-link{is_active}" href="{href}">'
                f"<span>{html.escape(page.title)}</span>"
                "</a></li>"
            )
        items.append("</ul></section>")
    return "".join(items)


def render_page_toc(page: Page) -> str:
    visible_headings = [heading for heading in page.headings if heading["level"] <= 3]
    if len(visible_headings) <= 1:
        return '<p class="toc-empty">This page is short and does not need a table of contents.</p>'

    parts = ['<ul class="page-toc-list">']
    for heading in visible_headings[1:]:
        indent = f' level-{heading["level"]}'
        parts.append(
            f'<li><a class="page-toc-link{indent}" href="#{heading["id"]}">'
            f'{html.escape(heading["title"])}</a></li>'
        )
    parts.append("</ul>")
    return "".join(parts)


def render_prev_next(collection: Collection, page: Page) -> str:
    index = collection.pages.index(page)
    prev_page = collection.pages[index - 1] if index > 0 else None
    next_page = collection.pages[index + 1] if index < len(collection.pages) - 1 else None

    cards: list[str] = []
    if prev_page:
        cards.append(
            f'<a class="pager-card" href="{relative_href(page.output_path, prev_page.output_path)}">'
            '<span class="pager-label">Previous</span>'
            f"<strong>{html.escape(prev_page.title)}</strong>"
            "</a>"
        )
    if next_page:
        cards.append(
            f'<a class="pager-card align-right" href="{relative_href(page.output_path, next_page.output_path)}">'
            '<span class="pager-label">Next</span>'
            f"<strong>{html.escape(next_page.title)}</strong>"
            "</a>"
        )
    if not cards:
        return ""
    return '<div class="pager">' + "".join(cards) + "</div>"


def build_document_page(page: Page, collection: Collection, collections: list[Collection]) -> str:
    assets_href = relative_file_href(page.output_path, ASSETS_DIR / "style.css")
    script_href = relative_file_href(page.output_path, ASSETS_DIR / "app.js")
    home_href = relative_href(page.output_path, OUTPUT_DIR / "index.html")
    source_display = page.relative_path.as_posix()
    collection_href = relative_href(page.output_path, collection.landing_page.output_path)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(page.title)} | Vibe Docs</title>
  <meta name="description" content="{html.escape(page.summary or collection.summary or 'Vibe docs page')}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{assets_href}">
</head>
<body>
  <div class="ambient-bg">
    <div class="gradient-orb orb-a"></div>
    <div class="gradient-orb orb-b"></div>
    <div class="gradient-orb orb-c"></div>
  </div>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="{home_href}">Vibe Docs</a>
      <button class="mobile-menu-button" type="button" data-nav-toggle>Browse</button>
    </div>
  </header>
  <div class="page-shell">
    <aside class="sidebar" data-nav-panel>
      <div class="sidebar-head">
        <a class="sidebar-home" href="{home_href}">Back to library</a>
        <input class="nav-search" type="search" placeholder="Filter pages..." data-nav-filter>
      </div>
      <div class="sidebar-groups" data-nav-groups>
        {render_collection_nav(collections, page)}
      </div>
    </aside>
    <main class="content-column">
      <div class="page-intro">
        <p class="eyebrow">Collection</p>
        <a class="collection-link" href="{collection_href}">{html.escape(collection.title)}</a>
        <h1>{html.escape(page.title)}</h1>
        <p class="page-summary">{html.escape(page.summary or collection.summary or 'Research, papers, and documentation for Vibe.')}</p>
        <div class="page-meta">
          <span>{html.escape(source_display)}</span>
          <span>{len(page.headings)} sections</span>
        </div>
      </div>
      <article class="doc-card prose">
        {page.body_html}
      </article>
      {render_prev_next(collection, page)}
    </main>
    <aside class="page-toc">
      <div class="page-toc-card">
        <p class="eyebrow">On this page</p>
        {render_page_toc(page)}
      </div>
    </aside>
  </div>
  <script src="{script_href}"></script>
</body>
</html>
"""


def build_home_page(collections: list[Collection], pages: list[Page]) -> str:
    total_pages = len(pages)
    total_collections = len([collection for collection in collections if collection.pages])
    repository_collection = next((collection for collection in collections if collection.key == "__repository__"), None)
    repository_href = repository_collection.landing_page.url_path if repository_collection else "#collections"

    cards: list[str] = []
    for collection in collections:
        sample_links = "".join(
            f'<li><a href="{collection.landing_page.url_path if page == collection.landing_page else page.url_path}">{html.escape(page.title)}</a></li>'
            for page in collection.pages[:3]
        )
        cards.append(
            '<article class="collection-card">'
            f'<p class="collection-kicker">{len(collection.pages)} pages</p>'
            f'<h3><a href="{collection.landing_page.url_path}">{html.escape(collection.title)}</a></h3>'
            f'<p>{html.escape(collection.summary or "A browsable set of Vibe documents.")}</p>'
            f'<ul class="collection-links">{sample_links}</ul>'
            f'<a class="collection-cta" href="{collection.landing_page.url_path}">Open collection</a>'
            "</article>"
        )

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Vibe Docs</title>
  <meta name="description" content="A modern browsable website for the Vibe research library.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body class="home-page">
  <div class="ambient-bg">
    <div class="gradient-orb orb-a"></div>
    <div class="gradient-orb orb-b"></div>
    <div class="gradient-orb orb-c"></div>
  </div>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="index.html">Vibe Docs</a>
      <a class="header-link" href="#collections">Browse collections</a>
    </div>
  </header>
  <main>
    <section class="hero">
      <div class="hero-copy">
        <p class="hero-badge">Research library</p>
        <h1>Turned your markdown archive into a modern docs website.</h1>
        <p class="hero-text">
          Browse papers, whitepapers, GTM notes, and due diligence documents through a shared navigation,
          fast click-through structure, and polished reading layout.
        </p>
        <div class="hero-actions">
          <a class="primary-button" href="#collections">Explore the library</a>
          <a class="secondary-button" href="{repository_href}">Open repository docs</a>
        </div>
      </div>
      <div class="hero-panel">
        <div class="metric-card">
          <span class="metric-value">{total_pages}</span>
          <span class="metric-label">Markdown pages</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">{total_collections}</span>
          <span class="metric-label">Collections</span>
        </div>
        <div class="metric-card">
          <span class="metric-value">1</span>
          <span class="metric-label">Unified reading experience</span>
        </div>
      </div>
    </section>
    <section class="library-strip">
      <div class="library-strip-card">
        <p class="eyebrow">What changed</p>
        <h2>Every markdown file is now part of a clickable, shareable structure.</h2>
        <p>
          Collection landing pages, cross-page navigation, page-level table of contents,
          and a consistent visual system all sit on top of the original content.
        </p>
      </div>
    </section>
    <section id="collections" class="collections-section">
      <div class="section-heading">
        <p class="eyebrow">Collections</p>
        <h2>Browse the full Vibe docs library</h2>
      </div>
      <div class="collection-grid">
        {"".join(cards)}
      </div>
    </section>
  </main>
  <script src="assets/app.js"></script>
</body>
</html>
"""


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def build_site() -> None:
    if not THEME_DIR.exists():
        raise SystemExit("Missing docs_site_theme directory.")

    markdown_files = discover_markdown_files()
    collections, pages = build_collections(markdown_files)
    source_map = {page.source_path: page for page in pages}

    for page in pages:
        render_markdown_page(page, source_map)

    if OUTPUT_DIR.exists():
        shutil.rmtree(OUTPUT_DIR)

    ASSETS_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(THEME_DIR / "style.css", ASSETS_DIR / "style.css")
    shutil.copy2(THEME_DIR / "app.js", ASSETS_DIR / "app.js")

    for collection in collections:
        for page in collection.pages:
            html_content = build_document_page(page, collection, collections)
            write_text(page.output_path, html_content)

    home_html = build_home_page(collections, pages)
    write_text(OUTPUT_DIR / "index.html", home_html)

    manifest = {
        "collections": [
            {
                "title": collection.title,
                "slug": collection.slug,
                "summary": collection.summary,
                "pageCount": len(collection.pages),
                "landingPage": collection.landing_page.url_path,
            }
            for collection in collections
        ],
        "pageCount": len(pages),
    }
    write_text(OUTPUT_DIR / "site-data.json", json.dumps(manifest, indent=2))
    print(f"Built site with {len(pages)} pages across {len(collections)} collections.")
    print(f"Open {OUTPUT_DIR / 'index.html'}")


if __name__ == "__main__":
    build_site()
