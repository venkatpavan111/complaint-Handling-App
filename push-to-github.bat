@echo off
set "PATH=C:\Program Files\Git\cmd;%PATH%"
echo ===============================================================
echo  Pushing Complaint Handling System to GitHub
echo  Repository: https://github.com/venkatpavan111/complaint-Handling-App.git
echo ===============================================================

where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Please download and install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

if not exist ".git" (
    echo Initializing Git repository...
    git init
)

echo Setting branch to main...
git branch -M main

echo Configuring remote origin...
git remote remove origin 2>nul
git remote add origin https://github.com/venkatpavan111/complaint-Handling-App.git

echo Staging files (respecting .gitignore)...
git add .

echo Committing files...
git commit -m "Add project files and GitHub Actions test workflow" 2>nul

echo Pushing to GitHub origin main...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo ===============================================================
    echo  SUCCESS! Project successfully pushed to GitHub!
    echo ===============================================================
) else (
    echo ===============================================================
    echo  Git push encountered an error or needs authentication.
    echo  If prompted, please log in with your GitHub account or Personal Access Token.
    echo ===============================================================
)

pause
