from pydantic import BaseModel
import os


class Settings(BaseModel):
    app_name: str = "EcoSphere ESG Management Platform"
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/ecosphere"
    jwt_secret: str = os.getenv("JWT_SECRET", "this-is-a-longer-dev-jwt-secret-for-erp-local-testing-12345")
    jwt_algorithm: str = "HS256"
    jwt_expiry_minutes: int = 60
    ai_api_key: str = os.getenv("AI_API_KEY", "")
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://eco-merge-ai.vercel.app",
        "https://eco-merge-ai-git-main-skygod07-projects.vercel.app",
    ]


# Allow any vercel.app subdomain via env override
_extra = os.getenv("CORS_ORIGINS", "")
settings = Settings()
if _extra:
    settings.allowed_origins.extend([o.strip() for o in _extra.split(",") if o.strip()])
# In production, allow all vercel preview URLs
if os.getenv("VERCEL"):
    settings.allowed_origins.append("https://*.vercel.app")
