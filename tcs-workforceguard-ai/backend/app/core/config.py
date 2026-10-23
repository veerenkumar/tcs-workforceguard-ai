import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "TCS WorkforceGuard AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./workforceguard.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
    ]
    
    # Directory paths
    BACKEND_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    PROJECT_ROOT: str = os.path.dirname(BACKEND_DIR)
    
    DATA_DIR: str = os.path.join(PROJECT_ROOT, "data")
    UPLOAD_DIR: str = os.path.join(PROJECT_ROOT, "data", "uploads")
    MODELS_DIR: str = os.path.join(PROJECT_ROOT, "models_store")
    SAMPLE_DATA_PATH: str = os.path.join(PROJECT_ROOT, "data", "sample", "tcs_workforce_benchmark.csv")
    
    # LLM Optional Keys (Backend-only, never exposed to frontend)
    OPENAI_API_KEY: str | None = os.getenv("OPENAI_API_KEY", None)
    GEMINI_API_KEY: str | None = os.getenv("GEMINI_API_KEY", None)
    
    # Max file upload size (10 MB)
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.MODELS_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.PROJECT_ROOT, "data", "sample"), exist_ok=True)
