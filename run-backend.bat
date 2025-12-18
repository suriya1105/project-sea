@echo off
REM SeaTrace - Run Backend Only

echo ==========================================
echo SeaTrace Backend - Starting...
echo ==========================================
echo.

cd backend

REM Check if virtual environment exists
if exist "venv\Scripts\activate.bat" (
    echo [INFO] Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Check if dependencies are installed
if not exist "requirements.txt" (
    echo [ERROR] requirements.txt not found
    pause
    exit /b 1
)

echo [INFO] Installing/Checking dependencies...
pip install -q -r requirements.txt

echo.
echo [INFO] Starting Flask server...
echo [INFO] Backend will be available at: http://localhost:10000
echo [INFO] API Health Check: http://localhost:10000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

python start.py

pause

