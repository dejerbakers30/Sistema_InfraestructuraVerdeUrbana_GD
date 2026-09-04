"""
Configuration management using Pydantic Settings.
Environment variables are loaded from .env file.
"""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator
from functools import lru_cache


class Settings(BaseSettings):
    """
    Application settings with environment variable support.
    All settings can be overridden via environment variables.
    """
    
    # Project Information
    PROJECT_NAME: str = "Gemelo Digital Infraestructura Verde"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = Field(..., description="Secret key for JWT token generation")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/bd_gemelodigital",
        description="Database connection URL"
    )
    TEST_DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/bd_gemelodigital_test",
        description="Test database connection URL"
    )
    USE_TIMESCALEDB: bool = Field(
        default=True,
        description="Use TimescaleDB for time-series data (not available on Windows)"
    )
    
    # Redis
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis URL for Celery and caching"
    )
    
    # ENVI-met Configuration
    ENVI_MET_PATH: Optional[str] = Field(
        None,
        description="Path to ENVI-met installation directory"
    )
    ENVI_MET_LICENSE: Optional[str] = Field(
        None,
        description="Path to ENVI-met license file"
    )
    
    # File Storage
    UPLOAD_DIR: str = Field(default="./uploads", description="Directory for uploaded files")
    MAX_UPLOAD_SIZE: int = Field(default=524288000, description="Max upload size in bytes (500MB)")
    ALLOWED_FILE_EXTENSIONS: List[str] = [
        ".geojson", ".json", ".csv", ".nc", ".epw", ".inx", ".simx"
    ]
    
    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost:3000",
            "http://localhost:8000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:8000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
        ],
        description="Allowed CORS origins"
    )
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    # Logging
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FILE: str = Field(default="./logs/app.log", description="Log file path")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # Simulation
    SIMULATION_TIMEOUT_MINUTES: int = 120
    MAX_CONCURRENT_SIMULATIONS: int = 5
    
    # Report Generation
    REPORT_TEMP_DIR: str = Field(default="./temp/reports", description="Temporary directory for reports")
    REPORT_MAX_SIZE_MB: int = 50
    
    # Email (for password recovery)
    SMTP_HOST: Optional[str] = Field(None, description="SMTP server host")
    SMTP_PORT: int = Field(default=587, description="SMTP server port")
    SMTP_USER: Optional[str] = Field(None, description="SMTP username")
    SMTP_PASSWORD: Optional[str] = Field(None, description="SMTP password")
    EMAIL_FROM: Optional[str] = Field(None, description="From email address")
    
    # Environment
    ENVIRONMENT: str = Field(default="development", description="Environment (development/staging/production)")
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Cached settings instance.
    Use this function to get settings throughout the application.
    """
    return Settings()


# Global settings instance
settings = get_settings()
