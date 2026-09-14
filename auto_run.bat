@echo off
title BeautyTry Launcher
echo Starting BeautyTry Application...

:: --- BACKEND SETUP ---
echo.
echo Checking Backend Environment...
cd /d "%~dp0backend"
IF NOT EXIST "venv\Scripts\activate.bat" (
    echo [INFO] Virtual environment not found. Creating one now...
    python -m venv venv
    echo [INFO] Installing backend dependencies...
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
) ELSE (
    echo [INFO] Backend virtual environment found.
)

:: Start the Backend in a new terminal window
echo Starting Backend Server...
start "BeautyTry Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate && python main.py"

:: --- FRONTEND SETUP ---
echo.
echo Checking Frontend Environment...
cd /d "%~dp0frontend"
IF NOT EXIST "node_modules\" (
    echo [INFO] Node modules not found. Installing frontend dependencies...
    call npm install
) ELSE (
    echo [INFO] Frontend node_modules found.
)

:: Start the Frontend in the current terminal window
echo.
echo Starting Frontend Server...
call npm run dev -- --host

pause