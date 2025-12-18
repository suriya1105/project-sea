@echo off
REM SeaTrace - Status Check Script
echo ==========================================
echo SeaTrace - System Status Check
echo ==========================================
echo.

echo [1/3] Checking Backend Server...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:10000/api/dashboard-data' -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host '✅ Backend: RUNNING' -ForegroundColor Green } else { Write-Host '❌ Backend: ERROR' -ForegroundColor Red } } catch { Write-Host '❌ Backend: NOT RUNNING' -ForegroundColor Red }"

echo.
echo [2/3] Checking Frontend Server...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5; if ($response.StatusCode -eq 200) { Write-Host '✅ Frontend: RUNNING' -ForegroundColor Green } else { Write-Host '❌ Frontend: ERROR' -ForegroundColor Red } } catch { Write-Host '❌ Frontend: NOT RUNNING' -ForegroundColor Red }"

echo.
echo [3/3] Checking Authentication...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:10000/api/auth/login' -Method POST -Body '{\"email\":\"admin@seatrace.com\"}' -ContentType 'application/json' -TimeoutSec 5; $data = $response.Content | ConvertFrom-Json; if ($data.token) { Write-Host '✅ Authentication: WORKING' -ForegroundColor Green } else { Write-Host '❌ Authentication: ERROR' -ForegroundColor Red } } catch { Write-Host '❌ Authentication: FAILED' -ForegroundColor Red }"

echo.
echo ==========================================
echo Access URLs:
echo ==========================================
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:10000
echo.
echo Demo Accounts (click buttons on login page):
echo - Admin: admin@seatrace.com
echo - Operator: operator@seatrace.com
echo - Viewer: viewer@seatrace.com
echo.
pause