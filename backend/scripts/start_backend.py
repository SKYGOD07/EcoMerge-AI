#!/usr/bin/env python3
"""Run the EcoSphere FastAPI backend locally."""

import os
import sys
from pathlib import Path

import uvicorn
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent
repo_env = backend_dir.parent / ".env"

if repo_env.exists():
    load_dotenv(repo_env)

os.chdir(backend_dir)
sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    try:
        print("Starting EcoSphere backend on http://localhost:8000")
        print("API documentation: http://localhost:8000/docs")
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
        )
    except KeyboardInterrupt:
        print("EcoSphere backend stopped")
    except Exception as exc:
        print(f"Backend startup failed: {exc}")
        sys.exit(1)
