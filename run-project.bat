@echo off
REM SeaTrace - Run Project Locally
REM Starts both backend and frontend servers

echo ==========================================
echo SeaTrace - Starting Local Development
echo ==========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [INFO] Starting Backend Server...
echo.
start "SeaTrace Backend" cmd /k "cd backend && python start.py"

timeout /t 3 /nobreak >nul

echo [INFO] Starting Frontend Server...
echo.
start "SeaTrace Frontend" cmd /k "cd seatrace-frontend && npm start"

echo.
echo ==========================================
echo Servers Starting...
echo ==========================================
echo.
echo Backend: http://localhost:10000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit (servers will continue running)...
pause >nul

