#!/bin/bash
# Script de configuración del entorno Python para el backend

echo "============================================"
echo " CONFIGURACION DEL ENTORNO DE DESARROLLO"
echo "============================================"
echo ""

# Change to script directory
cd "$(dirname "$0")"

# Verificar Python
echo "[1/4] Verificando Python..."
python3 --version
if [ $? -ne 0 ]; then
    echo "ERROR: Python3 no está instalado o no está en el PATH"
    echo "Por favor instala Python 3.11 o superior:"
    echo "  Ubuntu/Debian: sudo apt install python3 python3-venv python3-pip"
    echo "  Fedora/RHEL: sudo dnf install python3 python3-venv python3-pip"
    exit 1
fi
echo "✓ Python encontrado"

# Eliminar entorno virtual anterior
echo ""
echo "[2/4] Eliminando entorno virtual anterior (si existe)..."
if [ -d "venv" ]; then
    rm -rf venv
    echo "✓ Entorno virtual anterior eliminado"
else
    echo "✓ No hay entorno virtual anterior"
fi

# Crear nuevo entorno virtual
echo ""
echo "[3/4] Creando nuevo entorno virtual..."
python3 -m venv venv
if [ $? -ne 0 ]; then
    echo "ERROR: No se pudo crear el entorno virtual"
    echo "Por favor instala python3-venv:"
    echo "  Ubuntu/Debian: sudo apt install python3-venv"
    exit 1
fi
echo "✓ Entorno virtual creado exitosamente"

# Instalar dependencias
echo ""
echo "[4/4] Instalando dependencias..."
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "============================================"
echo " CONFIGURACION COMPLETADA CON EXITO"
echo "============================================"
echo ""
echo "Para activar el entorno virtual manualmente:"
echo "  source venv/bin/activate"
echo ""
echo "Para ejecutar el servidor:"
echo "  ./run-dev.sh"
echo ""
