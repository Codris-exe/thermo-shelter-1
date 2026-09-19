#!/usr/bin/env bash

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
VENV_DIR="$BACKEND_DIR/.venv"

echo ""
echo "=========================================="
echo "        THERMO SHELTER 1"
echo "=========================================="
echo ""

# --------------------------------------------------
# Check backend virtual environment
# --------------------------------------------------

if [ ! -d "$VENV_DIR" ]; then
    echo "Backend virtual environment not found."
    echo "Creating backend virtual environment..."
    python -m venv "$VENV_DIR"
fi

# --------------------------------------------------
# Activate backend environment
# --------------------------------------------------

source "$VENV_DIR/bin/activate"

echo "Checking backend dependencies..."

python -m pip install -q -r "$BACKEND_DIR/requirements.txt"

# --------------------------------------------------
# Check frontend dependencies
# --------------------------------------------------

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo "Frontend node_modules not found."
    echo "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    npm install
fi

# --------------------------------------------------
# Cleanup function
# --------------------------------------------------

cleanup() {
    echo ""
    echo "Stopping Thermo Shelter 1..."

    if [ -n "${BACKEND_PID:-}" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi

    if [ -n "${FRONTEND_PID:-}" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi

    echo "Thermo Shelter 1 stopped."
}

trap cleanup SIGINT SIGTERM EXIT

# --------------------------------------------------
# Start backend
# --------------------------------------------------

echo ""
echo "Starting FastAPI backend..."

cd "$BACKEND_DIR"

python -m uvicorn app.main:app \
    --reload \
    --host 0.0.0.0 \
    --port 8000 &

BACKEND_PID=$!

# --------------------------------------------------
# Start frontend
# --------------------------------------------------

echo "Starting Next.js frontend..."

cd "$FRONTEND_DIR"

npm run dev &

FRONTEND_PID=$!

# --------------------------------------------------
# Startup information
# --------------------------------------------------

echo ""
echo "=========================================="
echo "Services started"
echo "=========================================="
echo ""
echo "Frontend:"
echo "  http://localhost:3000"
echo ""
echo "Simulator:"
echo "  http://localhost:3000/3d"
echo ""
echo "Backend:"
echo "  http://localhost:8000"
echo ""
echo "API Docs:"
echo "  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both services."
echo ""

# --------------------------------------------------
# Keep script alive
# --------------------------------------------------

wait