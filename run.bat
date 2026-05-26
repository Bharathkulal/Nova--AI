@echo off
if exist .venv (
    call .venv\Scripts\activate.bat
)
python main.py
if exist .venv (
    call deactivate
)
pause
