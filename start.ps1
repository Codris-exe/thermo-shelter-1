<#
.SYNOPSIS
    Thermo Shelter 1 - Windows PowerShell Startup Script
.DESCRIPTION
    Sets up virtual environment, installs dependencies, and launches
    both the FastAPI backend and Next.js frontend concurrently.
#>

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $ProjectRoot "backend"
$FrontendDir = Join-Path $ProjectRoot "frontend"
$VenvDir = Join-Path $BackendDir ".venv"

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "        THERMO SHELTER 1 (Windows)        " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Virtual Environment
if (-not (Test-Path $VenvDir)) {
    Write-Host "Backend virtual environment not found." -ForegroundColor Yellow
    Write-Host "Creating backend virtual environment at $VenvDir..." -ForegroundColor Yellow
    python -m venv $VenvDir
}

# 2. Determine python executable
$VenvPython = Join-Path $VenvDir "Scripts\python.exe"
if (-not (Test-Path $VenvPython)) {
    $VenvPython = "python"
}

Write-Host "Checking backend dependencies..." -ForegroundColor Green
& $VenvPython -m pip install -q -r (Join-Path $BackendDir "requirements.txt")

# 3. Check frontend dependencies
if (-not (Test-Path (Join-Path $FrontendDir "node_modules"))) {
    Write-Host "Frontend node_modules not found." -ForegroundColor Yellow
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location $FrontendDir
    npm install
    Pop-Location
}

# 4. Start backend
Write-Host ""
Write-Host "Starting FastAPI backend on port 8000..." -ForegroundColor Green
$BackendProcess = Start-Process -FilePath $VenvPython -ArgumentList "-m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000" -WorkingDirectory $BackendDir -PassThru

# 5. Start frontend
Write-Host "Starting Next.js frontend on port 3000..." -ForegroundColor Green
$FrontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -WorkingDirectory $FrontendDir -PassThru

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "       Services Started Successfully!     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Landing Page: http://localhost:3000" -ForegroundColor White
Write-Host "  3D Simulator: http://localhost:3000/3d" -ForegroundColor White
Write-Host "  FastAPI:      http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs:     http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to terminate both services." -ForegroundColor Yellow
Write-Host ""

try {
    while (-not $BackendProcess.HasExited -and -not $FrontendProcess.HasExited) {
        Start-Sleep -Seconds 1
    }
}
finally {
    Write-Host "`nStopping Thermo Shelter 1 services..." -ForegroundColor Red
    if ($BackendProcess -and -not $BackendProcess.HasExited) {
        Stop-Process -Id $BackendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    if ($FrontendProcess -and -not $FrontendProcess.HasExited) {
        Stop-Process -Id $FrontendProcess.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "Thermo Shelter 1 stopped." -ForegroundColor Red
}
