@echo off
title BeautyTry Auto-Updater
cd /d "%~dp0"

echo ==========================================
echo   Pulling latest updates from GitHub...
echo ==========================================

:: 1. Save any local modifications safely to prevent merge conflicts
git stash

:: 2. Pull the latest code from the repository
git pull

:: 3. Restore the local modifications (if there were any)
git stash pop

echo.
echo ==========================================
echo   Updating Backend Dependencies...
echo ==========================================
cd backend
call venv\Scripts\activate
pip install -r requirements.txt
cd ..

echo.
echo ==========================================
echo   Updating Frontend Dependencies...
echo ==========================================
cd frontend
call npm install
cd ..

echo.
echo ==========================================
echo   Update Successfully Completed!
echo ==========================================
echo You can now start the application using auto_run.bat
pause
