import sys
from pathlib import Path

# Resolve absolute path to the backend directory and inject it into sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_dir))
sys.path.insert(0, str(backend_dir / "app"))

from app.main import app
