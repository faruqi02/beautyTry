@echo off
echo Starting BeautyTry Application...

:: Start the Backend in a new terminal window
start "BeautyTry Backend" cmd /k "cd /d "D:\FYP Consultation\beautyTry\backend" && call venv\Scripts\activate && python main.py"

:: Start the Frontend in the current terminal window
echo Starting Frontend...
cd /d "D:\FYP Consultation\beautyTry\frontend"
call npm run dev -- --host
pause