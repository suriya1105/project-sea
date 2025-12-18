@echo off
REM SeaTrace - Easy Start Script
echo ==========================================
echo SeaTrace - Starting Application
echo ==========================================
echo.

echo [1/2] Starting Backend Server...
start "SeaTrace Backend" cmd /k "cd backend && python start.py"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "SeaTrace Frontend" cmd /k "cd seatrace-frontend && npm start"

echo.
echo ==========================================
echo Application Started Successfully!
echo ==========================================
echo.
echo Backend API: http://localhost:10000
echo Frontend App: http://localhost:3000
echo.
echo Demo Accounts (no password required):
echo - Admin: admin@seatrace.com
echo - Operator: operator@seatrace.com
echo - Viewer: viewer@seatrace.com
echo.
echo Press any key to close this window...
pause >nul