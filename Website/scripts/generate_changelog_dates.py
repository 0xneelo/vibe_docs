from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path


SCRIPT_DIR = Path(__file__).resolve().parent
WEBSITE_ROOT = SCRIPT_DIR.parent
REPO_ROOT = WEBSITE_ROOT.parent
CONFIG_PATH = SCRIPT_DIR / "changelog_git_paths.json"
OUTPUT_PATH = WEBSITE_ROOT / "src" / "data" / "changelog-dates.generated.json"


def git_last_commit_date(paths: list[str]) -> str | None:
    """Return YYYY-MM-DD of the latest commit touching any of the paths, or None."""
    if not paths:
        return None
    existing = [p for p in paths if (REPO_ROOT / p).exists()]
    if not existing:
        return None
    try:
        result = subprocess.run(
            ["git", "log", "-1", "--format=%cs", "--", *existing],
            cwd=REPO_ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
    except OSError:
        return None
    if result.returncode != 0:
        return None
    line = (result.stdout or "").strip()
    return line or None


def main() -> int:
    if not CONFIG_PATH.is_file():
        print(f"Missing {CONFIG_PATH}", file=sys.stderr)
        return 1

    raw = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    out: dict[str, str] = {}
    for entry_id, paths in raw.items():
        if entry_id.startswith("_"):
            continue
        if not isinstance(paths, list):
            continue
        date = git_last_commit_date([str(p) for p in paths])
        if date:
            out[entry_id] = date

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps({"generatedBy": "generate_changelog_dates.py", "dates": out}, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {OUTPUT_PATH} ({len(out)} git-backed dates)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
