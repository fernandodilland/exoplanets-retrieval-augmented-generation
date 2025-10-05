# Ejemplos de Requests - Exoplanets Backend API

Colección de ejemplos de requests usando `curl` y `httpx` (Python) para probar el backend.

## 🔧 Usando curl (Terminal)

### 1. Health Check

```bash
# Root endpoint
curl http://localhost:2090/

# Swagger docs (abrir en navegador)
start http://localhost:2090/docs
```

### 2. Login

```bash
curl -X POST http://localhost:2090/api/login \
  -H "Content-Type: application/json" \
  -d "{\"user\":\"admin\",\"password\":\"tu_password\",\"turnstile_token\":\"dev-token\"}"
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Guarda el token para los siguientes requests:**
```bash
set TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Upload File

```bash
curl -X POST http://localhost:2090/api/upload \
  -H "Authorization: Bearer %TOKEN%" \
  -F "file=@C:\ruta\a\tu\archivo.pdf"
```

### 4. Submit AI Request

```bash
curl -X POST http://localhost:2090/api/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer %TOKEN%" \
  -d "{\"question\":\"¿Qué es un exoplaneta?\"}"
```

### 5. Get Files (Public)

```bash
# Listar archivos con paginación
curl "http://localhost:2090/api/files?limit=10&offset=0"

# Contar archivos
curl http://localhost:2090/api/files/count
```

### 6. Get Results (Public)

```bash
# Listar respuestas con paginación
curl "http://localhost:2090/api/results?limit=10&offset=0"

# Contar respuestas
curl http://localhost:2090/api/results/count
```

## 🐍 Usando Python (httpx)

### Setup

```bash
pip install httpx
```

### Script de Prueba Completo

```python
import httpx
import asyncio

BASE_URL = "http://localhost:2090"

async def test_backend():
    async with httpx.AsyncClient() as client:
        # 1. Health check
        print("1. Health check...")
        response = await client.get(f"{BASE_URL}/")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.json()}\n")
        
        # 2. Login
        print("2. Login...")
        login_data = {
            "user": "admin",
            "password": "tu_password",
            "turnstile_token": "dev-token"
        }
        response = await client.post(f"{BASE_URL}/api/login", json=login_data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            token = response.json()["access_token"]
            print(f"   Token obtenido: {token[:50]}...\n")
            
            # Headers con token
            headers = {"Authorization": f"Bearer {token}"}
            
            # 3. Submit AI request
            print("3. Submit AI request...")
            question_data = {"question": "¿Qué es un exoplaneta?"}
            response = await client.post(
                f"{BASE_URL}/api/request", 
                json=question_data,
                headers=headers
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}\n")
            
            # 4. Upload file (ejemplo con archivo de texto)
            print("4. Upload file...")
            test_file_content = b"Este es un archivo de prueba sobre exoplanetas."
            files = {"file": ("test.txt", test_file_content, "text/plain")}
            response = await client.post(
                f"{BASE_URL}/api/upload",
                files=files,
                headers=headers
            )
            print(f"   Status: {response.status_code}")
            print(f"   Response: {response.json()}\n")
        else:
            print(f"   Login failed: {response.json()}\n")
        
        # 5. Get files (public)
        print("5. Get files...")
        response = await client.get(f"{BASE_URL}/api/files?limit=5")
        print(f"   Status: {response.status_code}")
        files = response.json()
        print(f"   Files count: {len(files)}")
        for file in files[:3]:
            print(f"   - {file.get('uid')}: {file.get('url')}")
        print()
        
        # 6. Get files count
        print("6. Get files count...")
        response = await client.get(f"{BASE_URL}/api/files/count")
        print(f"   Status: {response.status_code}")
        print(f"   Total files: {response.json()['total']}\n")
        
        # 7. Get results (public)
        print("7. Get results...")
        response = await client.get(f"{BASE_URL}/api/results?limit=5")
        print(f"   Status: {response.status_code}")
        results = response.json()
        print(f"   Results count: {len(results)}")
        for result in results[:3]:
            print(f"   - {result.get('uid')}: {result.get('question')[:50]}...")
        print()
        
        # 8. Get results count
        print("8. Get results count...")
        response = await client.get(f"{BASE_URL}/api/results/count")
        print(f"   Status: {response.status_code}")
        print(f"   Total results: {response.json()['total']}\n")

if __name__ == "__main__":
    print("=== Testing Exoplanets Backend API ===\n")
    asyncio.run(test_backend())
    print("=== Tests completed ===")
```

### Ejecutar el script

```bash
python test_backend.py
```

## 🧪 Tests con Pytest

### Crear archivo de tests

Crea `backend/tests/test_api.py`:

```python
import pytest
from httpx import AsyncClient
from main import app

@pytest.mark.asyncio
async def test_root():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        assert "message" in response.json()

@pytest.mark.asyncio
async def test_login_invalid():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post("/api/login", json={
            "user": "invalid",
            "password": "invalid",
            "turnstile_token": "dev-token"
        })
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_files_public():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/files")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_files_count():
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/files/count")
        assert response.status_code == 200
        assert "total" in response.json()
```

### Ejecutar tests

```bash
cd backend
pytest tests/ -v
```

## 📊 Responses Esperadas

### Login Exitoso (200)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTcwMTIzNDU2Nn0.abc123",
  "token_type": "bearer"
}
```

### Login Fallido (401)

```json
{
  "detail": "Invalid credentials"
}
```

### Upload Exitoso (200)

```json
{
  "uid": "123e4567-e89b-12d3-a456-426614174000",
  "user_id": 1,
  "url": "https://public-files-exoplanets.fernandodilland.com/uploads/admin/20251004_123456_document.pdf",
  "created_at": "2025-10-04T12:34:56"
}
```

### Upload con Archivo muy Grande (400)

```json
{
  "detail": "File too large. Maximum size is 4MB"
}
```

### Request sin Autenticación (401)

```json
{
  "detail": "Not authenticated"
}
```

### Get Files (200)

```json
[
  {
    "uid": "123e4567-e89b-12d3-a456-426614174000",
    "user_id": 1,
    "url": "https://public-files-exoplanets.fernandodilland.com/uploads/admin/document.pdf",
    "created_at": "2025-10-04T12:34:56"
  }
]
```

### Get Count (200)

```json
{
  "total": 42
}
```

## 🔍 Debugging Tips

### Ver logs del servidor

Los logs de uvicorn mostrarán todas las peticiones:

```
INFO:     127.0.0.1:12345 - "POST /api/login HTTP/1.1" 200 OK
INFO:     127.0.0.1:12345 - "GET /api/files HTTP/1.1" 200 OK
```

### Activar logs detallados

En `main.py`, puedes agregar más logging:

```python
import logging

logging.basicConfig(level=logging.DEBUG)
```

### Verificar JWT Token

Usa [jwt.io](https://jwt.io) para decodificar y verificar el contenido del token.

### Probar con Swagger

La forma más fácil de probar es usando Swagger UI:

```
http://localhost:2090/docs
```

Ahí puedes:
1. Probar cada endpoint
2. Ver los schemas de request/response
3. Autorizar con el token JWT
4. Ver ejemplos y documentación

---

**Nota**: Recuerda que algunos endpoints tienen código comentado (R2 upload, Cloudflare AI) que debe ser activado cuando esté listo.
