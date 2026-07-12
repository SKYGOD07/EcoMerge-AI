import sys
import traceback
from pathlib import Path

# Inject backend directory into Python path for Vercel serverless resolution
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Catch initialization errors so the health endpoint can report them
init_error = None
try:
    from app.api.routes.ai import router as ai_router
    from app.api.routes.auth import router as auth_router
    from app.api.routes.carbon import router as carbon_router
    from app.api.routes.dashboard import router as dashboard_router
    from app.api.routes.department import router as department_router
    from app.api.routes.governance import router as governance_router
    from app.api.routes.notifications import router as notifications_router
    from app.api.routes.reports import router as reports_router
    from app.api.routes.social import router as social_router
    from app.api.routes.gamification import router as gamification_router
    from app.api.routes.settings import router as settings_router
    from app.core.config import settings

    # Auto-create tables on startup (handles empty /tmp/ecosphere.db)
    from app.db.session import engine
    from app.db.base import Base
    Base.metadata.create_all(bind=engine)
except Exception:
    init_error = traceback.format_exc()

app = FastAPI(title="EcoSphere ESG Management Platform", version="1.0.0")

if init_error is None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router, prefix="/api")
    app.include_router(dashboard_router, prefix="/api")
    app.include_router(department_router, prefix="/api")
    app.include_router(carbon_router, prefix="/api")
    app.include_router(social_router, prefix="/api")
    app.include_router(governance_router, prefix="/api")
    app.include_router(gamification_router, prefix="/api")
    app.include_router(notifications_router, prefix="/api")
    app.include_router(reports_router, prefix="/api")
    app.include_router(settings_router, prefix="/api")
    app.include_router(ai_router, prefix="/api")
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.get("/api/health")
@app.get("/health")
def health_check():
    if init_error:
        return {
            "status": "error",
            "message": "Initialization failed",
            "traceback": init_error,
        }
    return {
        "status": "ok",
        "service": "EcoSphere ESG Management Platform",
        "version": "1.0.0",
    }
