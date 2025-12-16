@echo off
echo ========================================
echo   SeaTrace Deployment Readiness Check
echo ========================================
echo.

set ERROR_COUNT=0

echo Checking project structure...
if not exist "backend\" (
    echo ❌ ERROR: backend directory not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ backend directory exists
)

if not exist "seatrace-frontend\" (
    echo ❌ ERROR: seatrace-frontend directory not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ seatrace-frontend directory exists
)

echo.
echo Checking backend files...
if not exist "backend\requirements.txt" (
    echo ❌ ERROR: backend\requirements.txt not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ backend\requirements.txt exists
)

if not exist "backend\render.yaml" (
    echo ❌ ERROR: backend\render.yaml not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ backend\render.yaml exists
)

if not exist "backend\start.py" (
    echo ❌ ERROR: backend\start.py not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ backend\start.py exists
)

if not exist "backend\app.py" (
    echo ❌ ERROR: backend\app.py not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ backend\app.py exists
)

echo.
echo Checking frontend files...
if not exist "seatrace-frontend\vercel.json" (
    echo ❌ ERROR: seatrace-frontend\vercel.json not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ seatrace-frontend\vercel.json exists
)

if not exist "seatrace-frontend\.env" (
    echo ❌ ERROR: seatrace-frontend\.env not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ seatrace-frontend\.env exists
)

if not exist "seatrace-frontend\package.json" (
    echo ❌ ERROR: seatrace-frontend\package.json not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ seatrace-frontend\package.json exists
)

echo.
echo Checking deployment files...
if not exist "DEPLOYMENT_GUIDE.md" (
    echo ❌ ERROR: DEPLOYMENT_GUIDE.md not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ DEPLOYMENT_GUIDE.md exists
)

if not exist "deploy.bat" (
    echo ❌ ERROR: deploy.bat not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ deploy.bat exists
)

if not exist ".gitignore" (
    echo ❌ ERROR: .gitignore not found!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ .gitignore exists
)

echo.
echo Checking git repository...
git status >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ ERROR: Not a git repository!
    set /a ERROR_COUNT+=1
) else (
    echo ✅ Git repository initialized
)

echo.
echo Checking git remote...
git remote -v | findstr "origin" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ⚠️  WARNING: No git remote configured (will be set during deployment)
) else (
    echo ✅ Git remote configured
)

echo.
if %ERROR_COUNT% gtr 0 (
    echo ========================================
    echo   ❌ DEPLOYMENT NOT READY
    echo ========================================
    echo.
    echo Found %ERROR_COUNT% error(s). Please fix them before deploying.
    echo.
    echo Run this script again after fixing the issues.
) else (
    echo ========================================
    echo   ✅ DEPLOYMENT READY
    echo ========================================
    echo.
    echo All required files are present!
    echo.
    echo Next steps:
    echo 1. Create a GitHub repository
    echo 2. Run deploy.bat to start deployment
    echo 3. Follow the on-screen instructions
    echo.
    echo Or follow the detailed guide in DEPLOYMENT_GUIDE.md
)

echo.
pause