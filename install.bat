@echo off
echo ==========================================
echo       Installing NOVA AI CLI Assistant
echo ==========================================

:: Check if python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH.
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b %errorlevel%
)

:: Create Virtual Environment
if not exist .venv (
    echo Creating virtual environment...
    python -m venv .venv
) else (
    echo Virtual environment already exists.
)

:: Activate Virtual Environment
echo Activating virtual environment...
call .venv\Scripts\activate.bat

:: Install Requirements
echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing dependencies...
pip install -r requirements.txt

:: Setup .env file
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
) else (
    echo .env file already exists.
)

echo.
echo ==========================================
echo   NOVA AI installation complete!
echo   Run 'run.bat' to start the assistant.
echo ==========================================
pause
