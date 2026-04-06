# Git hooks

## Pre-push (changelog dates)

Before each push, the hook runs `Website/scripts/generate_changelog_dates.py`. If `Website/src/data/changelog-dates.generated.json` changes, the push is blocked until you commit the refreshed file (same output as `npm run build` / `prebuild.py`).

**One-time setup** (from repo root):

```bash
git config core.hooksPath githooks
```

To bypass when necessary: `git push --no-verify`.
