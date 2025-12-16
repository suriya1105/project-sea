@echo off
echo ========================================
echo   SeaTrace Vercel Configuration Updater
echo ========================================
echo.

set /p RENDER_URL="Enter your Render backend URL (e.g., https://seatrace-backend.onrender.com): "

if "%RENDER_URL%"=="" (
    echo ERROR: No URL provided!
    pause
    exit /b 1
)

echo Updating vercel.json with backend URL: %RENDER_URL%
cd seatrace-frontend

powershell -Command "(Get-Content vercel.json) -replace 'your-render-backend-url\.onrender\.com', '%RENDER_URL:~8%' | Set-Content vercel.json"

echo ✓ vercel.json updated
echo.

echo Updating .env with backend URL...
powershell -Command "(Get-Content .env) -replace 'REACT_APP_API_URL=.*', 'REACT_APP_API_URL=%RENDER_URL%' | Set-Content .env"

echo ✓ .env updated
echo.

echo ========================================
echo   Configuration Update Complete!
echo ========================================
echo.
echo You can now deploy to Vercel.
echo Make sure to also update CORS in your Render backend.
echo.
pause