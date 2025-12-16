@echo off
REM SeaTrace Web Application Setup Script for Windows
REM This script sets up the complete SeaTrace application

echo.
echo ========================================
echo SeaTrace - Setup and Installation
echo ========================================
echo.

REM Check if Python is installed
echo Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python 3.8 or higher.
    exit /b 1
)
echo [OK] Python installed
echo.

REM Check if Node.js is installed
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js 16 or higher.
    exit /b 1
)
echo [OK] Node.js installed
echo.

REM Setup Backend
echo Setting up Backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

echo [OK] Backend setup complete
echo.

REM Setup Frontend
echo Setting up Frontend...
cd ..\seatrace-frontend

REM Install Node dependencies
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    call npm install
)

echo [OK] Frontend setup complete
echo.

echo.
echo ========================================
echo [OK] Setup Complete!
echo ========================================
echo.
echo To start the application:
echo.
echo Terminal 1 - Backend:
echo   cd backend
echo   venv\Scripts\activate.bat
echo   python app.py
echo.
echo Terminal 2 - Frontend:
echo   cd seatrace-frontend
echo   npm start
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
