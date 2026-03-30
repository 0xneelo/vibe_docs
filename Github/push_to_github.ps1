# Push vibe_docs to GitHub
# Run: .\push_to_github.ps1
# Set REPO_URL before running, or pass as argument

param(
    [string]$RepoUrl = ""  # e.g. https://github.com/username/vibe-docs.git
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Check git
try {
    $null = git --version
} catch {
    Write-Host "Git not found. Install from https://git-scm.com/download/win"
    exit 1
}

# Init if needed
if (-not (Test-Path .git)) {
    git init
}

# Add and commit
git add .
$status = git status --short
Write-Host "Files to be committed:"
Write-Host $status
Write-Host ""
$count = ($status | Measure-Object -Line).Lines
Write-Host "Total: $count changed/new files (transcripts and audio excluded by .gitignore)"
Write-Host ""

git commit -m "Initial commit: Vibe docs and papers" -ErrorAction SilentlyContinue
if ($LASTEXITCODE -ne 0) {
    Write-Host "Nothing to commit or already committed."
}

# Remote and push
if ($RepoUrl) {
    $exists = git remote get-url origin 2>$null
    if (-not $exists) {
        git remote add origin $RepoUrl
    } else {
        git remote set-url origin $RepoUrl
    }
    git branch -M main
    git push -u origin main
} else {
    Write-Host "To push, run:"
    Write-Host '  .\push_to_github.ps1 -RepoUrl "https://github.com/YOUR_USERNAME/vibe-docs.git"'
    Write-Host ""
    Write-Host "Or after creating repo on GitHub:"
    Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/vibe-docs.git"
    Write-Host "  git branch -M main"
    Write-Host "  git push -u origin main"
}
