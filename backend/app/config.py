"""
Configuration module for environment variables and application settings.
"""
import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load environment variables
env = os.getenv("ENVIRONMENT", "development")
env_file = f".env.{env}"
load_dotenv(env_file)


class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    environment: str = os.getenv("ENVIRONMENT", "development")
    
    # API Configuration
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    api_reload: bool = os.getenv("API_RELOAD", "true").lower() == "true"
    
    # Security
    secret_key: str = os.getenv("SECRET_KEY", "")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Database
    db_host: str = os.getenv("DB_HOST", "localhost")
    db_port: int = int(os.getenv("DB_PORT", "3306"))
    db_user: str = os.getenv("DB_USER", "")
    db_password: str = os.getenv("DB_PASSWORD", "")
    db_name: str = os.getenv("DB_NAME", "exoplanets-rag")
    
    # Cloudflare R2
    r2_account_id: str = os.getenv("R2_ACCOUNT_ID", "")
    r2_access_key_id: str = os.getenv("R2_ACCESS_KEY_ID", "")
    r2_secret_access_key: str = os.getenv("R2_SECRET_ACCESS_KEY", "")
    r2_bucket_name: str = os.getenv("R2_BUCKET_NAME", "exoplanets-retrieval-augmented-generation")
    r2_endpoint_url: str = os.getenv("R2_ENDPOINT_URL", "")
    r2_public_domain: str = os.getenv("R2_PUBLIC_DOMAIN", "")
    
    # Cloudflare AI Search
    cloudflare_account_id: str = os.getenv("CLOUDFLARE_ACCOUNT_ID", "")
    cloudflare_api_token: str = os.getenv("CLOUDFLARE_API_TOKEN", "")
    ai_search_name: str = os.getenv("AI_SEARCH_NAME", "rag-exoplanets")
    
    # File Upload
    max_file_size_mb: int = int(os.getenv("MAX_FILE_SIZE_MB", "4"))
    allowed_file_extensions: str = os.getenv(
        "ALLOWED_FILE_EXTENSIONS",
        ".txt,.md,.pdf,.json"
    )
    
    # CORS
    cors_origins_str: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000"
    )
    
    # Turnstile
    turnstile_secret_key: str = os.getenv("TURNSTILE_SECRET_KEY", "")
    
    @property
    def database_url(self) -> str:
        """Get database URL for SQLAlchemy"""
        # Usando aiomysql en lugar de asyncmy (no requiere compilación)
        return f"mysql+aiomysql://{self.db_user}:{self.db_password}@{self.db_host}:{self.db_port}/{self.db_name}"
    
    @property
    def max_file_size_bytes(self) -> int:
        """Get max file size in bytes"""
        return self.max_file_size_mb * 1024 * 1024
    
    @property
    def allowed_file_extensions_list(self) -> List[str]:
        """Get allowed file extensions as list"""
        return [ext.strip() for ext in self.allowed_file_extensions.split(",")]
    
    @property
    def cors_origins(self) -> List[str]:
        """Get CORS origins as list"""
        return [origin.strip() for origin in self.cors_origins_str.split(",")]
    
    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.environment == "development"
    
    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.environment == "production"
    
    class Config:
        case_sensitive = False


# Global settings instance
settings = Settings()
