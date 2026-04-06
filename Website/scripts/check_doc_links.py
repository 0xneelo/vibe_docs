from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import unquote

# Reuse discovery and slugs from the docs generator (single source of truth).
from generate_docs_data import (
    DOCS_ROOT,
    LINK_RE,
    REPO_ROOT,
    discover_collections,
    read_text,
    split_anchor,
)

SCRIPT_DIR = Path(__file__).resolve().parent
CORRECTIONS_FILE = SCRIPT_DIR / "link_corrections.json"

# Known in-app paths that are not derived from discover_collections.
ALLOWED_ABSOLUTE_PREFIXES = (
    "/",
    "/library",
    "/changelog",
    "/docs",
    "/chapters",
)

def strip_fenced_blocks(text: str) -> str:
    """Remove fenced code blocks so example markdown is not validated as real links."""
    lines = text.splitlines(keepends=True)
    out: list[str] = []
    in_fence = False
    for line in lines:
        if line.lstrip().startswith("```"):
            in_fence = not in_fence
            continue
        if not in_fence:
            out.append(line)
    return "".join(out)


def build_valid_internal_routes(collections) -> tuple[set[str], set[str]]:
    """Returns (doc_hrefs_without_fragment, chapter_hrefs)."""
    doc_hrefs: set[str] = set()
    chapter_hrefs: set[str] = set()
    for c in collections:
        chapter_hrefs.add(c.href)
        for p in c.pages:
            doc_hrefs.add(p.href)
        if c.overview_source:
            doc_hrefs.add(f"/docs/{c.slug}/overview")
    return doc_hrefs, chapter_hrefs


def normalize_doc_path(path: str) -> str:
    p = path.split("?", 1)[0].rstrip("/")
    if len(p) > 1 and p.endswith("/"):
        return p.rstrip("/")
    return p or "/"


def load_corrections(path: Path) -> list[tuple[str, str]]:
    if not path.exists():
        return []
    data = json.loads(path.read_text(encoding="utf-8"))
    pairs: list[tuple[str, str]] = []
    for item in data:
        if isinstance(item, dict) and "from" in item and "to" in item:
            pairs.append((str(item["from"]), str(item["to"])))
        elif isinstance(item, (list, tuple)) and len(item) == 2:
            pairs.append((str(item[0]), str(item[1])))
    pairs.sort(key=lambda x: len(x[0]), reverse=True)
    return pairs


def apply_file_link_corrections(content: str, corrections: list[tuple[str, str]]) -> str:
    """Replace markdown link targets: ](old) and ](old#anchor) using longest-from-first rules."""
    for old, new in corrections:
        if not old:
            continue
        pattern = re.compile(
            r"\]\(" + re.escape(old) + r"(#[^)]*)?\)",
        )

        def repl(m: re.Match[str]) -> str:
            anchor = m.group(1) or ""
            return f"]({new}{anchor})"

        content = pattern.sub(repl, content)
    return content


def default_auto_fixes() -> list[tuple[str, str]]:
    return [
        ("/collections/", "/chapters/"),
    ]


def check_external(url: str, timeout: float) -> tuple[bool, str]:
    req = urllib.request.Request(
        url,
        method="HEAD",
        headers={"User-Agent": "vibe-docs-link-check/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            code = resp.getcode()
            if 200 <= code < 400:
                return True, f"{code}"
            return False, f"HTTP {code}"
    except urllib.error.HTTPError as e:
        if e.code in (405, 501):
            return check_external_get(url, timeout)
        return False, f"HTTP {e.code}"
    except Exception as e:
        return False, str(e)


def check_external_get(url: str, timeout: float) -> tuple[bool, str]:
    req = urllib.request.Request(
        url,
        method="GET",
        headers={"User-Agent": "vibe-docs-link-check/1.0"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            code = resp.getcode()
            if 200 <= code < 400:
                return True, f"{code}"
            return False, f"HTTP {code}"
    except Exception as e:
        return False, str(e)


def file_exists_under_docs(path: Path) -> bool:
    """True if path is an existing file, or matches a file on disk ignoring final-segment case (Linux CI vs Windows)."""
    if path.is_file():
        return True
    parent = path.parent
    name = path.name
    if not parent.is_dir():
        return False
    try:
        for child in parent.iterdir():
            if child.is_file() and child.name.lower() == name.lower():
                return True
    except OSError:
        return False
    return False


def validate_target(
    raw_target: str,
    md_path: Path,
    doc_hrefs: set[str],
    chapter_hrefs: set[str],
) -> str | None:
    """Return error message if invalid; None if OK."""
    target = raw_target.strip()
    if not target or target.startswith("mailto:") or target.startswith("tel:"):
        return None

    path_part, _frag = split_anchor(target)
    path_part = unquote(path_part)

    if not path_part:
        return None

    if path_part.startswith(("http://", "https://")):
        return "external"  # handled by caller

    if path_part.startswith("/docs/"):
        n = normalize_doc_path(path_part)
        if n in doc_hrefs:
            return None
        return f"unknown docs route: {path_part}"

    if path_part.startswith("/chapters/"):
        n = normalize_doc_path(path_part)
        if n in chapter_hrefs:
            return None
        return f"unknown chapter: {path_part}"

    if path_part.startswith("/collections/"):
        return f"use /chapters/ not /collections/: {path_part}"

    if path_part.startswith("/content-assets/"):
        rel = path_part.removeprefix("/content-assets/").lstrip("/")
        asset_path = (DOCS_ROOT / rel).resolve()
        try:
            asset_path.relative_to(DOCS_ROOT.resolve())
        except ValueError:
            return f"content-asset escapes docs root: {path_part}"
        if file_exists_under_docs(asset_path):
            return None
        return f"missing asset file: {path_part}"

    if path_part.startswith("/"):
        n = normalize_doc_path(path_part)
        for prefix in ALLOWED_ABSOLUTE_PREFIXES:
            if n == prefix or n.startswith(prefix + "/"):
                return None
        return f"unrecognized absolute path: {path_part}"

    # Relative (or bare filename)
    rel_file = Path(path_part)
    if rel_file.is_absolute():
        return f"invalid target: {raw_target}"
    resolved = (md_path.parent / rel_file).resolve()
    try:
        resolved.relative_to(DOCS_ROOT.resolve())
    except ValueError:
        return f"relative link leaves Docs/public: {path_part}"
    if file_exists_under_docs(resolved):
        return None
    return f"missing file: {path_part}"


def scan_markdown_files() -> list[Path]:
    return sorted(DOCS_ROOT.rglob("*.md"))


def extract_links(text: str) -> list[tuple[int, str, str, str]]:
    """(line_no, full_match, link_text, target)"""
    matches: list[tuple[int, str, str, str]] = []
    for m in LINK_RE.finditer(text):
        start = m.start()
        line_no = text.count("\n", 0, start) + 1
        matches.append((line_no, m.group(0), m.group(2), m.group(3).strip()))
    return matches


def scan_website_tsx() -> list[tuple[Path, int, str]]:
    """Find string literals that look like /docs/... or /chapters/... in Website/src."""
    website_root = SCRIPT_DIR.parent
    src_root = website_root / "src"
    if not src_root.is_dir():
        return []
    pattern = re.compile(r"['\"](/docs/[^'\"#]+|/chapters/[^'\"#]+)")
    found: list[tuple[Path, int, str]] = []
    for path in sorted(src_root.rglob("*.tsx")):
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        for m in pattern.finditer(text):
            href = m.group(1)
            if any(ch in href for ch in (":", "*", "{")):
                continue
            line_no = text.count("\n", 0, m.start()) + 1
            found.append((path, line_no, href))
    return found


def main() -> int:
    parser = argparse.ArgumentParser(description="Validate links in Docs/public markdown (and optional Website/src).")
    parser.add_argument(
        "--fix",
        action="store_true",
        help="Apply safe rewrites (/collections/→/chapters/) and link_corrections.json",
    )
    parser.add_argument(
        "--check-external",
        action="store_true",
        help="HEAD/GET-check http(s) links (slow; may fail on rate limits)",
    )
    parser.add_argument(
        "--external-timeout",
        type=float,
        default=12.0,
        help="Timeout seconds per external URL",
    )
    parser.add_argument(
        "--scan-website",
        action="store_true",
        help="Also flag /docs/ and /chapters/ string literals in Website/src if they are not valid routes",
    )
    args = parser.parse_args()

    collections = discover_collections()
    doc_hrefs, chapter_hrefs = build_valid_internal_routes(collections)

    corrections = load_corrections(CORRECTIONS_FILE)
    auto_pairs = default_auto_fixes()

    broken: list[str] = []
    fixed_files: list[Path] = []

    for md_path in scan_markdown_files():
        initial = read_text(md_path)
        if args.fix:
            new_raw = initial
            for old, new in auto_pairs:
                new_raw = new_raw.replace(old, new)
            new_raw = apply_file_link_corrections(new_raw, corrections)
            scan_text = strip_fenced_blocks(new_raw)
        else:
            new_raw = initial
            scan_text = strip_fenced_blocks(initial)

        for line_no, _full, _label, target in extract_links(scan_text):
            err = validate_target(target, md_path, doc_hrefs, chapter_hrefs)
            if err == "external":
                if args.check_external:
                    path_part, _ = split_anchor(target)
                    ok, detail = check_external(path_part, args.external_timeout)
                    if not ok:
                        broken.append(f"{md_path.relative_to(REPO_ROOT)}:{line_no}  {target}  ({detail})")
                continue
            if err is None:
                continue

            rel = md_path.relative_to(REPO_ROOT)
            broken.append(f"{rel}:{line_no}  {target}  ({err})")

        if args.fix and new_raw != initial:
            md_path.write_text(new_raw, encoding="utf-8", newline="\n")
            fixed_files.append(md_path)

    if args.scan_website:
        website_root = SCRIPT_DIR.parent
        for path, line_no, href in scan_website_tsx():
            path_part, _ = split_anchor(href)
            n = normalize_doc_path(path_part)
            if href.startswith("/docs/"):
                if n not in doc_hrefs:
                    broken.append(
                        f"{path.relative_to(website_root)}:{line_no}  {href}  (unknown docs route)"
                    )
            elif href.startswith("/chapters/"):
                if n not in chapter_hrefs:
                    broken.append(
                        f"{path.relative_to(website_root)}:{line_no}  {href}  (unknown chapter)"
                    )

    for line in sorted(broken):
        print(line)

    if fixed_files:
        print(f"\nRewrote {len(fixed_files)} markdown file(s).", file=sys.stderr)

    if broken:
        print(f"\nTotal issues: {len(broken)}", file=sys.stderr)
        return 1
    print("All checked links OK.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
