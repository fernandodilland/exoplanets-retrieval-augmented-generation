# Integración Frontend-Backend API

Este documento explica cómo se ha implementado la integración entre los frontends (público y admin) con el backend de FastAPI.

## 📋 Resumen de Cambios

### Frontend Admin (`frontend-admin/`)

#### Nuevos Archivos

1. **`src/js/api-config.js`** - Configuración centralizada de la API
   - Define `API_BASE_URL` (actualmente `http://localhost:8000`)
   - Contiene todos los endpoints disponibles
   - Fácil de actualizar para producción

2. **`src/js/auth-utils.js`** - Utilidades de autenticación
   - Manejo de JWT en cookies seguras
   - Decodificación de tokens
   - Gestión automática de expiración basada en el payload del JWT
   - Funciones: `saveToken()`, `getToken()`, `removeToken()`, `isAuthenticated()`, `getUserInfo()`, `getAuthHeaders()`

3. **`src/js/api-client.js`** - Cliente API para operaciones autenticadas
   - `login(username, password, turnstileToken)` - Login con Cloudflare Turnstile
   - `uploadFile(file, onProgress)` - Subir archivos a R2 con barra de progreso
   - `sendAIRequest(question)` - Enviar consultas al modelo AI
   - `getFiles()` - Obtener lista de archivos
   - `getResults()` - Obtener historial de resultados AI
   - `checkHealth()` - Verificar estado de la API

#### Archivos Modificados

1. **`src/js/login.js`**
   - ✅ Integra endpoint `POST /api/login`
   - ✅ Elimina datos hardcodeados
   - ✅ Guarda JWT en cookie segura con expiración automática
   - ✅ Maneja validación de Cloudflare Turnstile
   - ✅ Redirección automática si ya está autenticado

2. **`src/js/dashboard.js`**
   - ✅ Verifica autenticación al cargar la página
   - ✅ Integra `POST /api/upload` para subir archivos
   - ✅ Integra `POST /api/request` para consultas AI
   - ✅ Elimina todos los datos dummy
   - ✅ Manejo completo de errores con mensajes informativos
   - ✅ Función global `logout()` para cerrar sesión

3. **`src/acceso/index.html`**
   - Incluye nuevos scripts: `api-config.js`, `auth-utils.js`, `api-client.js`

4. **`src/index.html`**
   - Incluye nuevos scripts: `api-config.js`, `auth-utils.js`, `api-client.js`

### Frontend Public (`frontend-public/`)

#### Nuevos Archivos

1. **`src/js/api-config.js`** - Configuración centralizada de la API
   - Define `API_BASE_URL` (actualmente `http://localhost:8000`)
   - Contiene endpoints públicos

2. **`src/js/api-client.js`** - Cliente API para operaciones públicas
   - `getFiles(page, pageSize)` - Obtener archivos paginados
   - `getFilesCount()` - Obtener total de archivos
   - `getResults(page, pageSize)` - Obtener resultados AI paginados
   - `getResultsCount()` - Obtener total de resultados
   - `checkHealth()` - Verificar estado de la API

#### Archivos Modificados

1. **`src/js/main.js`**
   - ✅ Integra `GET /api/files` para listar archivos
   - ✅ Integra `GET /api/results` para listar resultados AI
   - ✅ Elimina todos los datos hardcodeados
   - ✅ Renderiza dinámicamente archivos y resultados desde la API
   - ✅ Manejo de errores y estados vacíos
   - ✅ Iconos y colores dinámicos según tipo de archivo

2. **`src/index.html`**
   - Incluye nuevos scripts: `api-config.js`, `api-client.js`

## 🚀 Cómo Usar

### 1. Configurar el Backend

Asegúrate de que el backend FastAPI esté corriendo:

```bash
cd backend
python run-dev.bat  # Windows
# o
./run-dev.sh        # Linux/Mac
```

El backend debe estar disponible en `http://localhost:8000`

### 2. Cambiar URL de la API (Para Producción)

Para cambiar de localhost a tu servidor de producción, edita estos archivos:

**Frontend Admin:**
```javascript
// frontend-admin/src/js/api-config.js
const API_BASE_URL = 'https://tu-api.com';  // Cambiar aquí
```

**Frontend Public:**
```javascript
// frontend-public/src/js/api-config.js
const API_BASE_URL = 'https://tu-api.com';  // Cambiar aquí
```

### 3. Probar el Frontend Admin

1. Abre `frontend-admin/src/acceso/index.html`
2. Ingresa credenciales válidas
3. Completa el Cloudflare Turnstile
4. Al iniciar sesión:
   - El JWT se guarda en una cookie segura
   - Redirige automáticamente al dashboard
   - La cookie expira según la duración configurada en el backend (`ACCESS_TOKEN_EXPIRE_MINUTES`)

### 4. Probar el Frontend Public

1. Abre `frontend-public/src/index.html`
2. Los archivos y resultados se cargan automáticamente desde la API
3. No requiere autenticación

## 🔒 Seguridad

### Cookies JWT

Las cookies JWT se configuran con:
- **Expiration**: Basada en el payload del token (`exp` claim)
- **SameSite**: `Strict` para prevenir CSRF
- **Secure**: Solo en HTTPS (producción)
- **Path**: `/` para toda la aplicación

### Autenticación

- El token se envía en el header `Authorization: Bearer <token>`
- Se verifica automáticamente la expiración antes de cada request
- Redirige al login si el token expira o es inválido

## 📝 Endpoints Implementados

### Frontend Admin (Autenticados)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/login` | Login con Turnstile |
| POST | `/api/upload` | Subir archivo a R2 |
| POST | `/api/request` | Consulta AI |
| GET | `/api/files` | Listar archivos |
| GET | `/api/results` | Listar resultados AI |
| GET | `/health` | Health check |

### Frontend Public (Sin autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/files?page=1&page_size=20` | Listar archivos paginados |
| GET | `/api/files/count` | Total de archivos |
| GET | `/api/results?page=1&page_size=20` | Listar resultados paginados |
| GET | `/api/results/count` | Total de resultados |
| GET | `/health` | Health check |

## 🐛 Debugging

### Console Logs

Todos los errores se registran en la consola del navegador. Abre DevTools (F12) para ver:
- Errores de red
- Respuestas de la API
- Estados de autenticación

### Verificar Token

```javascript
// En la consola del navegador
getUserInfo()
```

### Verificar Conexión API

```javascript
// En la consola del navegador
checkHealth().then(result => console.log(result))
```

## ⚠️ Notas Importantes

1. **CORS**: El backend debe permitir requests desde el dominio del frontend
2. **Turnstile**: Configura el `sitekey` correcto en `frontend-admin/src/acceso/index.html`
3. **R2 Bucket**: Debe estar configurado con acceso público para las URLs de archivos
4. **Database**: Las tablas deben existir antes de usar la API

## 🔄 Flujo de Autenticación

```
1. Usuario ingresa credenciales en /acceso
2. Se valida Cloudflare Turnstile
3. POST /api/login → Devuelve { access_token, token_type }
4. Token se decodifica y se guarda en cookie con expiración automática
5. Todas las requests posteriores incluyen: Authorization: Bearer <token>
6. Al logout, la cookie se elimina
```

## 📦 Estructura de Archivos

```
frontend-admin/
├── src/
│   ├── js/
│   │   ├── api-config.js      (NUEVO)
│   │   ├── auth-utils.js      (NUEVO)
│   │   ├── api-client.js      (NUEVO)
│   │   ├── login.js           (MODIFICADO)
│   │   └── dashboard.js       (MODIFICADO)
│   ├── acceso/
│   │   └── index.html         (MODIFICADO)
│   └── index.html             (MODIFICADO)

frontend-public/
├── src/
│   ├── js/
│   │   ├── api-config.js      (NUEVO)
│   │   ├── api-client.js      (NUEVO)
│   │   └── main.js            (MODIFICADO)
│   └── index.html             (MODIFICADO)
```

## ✅ Checklist de Implementación

- [x] Configuración API centralizada
- [x] Utilidades de autenticación JWT
- [x] Cliente API para admin
- [x] Cliente API para público
- [x] Integración de login
- [x] Integración de upload
- [x] Integración de AI request
- [x] Carga dinámica de archivos
- [x] Carga dinámica de resultados
- [x] Manejo de errores
- [x] Logout funcional
- [x] Documentación completa

## 🚀 Próximos Pasos

1. Implementar paginación funcional en el frontend público
2. Agregar indicadores de carga durante las requests
3. Implementar refresh automático de archivos después de upload
4. Agregar filtros y búsqueda en listados
5. Implementar notificaciones push para nuevos resultados
