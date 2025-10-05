@echo off
REM Windows production startup script

echo Starting Exoplanets RAG API (Production)...
echo.

REM Set working directory to script location
cd /d "%~dp0"

REM Set environment
set ENVIRONMENT=production

REM Check if venv exists
if not exist venv (
    echo ERROR: El entorno virtual no existe
    echo Por favor ejecuta: setup-environment.bat
    pause
    exit /b 1
)

REM Check if Python exists in venv
if not exist "venv\Scripts\python.exe" (
    echo ERROR: Python no existe en el entorno virtual
    echo Por favor ejecuta: setup-environment.bat
    pause
    exit /b 1
)

echo [INFO] Entorno virtual encontrado
echo [INFO] Verificando instalacion de Python en venv...

REM Verify Python using full path
"venv\Scripts\python.exe" --version
if errorlevel 1 (
    echo ERROR: Fallo al ejecutar Python
    echo Por favor reinstala Python y ejecuta: setup-environment.bat
    pause
    exit /b 1
)

echo [INFO] Python verificado correctamente
echo [INFO] Verificando uvicorn...

REM Verify uvicorn is installed
"venv\Scripts\python.exe" -c "import uvicorn" >nul 2>&1
if errorlevel 1 (
    echo ERROR: uvicorn no esta instalado
    echo Instalando dependencias...
    "venv\Scripts\pip.exe" install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Fallo al instalar dependencias
        pause
        exit /b 1
    )
)

REM Start the server
echo.
echo ============================================
echo  Servidor iniciado correctamente (PRODUCCION)
echo ============================================
echo.
echo URL: http://0.0.0.0:2090
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
"venv\Scripts\uvicorn.exe" main:app --host 0.0.0.0 --port 2090
