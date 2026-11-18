# Push Project to GitHub Repository
# Target: https://github.com/venkatpavan111/complaint-Handling-App.git

$ErrorActionPreference = "Continue"

Write-Host "===============================================================" -ForegroundColor Cyan
Write-Host " Pushing Complaint Handling System to GitHub...                " -ForegroundColor Cyan
Write-Host "===============================================================" -ForegroundColor Cyan

# Ensure Git is in PATH
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    if (Test-Path "C:\Program Files\Git\cmd\git.exe") {
        $env:PATH = "C:\Program Files\Git\cmd;$env:PATH"
    } else {
        Write-Host "[ERROR] Git is not installed or not found in PATH." -ForegroundColor Red
        Write-Host "Please install Git from https://git-scm.com/download/win" -ForegroundColor Yellow
        exit 1
    }
}

# 1. Initialize git if not already initialized
if (-not (Test-Path ".git")) {
    Write-Host "--> Initializing Git repository..." -ForegroundColor Green
    git init
} else {
    Write-Host "--> Git repository already initialized." -ForegroundColor Green
}

# 2. Configure branch name
Write-Host "--> Setting branch to main..." -ForegroundColor Green
git branch -M main

# 3. Configure remote origin
$remoteUrl = "https://github.com/venkatpavan111/complaint-Handling-App.git"
git remote remove origin 2>$null
git remote add origin $remoteUrl
Write-Host "--> Configured remote origin: $remoteUrl" -ForegroundColor Green

# 4. Stage files (respecting .gitignore)
Write-Host "--> Staging project files..." -ForegroundColor Green
git add .

# 5. Commit
$status = git status --porcelain
if ($status) {
    Write-Host "--> Committing changes..." -ForegroundColor Green
    git commit -m "Add project files and GitHub Actions test workflow"
} else {
    Write-Host "--> Working tree clean. Proceeding to push..." -ForegroundColor Yellow
}

# 6. Push to GitHub
Write-Host "--> Pushing to origin main..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "===============================================================" -ForegroundColor Cyan
    Write-Host " Successfully pushed to GitHub repository!                    " -ForegroundColor Cyan
    Write-Host "===============================================================" -ForegroundColor Cyan
} else {
    Write-Host "===============================================================" -ForegroundColor Yellow
    Write-Host " Push paused for GitHub authentication.                        " -ForegroundColor Yellow
    Write-Host " Complete the login prompt in the browser or enter your token. " -ForegroundColor Yellow
    Write-Host "===============================================================" -ForegroundColor Yellow
}
