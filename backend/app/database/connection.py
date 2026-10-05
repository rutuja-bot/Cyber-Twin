import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Read DATABASE_URL from environment variable (PostgreSQL in production/staging)
# Fallback to local SQLite for development and automated test execution without external services
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./cyber_twin.db")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def run_schema_migrations(eng):
    """Ensure newly added columns exist in database table without requiring external alembic."""
    from sqlalchemy import inspect, text
    inspector = inspect(eng)
    if "evidence" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("evidence")]
        new_cols = [
            ("filename", "VARCHAR(255)"),
            ("file_size_bytes", "INTEGER"),
            ("mime_type", "VARCHAR(128)"),
            ("location", "VARCHAR(255)"),
            ("description", "TEXT"),
            ("collector", "VARCHAR(128)"),
            ("processing_status", "VARCHAR(64) DEFAULT 'verified'"),
            ("metadata_json", "TEXT"),
            ("media_path", "VARCHAR(255)"),
        ]
        with eng.begin() as conn:
            for col_name, col_type in new_cols:
                if col_name not in columns:
                    try:
                        conn.execute(text(f"ALTER TABLE evidence ADD COLUMN {col_name} {col_type}"))
                    except Exception:
                        pass


def get_db():
    """Dependency that provides a transactional database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
