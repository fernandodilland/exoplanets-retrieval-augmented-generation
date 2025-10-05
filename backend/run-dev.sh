#!/bin/bash
# Linux/Ubuntu development startup script

echo "Starting Exoplanets RAG API (Development)..."
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Set environment
export ENVIRONMENT=development

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "ERROR: Virtual environment does not exist"
    echo "Please run: ./setup-environment.sh"
    exit 1
fi

# Check if Python exists in venv
if [ ! -f "venv/bin/python" ]; then
    echo "ERROR: Python not found in virtual environment"
    echo "Please run: ./setup-environment.sh"
    exit 1
fi

echo "[INFO] Virtual environment found"
echo "[INFO] Verifying Python installation in venv..."

# Verify Python using full path
venv/bin/python --version
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to execute Python"
    echo "Please reinstall Python and run: ./setup-environment.sh"
    exit 1
fi

echo "[INFO] Python verified successfully"
echo "[INFO] Verifying uvicorn..."

# Verify uvicorn is installed
venv/bin/python -c "import uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "ERROR: uvicorn is not installed"
    echo "Installing dependencies..."
    venv/bin/pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

# Start the server
echo ""
echo "============================================"
echo " Server started successfully"
echo "============================================"
echo ""
echo "URL: http://0.0.0.0:2090"
echo "Documentation: http://0.0.0.0:2090/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
venv/bin/uvicorn main:app --host 0.0.0.0 --port 2090 --reload
