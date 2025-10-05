"""
FastAPI application entry point.
"""
from contextlib import asynccontextmanager

from app.config import settings
from app.database import close_db, init_db
from app.routers import auth, files, request, results, upload
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import select, text


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("🚀 Starting Exoplanets RAG API...")
    print(f"📌 Environment: {settings.environment}")
    print(f"📌 Database: {settings.db_host}:{settings.db_port}/{settings.db_name}")
    print(f"📌 CORS Origins: {settings.cors_origins}")
    
    # Test database connection
    try:
        from app.database import engine
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("⚠️  API will start but database operations will fail")
    
    # Initialize database (optional - tables should already exist)
    # await init_db()
    
    yield
    
    # Shutdown
    print("👋 Shutting down Exoplanets RAG API...")
    await close_db()


# Create FastAPI application
app = FastAPI(
    title="Exoplanets RAG API",
    description="FastAPI backend for Exoplanets Retrieval-Augmented Generation",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.is_development else settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Exoplanets RAG API",
        "version": "1.0.0",
        "environment": settings.environment,
        "docs": "/docs" if settings.is_development else "disabled in production"
    }


# Health check endpoint
@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


# Include routers
app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(request.router)
app.include_router(files.router)
app.include_router(results.router)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    import traceback

    # Log the error
    print(f"❌ Error: {type(exc).__name__}: {str(exc)}")
    print(traceback.format_exc())
    
    # Prepare response with CORS headers
    headers = {}
    origin = request.headers.get("origin")
    if origin:
        # Allow the origin if it's in the allowed list
        allowed = settings.cors_origins if not settings.is_development else ["*"]
        if "*" in allowed or origin in allowed or any(origin.rstrip('/') == o.rstrip('/') for o in allowed):
            headers["Access-Control-Allow-Origin"] = origin
            headers["Access-Control-Allow-Credentials"] = "true"
    
    if settings.is_development:
        # Show detailed error in development
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "type": type(exc).__name__},
            headers=headers
        )
    else:
        # Generic error in production
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
            headers=headers
        )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
    )
