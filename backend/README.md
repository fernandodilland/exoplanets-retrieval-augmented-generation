# Exoplanets RAG Backend

Modern, minimalist, and asynchronous FastAPI backend for the Exoplanets Retrieval-Augmented Generation project.

## Features

- ⚡ **FastAPI** - Modern, fast web framework for Python
- 🔒 **Secure Authentication** - JWT tokens with Argon2id password hashing
- 🤖 **AI Integration** - Cloudflare AI Search for RAG capabilities
- ☁️ **Cloud Storage** - Cloudflare R2 for file storage
- 🗄️ **Database** - MariaDB with async SQLAlchemy
- 🔐 **CAPTCHA** - Cloudflare Turnstile verification
- 📝 **API Documentation** - Auto-generated Swagger/OpenAPI docs (development only)

## Tech Stack

- **FastAPI** - Web framework
- **SQLAlchemy** - ORM with async support
- **AsyncMy** - Async MySQL driver
- **Argon2-cffi** - Password hashing
- **Python-jose** - JWT token handling
- **HTTPX** - Async HTTP client
- **Aioboto3** - Async AWS SDK (for R2)

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── config.py              # Configuration and environment variables
│   ├── database.py            # Database connection and session management
│   ├── dependencies.py        # FastAPI dependencies (auth, etc.)
│   ├── models.py              # SQLAlchemy models
│   ├── schemas.py             # Pydantic schemas
│   ├── routers/               # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py            # Login endpoint
│   │   ├── upload.py          # File upload endpoint
│   │   ├── request.py         # AI request endpoint
│   │   ├── files.py           # Public files endpoint
│   │   └── results.py         # Public results endpoint
│   └── utils/                 # Utility functions
│       ├── __init__.py
│       ├── security.py        # Password hashing (Argon2id)
│       ├── jwt.py             # JWT token handling
│       └── turnstile.py       # Cloudflare Turnstile verification
├── main.py                    # Application entry point
├── requirements.txt           # Python dependencies
├── pyproject.toml            # Project metadata
├── .env.development          # Development environment variables
├── .env.production           # Production environment variables
├── .gitignore                # Git ignore file
├── run-dev.bat               # Windows development startup script
├── run-dev.sh                # Linux development startup script
├── run-prod.bat              # Windows production startup script
└── run-prod.sh               # Linux production startup script
```

## Installation

### Prerequisites

- Python 3.11 or higher
- MariaDB server running
- Cloudflare account (for R2 and AI Search)

### Windows

1. Clone the repository
2. Navigate to the backend folder:
   ```cmd
   cd backend
   ```
3. Run the setup script:
   ```cmd
   setup-environment.bat
   ```
4. Configure environment variables in `.env.development` (if needed)
5. Run the development server:
   ```cmd
   run-dev.bat
   ```

### Ubuntu/Linux

1. Clone the repository
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Make scripts executable:
   ```bash
   chmod +x setup-environment.sh run-dev.sh run-prod.sh
   ```
4. Run the setup script:
   ```bash
   ./setup-environment.sh
   ```
5. Configure environment variables in `.env.development` (if needed)
6. Run the development server:
   ```bash
   ./run-dev.sh
   ```
6. Make scripts executable:
   ```bash
   chmod +x run-dev.sh run-prod.sh
   ```
7. Run the development server:
   ```bash
   ./run-dev.sh
   ```

## Configuration

### Environment Variables

The application uses two environment files:
- `.env.development` - Development configuration
- `.env.production` - Production configuration

Set the `ENVIRONMENT` variable to choose which file to load:
```bash
export ENVIRONMENT=development  # or production
```

### Required Configuration

1. **Database**: Configure MariaDB connection
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`

2. **Security**: Generate a secure secret key
   - `SECRET_KEY` - Minimum 32 characters

3. **Cloudflare R2**: Configure for file storage
   - `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`, `R2_ENDPOINT_URL`

4. **Cloudflare AI Search**: Configure for RAG
   - `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`
   - `AI_SEARCH_NAME`

5. **Turnstile**: Configure CAPTCHA
   - `TURNSTILE_SECRET_KEY`

## API Endpoints

### Authentication (Protected)

- **POST** `/api/login` - Login with username/password and Turnstile token
  - Headers: `cf-turnstile-response`
  - Body: `{ "user": "string", "password": "string" }`
  - Returns: JWT access token

### File Management (Protected)

- **POST** `/api/upload` - Upload file (max 4MB, specific formats only)
  - Headers: `Authorization: Bearer <token>`
  - Body: Form data with file
  - Returns: File UID and URL

### AI Request (Protected)

- **POST** `/api/request` - Send query to AI Search
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "prompt": "string" }`
  - Returns: Question and AI response

### Public Endpoints

- **GET** `/api/files` - Get paginated list of files
  - Query params: `page`, `page_size`
  - Returns: List of files

- **GET** `/api/files/count` - Get total file count

- **GET** `/api/results` - Get paginated list of AI responses
  - Query params: `page`, `page_size`
  - Returns: List of responses

- **GET** `/api/results/count` - Get total response count

### Utility Endpoints

- **GET** `/` - Root endpoint (API info)
- **GET** `/health` - Health check

## Development

### API Documentation

When running in development mode, Swagger documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

**Note**: Documentation is disabled in production for security.

### Database Schema

The database schema is located in `../database/02_create_tables.sql` and includes:
- `users` - User accounts with Argon2id password hashing
- `files` - Uploaded files metadata
- `responses` - AI request/response history

### Supported File Formats

The API accepts the following file formats (max 4MB):
- Plain text: `.txt`, `.rst`, `.log`, `.md`, `.json`, `.yaml`, `.yml`, etc.
- Documents: `.pdf`, `.docx`, `.html`, `.xml`, `.csv`, etc.
- Code: `.js`, `.py`, `.java`, `.c`, `.cpp`, `.go`, `.rs`, etc.
- Images: `.jpeg`, `.jpg`, `.png`, `.webp`, `.svg`
- Office: `.xlsx`, `.ods`, `.numbers`

See `.env.development` for the complete list.

## Deployment

### Production

1. Update `.env.production` with production values
2. Set `ENVIRONMENT=production`
3. Run the production server:
   - Windows: `run-prod.bat`
   - Linux: `./run-prod.sh`

### Important Security Notes

- Change `SECRET_KEY` to a secure random string (32+ characters)
- Update `TURNSTILE_SECRET_KEY` with your production key
- Configure proper CORS origins in production
- API documentation is automatically disabled in production
- Use HTTPS in production

## Future Enhancements

The following features are prepared but require configuration:

1. **Cloudflare R2 Upload** - File upload to R2 bucket (requires R2 credentials)
2. **Cloudflare AI Search** - RAG queries (requires AI Search API token)
3. **Automatic Indexing** - Files uploaded to R2 are automatically indexed by AI Search

## Support

For issues and questions, please open an issue on the GitHub repository.
