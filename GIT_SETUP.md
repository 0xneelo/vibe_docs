# Git & GitHub Setup

Run these commands from the project root to create the repo and push to GitHub.

## Prerequisites

- [Git](https://git-scm.com/download/win) installed
- [GitHub account](https://github.com)
- Create a new empty repo on GitHub (e.g. `vibe-docs`)

## Commands

```powershell
# Navigate to project
cd "c:\Users\Vibe\Desktop\0,0,0 vibe_docs"

# Initialize (if not already)
git init

# Add all files (transcripts/voice notes excluded via .gitignore)
git add .
git status   # Verify exclusions

# Commit
git commit -m "Initial commit: Vibe docs and papers"

# Add remote (replace YOUR_USERNAME and REPO_NAME with your GitHub repo)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push
git branch -M main
git push -u origin main
```

## Create Repo via GitHub CLI (if installed)

```powershell
gh repo create vibe-docs --private --source=. --push
# Or --public for public repo
```
