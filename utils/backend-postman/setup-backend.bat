@echo off
REM Script de setup rápido para el backend
REM Este script configura el entorno virtual e instala las dependencias

echo ========================================
echo   Exoplanets RAG - Backend Setup
echo ========================================
echo.

cd /d "%~dp0..\..\backend"

echo [1/4] Verificando Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python no está instalado o no está en el PATH
    echo Por favor instala Python 3.11+ desde https://www.python.org/downloads/
    pause
    exit /b 1
)
python --version
echo.

echo [2/4] Creando entorno virtual...
if exist venv (
    echo Entorno virtual ya existe, saltando...
) else (
    python -m venv venv
    echo Entorno virtual creado exitosamente
)
echo.

echo [3/4] Activando entorno virtual...
call venv\Scripts\activate.bat
echo.

echo [4/4] Instalando dependencias...
pip install -r requirements.txt
echo.

echo ========================================
echo   Setup completado exitosamente!
echo ========================================
echo.
echo Próximos pasos:
echo 1. Configura tus variables en .env.development
echo 2. Inicializa la base de datos con los scripts SQL
echo 3. Ejecuta el backend desde VS Code (F5)
echo    o desde terminal: uvicorn main:app --host 0.0.0.0 --port 2090 --reload
echo.
echo Para activar el entorno virtual manualmente:
echo   venv\Scripts\activate
echo.
pause
