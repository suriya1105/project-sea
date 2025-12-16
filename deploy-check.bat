@echo off
echo ========================================
echo   SeaTrace Deployment Setup Script
echo ========================================
echo.

echo Step 1: Checking project structure...
if not exist "backend\app.py" (
    echo ERROR: backend\app.py not found!
    pause
    exit /b 1
)

if not exist "seatrace-frontend\package.json" (
    echo ERROR: seatrace-frontend\package.json not found!
    pause
    exit /b 1
)

echo ✓ Project structure verified
echo.

echo Step 2: Checking backend dependencies...
cd backend
if not exist "requirements.txt" (
    echo ERROR: requirements.txt not found!
    cd ..
    pause
    exit /b 1
)

echo ✓ Backend requirements.txt found
cd ..
echo.

echo Step 3: Checking frontend build configuration...
cd seatrace-frontend
if not exist "vercel.json" (
    echo ERROR: vercel.json not found!
    cd ..
    pause
    exit /b 1
)

echo ✓ Frontend vercel.json found
cd ..
echo.

echo Step 4: Checking deployment files...
if not exist "DEPLOYMENT_GUIDE.md" (
    echo ERROR: DEPLOYMENT_GUIDE.md not found!
    pause
    exit /b 1
)

echo ✓ Deployment guide created
echo.

echo ========================================
echo   Deployment Preparation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Push your code to GitHub
echo 2. Deploy backend to Render using render.yaml
echo 3. Deploy frontend to Vercel
echo 4. Update API URLs in vercel.json
echo 5. Update CORS origins in backend
echo.
echo See DEPLOYMENT_GUIDE.md for detailed instructions
echo.
pause