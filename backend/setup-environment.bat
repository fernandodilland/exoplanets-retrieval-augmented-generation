@echo off
echo ============================================
echo  CONFIGURACION DEL ENTORNO DE DESARROLLO
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Verificando Python...
python --version
if errorlevel 1 (
    echo ERROR: Python no esta instalado o no esta en el PATH
    echo Por favor ejecuta: fix-python-install.bat
    pause
    exit /b 1
)

echo.
echo [2/4] Eliminando entorno virtual anterior (si existe)...
if exist venv (
    rmdir /s /q venv
    echo Entorno virtual anterior eliminado
)

echo.
echo [3/4] Creando nuevo entorno virtual...
python -m venv venv
if errorlevel 1 (
    echo ERROR: No se pudo crear el entorno virtual
    echo Por favor reinstala Python usando: fix-python-install.bat
    pause
    exit /b 1
)

echo.
echo [4/4] Instalando dependencias...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo ============================================
echo  CONFIGURACION COMPLETADA CON EXITO
echo ============================================
echo.
echo Para activar el entorno virtual manualmente:
echo   venv\Scripts\activate.bat
echo.
echo Para ejecutar el servidor:
echo   uvicorn main:app --host 0.0.0.0 --port 2090 --reload
echo.
pause
