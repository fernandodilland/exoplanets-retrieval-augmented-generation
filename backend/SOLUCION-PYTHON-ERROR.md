# 🔧 Solución para Error: "Could not find platform independent libraries"

## 📋 Problema Detectado

Tu instalación de Python 3.13 está **corrupta**. Específicamente, el directorio `C:\Python313\Lib` no existe, lo cual es crítico para el funcionamiento de Python.

## ✅ Solución Paso a Paso

### Paso 1: Desinstalar Python Corrupto

1. Presiona `Win + R` y escribe `appwiz.cpl` y presiona Enter
2. Busca "Python 3.13" en la lista
3. Haz clic derecho y selecciona "Desinstalar"
4. Sigue las instrucciones del desinstalador

### Paso 2: Descargar Python Estable

1. Ve a: https://www.python.org/downloads/
2. Descarga **Python 3.12.x** (versión estable recomendada)
3. **NO descargues Python 3.13** ya que puede tener problemas en Windows

### Paso 3: Instalar Python Correctamente

1. Ejecuta el instalador descargado
2. **IMPORTANTE:** Marca las siguientes casillas:
   - ✅ **Add Python to PATH** (fundamental)
   - ✅ Install for all users (opcional, pero recomendado)
3. Haz clic en **"Install Now"**
4. Espera a que termine la instalación
5. Reinicia tu terminal (cierra y abre VS Code)

### Paso 4: Configurar el Entorno del Proyecto

Después de instalar Python correctamente, ejecuta:

**Opción A - Usando CMD:**
```cmd
cd C:\git\exoplanets-retrieval-augmented-generation\backend
setup-environment.bat
```

**Opción B - Usando PowerShell:**
```powershell
cd C:\git\exoplanets-retrieval-augmented-generation\backend
.\setup-environment.ps1
```

Este script:
- ✓ Verificará que Python esté instalado correctamente
- ✓ Eliminará el entorno virtual corrupto
- ✓ Creará un nuevo entorno virtual limpio
- ✓ Instalará todas las dependencias necesarias

### Paso 5: Ejecutar el Servidor

Una vez completada la configuración:

```cmd
cd C:\git\exoplanets-retrieval-augmented-generation\backend
venv\Scripts\activate.bat
uvicorn main:app --host 0.0.0.0 --port 2090 --reload
```

O simplemente ejecuta:
```cmd
run-dev.bat
```

## 🚀 Solución Rápida (Si ya tienes Python instalado correctamente)

Si ya reinstalaste Python y solo necesitas configurar el entorno:

```cmd
cd C:\git\exoplanets-retrieval-augmented-generation\backend
setup-environment.bat
```

## ⚠️ Problemas Comunes

### "python no se reconoce como un comando"
- **Causa:** Python no está en el PATH
- **Solución:** Reinstala Python y asegúrate de marcar "Add Python to PATH"

### "Could not find platform independent libraries"
- **Causa:** Instalación de Python corrupta (falta el directorio Lib)
- **Solución:** Desinstala completamente Python y reinstala siguiendo los pasos anteriores

### "No module named 'fastapi'"
- **Causa:** Las dependencias no están instaladas en el entorno virtual
- **Solución:** Ejecuta `setup-environment.bat` para instalar las dependencias

## 📝 Verificación

Para verificar que todo está correcto:

```cmd
python --version
# Debe mostrar: Python 3.12.x

python -c "import sys; print(sys.prefix)"
# Debe mostrar una ruta válida sin errores

pip list
# Debe mostrar los paquetes instalados
```

## 🆘 Si nada funciona

Si después de seguir todos los pasos sigues teniendo problemas:

1. Desinstala **todas** las versiones de Python de tu sistema
2. Elimina manualmente estas carpetas (si existen):
   - `C:\Python313`
   - `C:\Python312`
   - `C:\Python311`
3. Descarga Python 3.12.x desde python.org
4. Instala con la opción "Add to PATH" marcada
5. Reinicia tu computadora
6. Ejecuta `setup-environment.bat`

## 📞 Soporte

Si necesitas más ayuda, revisa:
- La documentación oficial de Python: https://docs.python.org/
- El archivo `requirements.txt` para ver las dependencias requeridas
