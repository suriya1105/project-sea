@echo off
REM SeaTrace - Quick Start Script
REM Run this to start both backend and frontend

cls
echo.
echo ==========================================
echo   SeaTrace - Real-Time Maritime Monitoring
echo ==========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Please install Python 3.9+
    pause
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found! Please install Node.js 14+
    pause
    exit /b 1
)

echo [INFO] Starting Backend Server (Port 5000)...
start "SeaTrace Backend" cmd /k "cd /d %~dp0backend && python run_dev.py"

echo [INFO] Waiting for backend to start...
timeout /t 4 /nobreak >nul

echo [INFO] Starting Frontend Server (Port 3000)...
start "SeaTrace Frontend" cmd /k "cd /d %~dp0seatrace-frontend && npm start"

echo.
echo ==========================================
echo   Servers Starting!
echo ==========================================
echo.
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo.
echo   Open your browser to: http://localhost:3000
echo.
echo   Both servers are running in separate windows.
echo   Close those windows to stop the servers.
echo.
echo ==========================================
echo.
pause

