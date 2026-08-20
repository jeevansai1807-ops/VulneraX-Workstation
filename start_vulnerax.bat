@echo off
echo.
echo  ╔══════════════════════════════════════════════╗
echo  ║         VulneraX Launcher                    ║
echo  ╚══════════════════════════════════════════════╝
echo.

if "%1"=="--desktop" goto desktop_mode

:browser_mode
echo [MODE] Browser mode (default)
echo.

echo Starting Backend API...
start "VulneraX Backend" cmd.exe /k "cd backend && .\.venv\Scripts\python.exe -X faulthandler -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo Starting Frontend Dashboard...
start "VulneraX Frontend" cmd.exe /k "cd frontend && npm run dev -- --host --port 5175"

echo Waiting for services to start...
timeout /t 5 /nobreak >nul

echo Opening browser...
start http://localhost:5175

echo VulneraX is running in the newly opened windows!
echo Close this window to exit the launcher (the servers will keep running in their own windows).
pause
goto end

:desktop_mode
echo [MODE] Desktop application (PyWebView)
echo.

REM Use the backend venv if it exists, otherwise use system Python
if exist "backend\.venv\Scripts\python.exe" (
    set PYTHON=backend\.venv\Scripts\python.exe
) else (
    set PYTHON=python
)

echo Starting VulneraX Desktop...
%PYTHON% main_desktop.py
echo.
echo VulneraX Desktop has exited.
pause

:end
