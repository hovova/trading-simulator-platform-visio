@echo off
title Stop Visio Trading Simulator

echo ==========================================
echo   Stopping Visio Trading Simulator
echo ==========================================
echo.

taskkill /FI "WINDOWTITLE eq Visio Backend API*" /T /F
taskkill /FI "WINDOWTITLE eq Visio Frontend App*" /T /F

echo.
echo Servers stopped.
echo.
pause