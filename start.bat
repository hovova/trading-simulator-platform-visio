@echo off
title Visio Trading Simulator Launcher

echo ==========================================
echo   Starting Visio Trading Simulator
echo ==========================================
echo.

echo Starting backend server...
start "Visio Backend API" cmd /k "cd /d %~dp0backend && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload"

echo Starting frontend server...
start "Visio Frontend App" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Waiting for servers to start...
timeout /t 6 /nobreak >nul

echo Opening browser tabs...
start "" "http://localhost:5173/"
start "" "http://127.0.0.1:8000/docs"

echo.
echo Backend API:  http://127.0.0.1:8000/docs
echo Frontend App: http://localhost:5173/
echo.
echo Servers are running in separate windows.
echo Use stop.bat to stop them.
echo.
pause