@echo off
setlocal

cd /d "%~dp0"

where python >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed or not on PATH.
    echo Install Python from https://www.python.org/downloads/
    echo Then run this launcher again.
    pause
    exit /b 1
)

python "%~dp0daily_log.py"
if %errorlevel% neq 0 (
    echo.
    echo The daily log script failed.
    echo Check the message above, then press any key to close.
    pause
    exit /b %errorlevel%
)

echo.
echo Daily log completed successfully.
pause
