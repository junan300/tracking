@echo off
echo Starting Goal Tracker...
echo.
echo Choose an option:
echo 1. Web version (browser)
echo 2. Desktop app (Electron)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo Starting web version...
    npm run dev
) else if "%choice%"=="2" (
    echo Building and starting desktop app...
    npm start
) else (
    echo Invalid choice. Starting web version by default...
    npm run dev
)

pause
