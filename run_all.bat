@echo off
echo ========================================================
echo   Launching PingPilot (AI Network Co-Pilot for Gamers)
echo ========================================================
cd /d "%~dp0"

echo [1/2] Launching Backend on http://127.0.0.1:8000 ...
start "PingPilot Backend" cmd /c "%~dp0start_backend.bat"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Frontend on http://localhost:5173 ...
start "PingPilot Frontend" cmd /c "%~dp0start_frontend.bat"

echo.
echo PingPilot is launching in separate console windows.
echo Frontend: http://localhost:5173
echo Backend API: http://127.0.0.1:8000/docs
echo.
pause
