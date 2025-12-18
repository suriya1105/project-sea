@echo off
REM SeaTrace - Start Project (Backend + Frontend)
REM Opens two separate windows for backend and frontend

echo ==========================================
echo SeaTrace - Starting Development Servers
echo ==========================================
echo.

REM Start Backend in new window
echo [1/2] Starting Backend Server...
start "SeaTrace Backend - Port 5000" cmd /k "cd /d %~dp0backend && python run_dev.py"

REM Wait a bit for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend in new window
echo [2/2] Starting Frontend Server...
start "SeaTrace Frontend - Port 3000" cmd /k "cd /d %~dp0seatrace-frontend && npm start"

echo.
echo ==========================================
echo Servers Starting in Separate Windows
echo ==========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo API Health Check: http://localhost:5000/api/health
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause

