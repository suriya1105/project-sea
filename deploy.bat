@echo off
echo ========================================
echo   SeaTrace Deployment Script
echo ========================================
echo.

echo This script will guide you through deploying SeaTrace to Vercel and Render.
echo.
echo Prerequisites:
echo - GitHub account and repository created
echo - Vercel account
echo - Render account
echo.

set /p GITHUB_URL="Enter your GitHub repository URL: "
if "%GITHUB_URL%"=="" (
    echo ERROR: GitHub URL is required!
    pause
    exit /b 1
)

echo.
echo Step 1: Pushing code to GitHub...
echo Run these commands in a new terminal:
echo.
echo cd "c:\Users\suriy\project sea"
echo git remote add origin %GITHUB_URL%
echo git branch -M main
echo git push -u origin main
echo.
echo Press Enter after you've pushed to GitHub...
pause

echo.
echo Step 2: Deploying Backend to Render...
echo.
echo 1. Go to https://render.com
echo 2. Click "New +" -^> "Web Service"
echo 3. Connect your GitHub repository
echo 4. Configure:
echo    - Name: seatrace-backend
echo    - Runtime: Python 3
echo    - Root Directory: backend
echo    - Build Command: pip install -r requirements.txt
echo    - Start Command: python start.py
echo 5. Add Environment Variables:
echo    - FLASK_ENV: production
echo    - SECRET_KEY: [Generate a secure key]
echo.
echo Press Enter after backend is deployed...
pause

set /p RENDER_URL="Enter your Render backend URL (e.g., https://seatrace-backend.onrender.com): "
if "%RENDER_URL%"=="" (
    echo ERROR: Render URL is required!
    pause
    exit /b 1
)

echo.
echo Step 3: Updating frontend configuration...
cd seatrace-frontend

echo Updating vercel.json...
powershell -Command "(Get-Content vercel.json) -replace 'your-render-backend-url\.onrender\.com', '%RENDER_URL:~8%' | Set-Content vercel.json"

echo Updating .env...
powershell -Command "(Get-Content .env) -replace 'REACT_APP_API_URL=.*', 'REACT_APP_API_URL=%RENDER_URL%' | Set-Content .env"

cd ..
echo.

echo Step 4: Committing configuration changes...
git add .
git commit -m "Update deployment configuration with Render backend URL"
git push origin main

echo.
echo Step 5: Deploying Frontend to Vercel...
echo.
echo 1. Go to https://vercel.com
echo 2. Click "New Project"
echo 3. Import your GitHub repository
echo 4. Configure:
echo    - Framework Preset: Create React App
echo    - Root Directory: seatrace-frontend
echo    - Build Command: npm run build
echo    - Output Directory: build
echo 5. Add Environment Variables:
echo    - REACT_APP_API_BASE_URL: %RENDER_URL%
echo    - REACT_APP_SOCKET_URL: %RENDER_URL%
echo 6. Click "Deploy"
echo.
echo Press Enter after frontend is deployed...
pause

set /p VERCEL_URL="Enter your Vercel frontend URL (e.g., https://seatrace.vercel.app): "
if "%VERCEL_URL%"=="" (
    echo ERROR: Vercel URL is required!
    pause
    exit /b 1
)

echo.
echo Step 6: Updating CORS in Render backend...
echo.
echo 1. Go to your Render dashboard
echo 2. Select your backend service
echo 3. Go to Environment
echo 4. Add/update CORS_ORIGINS environment variable:
echo    Value: %VERCEL_URL%,http://localhost:3000
echo 5. Redeploy the backend
echo.
echo Press Enter after updating CORS...
pause

echo.
echo ========================================
echo   Deployment Complete! 🎉
echo ========================================
echo.
echo Frontend: %VERCEL_URL%
echo Backend: %RENDER_URL%
echo.
echo Test your application:
echo 1. Visit %VERCEL_URL%
echo 2. Login with: admin@seatrace.com / admin123
echo.
echo Default credentials:
echo - Admin: admin@seatrace.com / admin123
echo - Operator: operator@seatrace.com / operator123
echo - Viewer: viewer@seatrace.com / viewer123
echo.
echo Remember to change default passwords in production!
echo.
pause