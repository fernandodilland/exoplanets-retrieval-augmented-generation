"""
FastAPI application entry point.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import init_db, close_db
from app.routers import auth, upload, request, files, results


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print("🚀 Starting Exoplanets RAG API...")
    print(f"📌 Environment: {settings.environment}")
    print(f"📌 Database: {settings.db_host}:{settings.db_port}/{settings.db_name}")
    
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
    if settings.is_development:
        # Show detailed error in development
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "type": type(exc).__name__}
        )
    else:
        # Generic error in production
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_reload,
    )
