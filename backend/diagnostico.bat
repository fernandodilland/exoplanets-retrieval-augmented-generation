@echo off
title Diagnostico del Entorno Python
color 0A

echo.
echo ================================================================
echo             DIAGNOSTICO DEL ENTORNO PYTHON
echo ================================================================
echo.

echo [VERIFICACION 1] Verificando Python en el sistema...
echo ----------------------------------------------------------------
python --version 2>nul
if errorlevel 1 (
    echo [X] FALLO: Python no esta instalado o no esta en el PATH
    echo.
    echo Soluciones:
    echo 1. Instala Python desde https://www.python.org/downloads/
    echo 2. Asegurate de marcar "Add Python to PATH" durante la instalacion
    echo.
    goto :error
) else (
    echo [OK] Python encontrado
)
echo.

echo [VERIFICACION 2] Verificando version de Python...
echo ----------------------------------------------------------------
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Version: %PYTHON_VERSION%
echo [OK] Version detectada
echo.

echo [VERIFICACION 3] Verificando modulo venv...
echo ----------------------------------------------------------------
python -c "import venv" 2>nul
if errorlevel 1 (
    echo [X] FALLO: El modulo venv no esta disponible
    echo.
    echo Esto indica que Python esta corrupto o incompleto.
    echo Reinstala Python desde https://www.python.org/downloads/
    echo.
    goto :error
) else (
    echo [OK] Modulo venv disponible
)
echo.

echo [VERIFICACION 4] Verificando pip...
echo ----------------------------------------------------------------
python -m pip --version 2>nul
if errorlevel 1 (
    echo [!] ADVERTENCIA: pip no esta disponible
    echo Intentando instalar pip...
    python -m ensurepip --upgrade
) else (
    echo [OK] pip disponible
)
echo.

echo [VERIFICACION 5] Verificando directorio Lib de Python...
echo ----------------------------------------------------------------
python -c "import sys; import os; lib_path = os.path.join(sys.prefix, 'Lib'); print('Lib Path:', lib_path); print('Existe:', os.path.exists(lib_path))" 2>nul
if errorlevel 1 (
    echo [X] FALLO CRITICO: No se puede acceder al directorio Lib
    echo.
    echo Tu instalacion de Python esta CORRUPTA.
    echo DEBES reinstalar Python completamente.
    echo.
    goto :error
) else (
    echo [OK] Directorio Lib accesible
)
echo.

echo [VERIFICACION 6] Verificando entorno virtual del proyecto...
echo ----------------------------------------------------------------
if exist venv (
    echo [OK] Directorio venv existe
    if exist venv\Scripts\activate.bat (
        echo [OK] Script de activacion existe
    ) else (
        echo [X] FALLO: Script de activacion no encontrado
        echo El entorno virtual esta corrupto. Ejecuta setup-environment.bat
        goto :error
    )
) else (
    echo [!] ADVERTENCIA: No existe entorno virtual
    echo Necesitas ejecutar setup-environment.bat
)
echo.

echo ================================================================
echo                  DIAGNOSTICO COMPLETADO
echo ================================================================
echo.
echo RESUMEN:
echo --------
echo Todo parece estar correcto. Puedes ejecutar:
echo   setup-environment.bat  - Para configurar el entorno
echo   run-dev.bat           - Para iniciar el servidor
echo.
goto :end

:error
echo.
echo ================================================================
echo                      ERROR DETECTADO
echo ================================================================
echo.
echo Se encontraron problemas que deben ser corregidos.
echo.
echo PASOS A SEGUIR:
echo.
echo 1. Lee el archivo: SOLUCION-PYTHON-ERROR.md
echo 2. Desinstala Python 3.13 (esta corrupto)
echo 3. Instala Python 3.12.x desde python.org
echo 4. Ejecuta setup-environment.bat
echo.

:end
pause
