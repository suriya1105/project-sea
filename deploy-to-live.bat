@echo off
REM SeaTrace - Deploy to Live Script (Windows)
REM This script helps you push to Git and deploy to Render + Vercel

echo ==========================================
echo SeaTrace - Live Deployment Helper
echo ==========================================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo [WARNING] Git repository not initialized
    echo Initializing Git repository...
    git init
    echo.
)

REM Check if remote exists
git remote show origin >nul 2>&1
if errorlevel 1 (
    echo [WARNING] No Git remote configured
    echo.
    echo Please add your GitHub repository:
    echo   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
    echo.
    pause
    exit /b 1
)

REM Generate secret key if needed
if not exist ".secret_key_generated" (
    echo [INFO] Generating secret key...
    python generate-secret-key.py > .secret_key.txt
    type nul > .secret_key_generated
    echo [SUCCESS] Secret key saved to .secret_key.txt
    echo.
)

REM Check for uncommitted changes
git diff --quiet
if errorlevel 1 (
    echo [INFO] Found uncommitted changes
    echo.
    git status --short
    echo.
    set /p commit_choice="Do you want to commit and push? (y/n): "
    if /i "%commit_choice%"=="y" (
        echo.
        echo [INFO] Staging changes...
        git add .
        
        echo.
        set /p commit_msg="Enter commit message (or press Enter for default): "
        if "%commit_msg%"=="" (
            for /f "tokens=2-4 delims=/ " %%a in ('date /t') do set mydate=%%c-%%a-%%b
            set commit_msg=Deploy SeaTrace to production - %mydate%
        )
        
        echo.
        echo [INFO] Committing changes...
        git commit -m "%commit_msg%"
        
        echo.
        echo [INFO] Pushing to GitHub...
        for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set CURRENT_BRANCH=%%i
        if "%CURRENT_BRANCH%"=="" (
            git branch -M main
            set CURRENT_BRANCH=main
        )
        
        git push -u origin %CURRENT_BRANCH%
        
        if errorlevel 1 (
            echo [ERROR] Failed to push to GitHub
            echo Please check your Git credentials and try again
            pause
            exit /b 1
        ) else (
            echo.
            echo [SUCCESS] Successfully pushed to GitHub!
            echo.
            echo ==========================================
            echo Next Steps:
            echo ==========================================
            echo.
            echo 1. Deploy Backend to Render:
            echo    - Go to: https://dashboard.render.com
            echo    - Follow: RENDER_DEPLOYMENT.md
            echo.
            echo 2. Deploy Frontend to Vercel:
            echo    - Go to: https://vercel.com/dashboard
            echo    - Follow: VERCEL_DEPLOYMENT.md
            echo.
            echo 3. Your secret key is in: .secret_key.txt
            echo    Use it in Render environment variables
            echo.
        )
    ) else (
        echo [INFO] Skipping commit
    )
) else (
    echo [SUCCESS] No uncommitted changes
    echo.
    set /p push_choice="Do you want to push anyway? (y/n): "
    if /i "%push_choice%"=="y" (
        for /f "tokens=*" %%i in ('git branch --show-current 2^>nul') do set CURRENT_BRANCH=%%i
        if "%CURRENT_BRANCH%"=="" (
            git branch -M main
            set CURRENT_BRANCH=main
        )
        git push -u origin %CURRENT_BRANCH%
    )
)

echo.
echo ==========================================
echo Deployment Checklist:
echo ==========================================
echo.
echo [SUCCESS] Code pushed to GitHub
echo.
echo Next Steps:
echo.
echo 1. BACKEND (Render):
echo    - Go to: https://dashboard.render.com
echo    - New ^> Web Service
echo    - Connect GitHub repo
echo    - Root Directory: backend
echo    - Build: pip install -r requirements.txt
echo    - Start: python start.py
echo    - Add SECRET_KEY from .secret_key.txt
echo.
echo 2. FRONTEND (Vercel):
echo    - Go to: https://vercel.com/dashboard
echo    - Add New ^> Project
echo    - Connect GitHub repo
echo    - Root Directory: seatrace-frontend
echo    - Add environment variables with Render URL
echo.
echo 3. CONNECT:
echo    - Update CORS_ORIGINS in Render with Vercel URL
echo.
echo See DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause

