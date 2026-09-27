@echo off
title BeautyTry Auto Updater
echo ===================================================
echo   Updating BeautyTry to the latest version...
echo ===================================================
echo.

echo [1/4] Stashing any local changes to prevent conflicts...
git stash

echo.
echo [2/4] Pulling latest code from GitHub...
git pull

echo.
echo [3/4] Updating Backend Dependencies...
cd backend
IF EXIST "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
    python -m pip install --upgrade pip
    pip install -r requirements.txt
) ELSE (
    echo [INFO] Backend virtual environment not found. auto_run.bat will create it!
)
cd ..

echo.
echo [4/4] Updating Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo ===================================================
echo   Update Complete! You can now run auto_run.bat
echo ===================================================
pause
