@echo off
setlocal enabledelayedexpansion

set "PROJECT_ROOT=%~dp0"
set "BACKEND_DIR=%PROJECT_ROOT%backend"
set "FRONTEND_DIR=%PROJECT_ROOT%frontend"
set "VENV_DIR=%BACKEND_DIR%\.venv"

echo.
echo ==========================================
echo         THERMO SHELTER 1 (Windows)
echo ==========================================
echo.

:: 1. Check backend virtual environment
if not exist "%VENV_DIR%" (
    echo Backend virtual environment not found.
    echo Creating backend virtual environment at "%VENV_DIR%"...
    python -m venv "%VENV_DIR%"
)

:: 2. Determine python executable
if exist "%VENV_DIR%\Scripts\python.exe" (
    set "PYTHON_EXE=%VENV_DIR%\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

echo Checking backend dependencies...
"%PYTHON_EXE%" -m pip install -q -r "%BACKEND_DIR%\requirements.txt"

:: 3. Check frontend dependencies
if not exist "%FRONTEND_DIR%\node_modules" (
    echo Frontend node_modules not found.
    echo Installing frontend dependencies...
    pushd "%FRONTEND_DIR%"
    call npm install
    popd
)

echo.
echo ==========================================
echo           Starting Services
echo ==========================================
echo.
echo Frontend:   http://localhost:3000
echo Simulator:  http://localhost:3000/3d
echo Backend:    http://localhost:8000
echo API Docs:   http://localhost:8000/docs
echo.
echo Both services are opening in separate windows.
echo Close those windows or press any key here to stop.
echo ==========================================
echo.

:: Start FastAPI backend in its own cmd window
start "Thermo Shelter - Backend (FastAPI)" cmd /k "cd /d "%BACKEND_DIR%" && "%PYTHON_EXE%" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

:: Start Next.js frontend in its own cmd window
start "Thermo Shelter - Frontend (Next.js)" cmd /k "cd /d "%FRONTEND_DIR%" && npm run dev"

echo Services successfully launched!
echo Press any key to exit this launcher window...
pause >nul
