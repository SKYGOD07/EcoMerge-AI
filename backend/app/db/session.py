import os
import shutil
import logging
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

logger = logging.getLogger("uvicorn.error")

# Determine target database url - only connect to PostgreSQL/MySQL if DATABASE_URL is explicitly configured
database_url = os.getenv("DATABASE_URL")

# Check if running in a serverless environment (Vercel/Lambda)
is_serverless = os.getenv("VERCEL") == "1" or os.getenv("AWS_LAMBDA_FUNCTION_NAME") is not None

try:
    if database_url and ("postgresql" in database_url or "mysql" in database_url):
        # Check connection using a quick timeout
        connect_args = {}
        if "postgresql" in database_url:
            connect_args = {"connect_timeout": 3}
        elif "mysql" in database_url:
            connect_args = {"connect_timeout": 3}
            
        engine = create_engine(database_url, future=True, connect_args=connect_args)
        with engine.connect() as conn:
            pass
        logger.info(f"Database connection successful to: {database_url.split('@')[-1]}")
    else:
        raise ValueError("No primary SQL database connection URL provided via environment.")
except Exception as e:
    logger.warning(f"Using SQLite database: {e}")
    
    # Resolve the absolute path of ecosphere.db inside backend/app/db/
    local_db_path = Path(__file__).resolve().parent / "ecosphere.db"
    
    if is_serverless:
        # Vercel filesystem is read-only, copy seeded DB to /tmp
        tmp_db_path = "/tmp/ecosphere.db"
        if local_db_path.exists():
            try:
                # Force copy to ensure new deploys update the database
                shutil.copy2(local_db_path, tmp_db_path)
                logger.info(f"Packaged SQLite DB successfully copied to {tmp_db_path}")
            except Exception as copy_err:
                logger.warning(f"Error copying DB to /tmp: {copy_err}")
        else:
            logger.error(f"CRITICAL: Seeded SQLite DB not found at {local_db_path}!")
            
        database_url = f"sqlite:///{tmp_db_path}"
    else:
        # Local development uses absolute path to backend/app/db/ecosphere.db
        database_url = f"sqlite:///{local_db_path}"
        logger.info(f"Connecting to local SQLite DB at: {local_db_path}")
        
    engine = create_engine(database_url, future=True, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
