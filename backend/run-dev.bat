@echo off
REM Windows development startup script

echo Starting Exoplanets RAG API (Development)...
echo.

REM Set working directory to script location
cd /d "%~dp0"

REM Set environment
set ENVIRONMENT=development

REM Check if venv exists
if not exist venv (
    echo ERROR: El entorno virtual no existe
    echo Por favor ejecuta setup-environment.bat primero
    echo.
    pause
    exit /b 1
)

REM Check if Python exists in venv
if not exist "venv\Scripts\python.exe" (
    echo ERROR: Python no se encuentra en el entorno virtual
    echo Por favor ejecuta setup-environment.bat para reinstalar
    echo.
    pause
    exit /b 1
)

echo [INFO] Entorno virtual encontrado
echo [INFO] Verificando instalacion de Python en venv...

REM Verify Python using full path
"venv\Scripts\python.exe" --version
if errorlevel 1 (
    echo ERROR: Python en el entorno virtual esta corrupto
    echo Por favor ejecuta setup-environment.bat para reinstalar
    echo.
    pause
    exit /b 1
)

echo [INFO] Python verificado correctamente
echo [INFO] Verificando uvicorn...

REM Verify uvicorn is installed
"venv\Scripts\python.exe" -c "import uvicorn" >nul 2>&1
if errorlevel 1 (
    echo [WARN] uvicorn no esta instalado
    echo [INFO] Instalando dependencias...
    echo.
    "venv\Scripts\pip.exe" install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: No se pudieron instalar las dependencias
        echo.
        pause
        exit /b 1
    )
)

REM Start the server
echo.
echo ============================================
echo  Servidor iniciado correctamente
echo ============================================
echo.
echo URL: http://0.0.0.0:2090
echo Documentacion: http://0.0.0.0:2090/docs
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
"venv\Scripts\uvicorn.exe" main:app --host 0.0.0.0 --port 2090 --reload
