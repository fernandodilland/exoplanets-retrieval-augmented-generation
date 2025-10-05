# Script de configuración del entorno Python para el backend
Write-Host "============================================" -ForegroundColor Cyan
Write-Host " CONFIGURACION DEL ENTORNO DE DESARROLLO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

# Verificar Python
Write-Host "[1/4] Verificando Python..." -ForegroundColor Yellow
try {
    $pythonVersion = & python --version 2>&1
    Write-Host "✓ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: Python no esta instalado o no esta en el PATH" -ForegroundColor Red
    Write-Host "Por favor ejecuta: .\fix-python-install.bat" -ForegroundColor Red
    pause
    exit 1
}

# Eliminar entorno virtual anterior
Write-Host ""
Write-Host "[2/4] Eliminando entorno virtual anterior (si existe)..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Remove-Item -Recurse -Force venv
    Write-Host "✓ Entorno virtual anterior eliminado" -ForegroundColor Green
} else {
    Write-Host "✓ No hay entorno virtual anterior" -ForegroundColor Green
}

# Crear nuevo entorno virtual
Write-Host ""
Write-Host "[3/4] Creando nuevo entorno virtual..." -ForegroundColor Yellow
try {
    & python -m venv venv
    Write-Host "✓ Entorno virtual creado exitosamente" -ForegroundColor Green
} catch {
    Write-Host "✗ ERROR: No se pudo crear el entorno virtual" -ForegroundColor Red
    Write-Host "Por favor reinstala Python usando: .\fix-python-install.bat" -ForegroundColor Red
    pause
    exit 1
}

# Instalar dependencias
Write-Host ""
Write-Host "[4/4] Instalando dependencias..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
& python -m pip install --upgrade pip
& pip install -r requirements.txt

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host " CONFIGURACION COMPLETADA CON EXITO" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Para activar el entorno virtual manualmente:" -ForegroundColor Cyan
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Para ejecutar el servidor:" -ForegroundColor Cyan
Write-Host "  uvicorn main:app --host 0.0.0.0 --port 2090 --reload" -ForegroundColor White
Write-Host ""
pause
