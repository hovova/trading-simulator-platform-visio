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
echo Servers are starting in separate windows...
echo.
echo Backend API:  http://127.0.0.1:8000/docs
echo Frontend App: http://localhost:5173/
echo.
echo Wait a few seconds, then open the frontend link.
echo.
pause