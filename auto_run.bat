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

:: --- CLOUDFLARE TUNNEL SETUP ---
echo.
echo Checking Cloudflare Tunnel...
where cloudflared >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [INFO] Cloudflare Tunnel is not installed.
    echo [INFO] Attempting to install Cloudflare Tunnel...
    winget install --id Cloudflare.cloudflared --accept-package-agreements --accept-source-agreements
) ELSE (
    echo [INFO] Cloudflare Tunnel is installed.
)

:: --- START ALL SERVICES IN ONE TERMINAL ---
echo.
echo =========================================================
echo Starting Backend, Frontend, and Cloudflare in ONE view...
echo =========================================================
echo.
cd /d "%~dp0"
call npx --yes concurrently -n "BACKEND,FRONTEND,TUNNEL" -c "bgBlue.bold,bgMagenta.bold,bgGreen.bold" "cd backend && call venv\Scripts\activate && python main.py" "cd frontend && npm run dev -- --host" "cd backend && call venv\Scripts\activate && cd .. && python run_tunnel.py"

pause