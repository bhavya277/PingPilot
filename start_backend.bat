@echo off
echo ==============================================
echo   Starting PingPilot FastAPI Backend Server
echo ==============================================
cd /d "%~dp0"
if exist "backend\venv\Scripts\activate.bat" (
    call backend\venv\Scripts\activate.bat
    python backend\run.py
) else (
    python backend\run.py
)
pause
