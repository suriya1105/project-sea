@echo off
REM SeaTrace - Run Frontend Only

echo ==========================================
echo SeaTrace Frontend - Starting...
echo ==========================================
echo.

cd seatrace-frontend

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    call npm install
)

echo.
echo [INFO] Starting React development server...
echo [INFO] Frontend will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

npm start

pause

