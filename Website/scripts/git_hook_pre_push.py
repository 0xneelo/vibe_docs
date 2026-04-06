"""
Pre-push: regenerate changelog git-backed dates and fail if the repo file was stale.

Run from githooks/pre-push via: python Website/scripts/git_hook_pre_push.py
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

# Website/scripts/git_hook_pre_push.py -> repo root
REPO_ROOT = Path(__file__).resolve().parent.parent.parent
GENERATOR = REPO_ROOT / "Website" / "scripts" / "generate_changelog_dates.py"
REL_JSON = "Website/src/data/changelog-dates.generated.json"


def main() -> int:
    if not GENERATOR.is_file():
        print(f"pre-push: missing {GENERATOR}", file=sys.stderr)
        return 1

    gen = subprocess.run(
        [sys.executable, str(GENERATOR)],
        cwd=REPO_ROOT,
        check=False,
    )
    if gen.returncode != 0:
        return gen.returncode

    diff = subprocess.run(
        ["git", "diff", "--quiet", "--", REL_JSON],
        cwd=REPO_ROOT,
    )
    if diff.returncode != 0:
        print("", file=sys.stderr)
        print(
            "pre-push: Website/src/data/changelog-dates.generated.json was out of date "
            "(regenerated from git history).",
            file=sys.stderr,
        )
        print("          Commit the update, then push again.", file=sys.stderr)
        print(
            f"          git add {REL_JSON} && git commit -m \"chore: refresh changelog dates\"",
            file=sys.stderr,
        )
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
