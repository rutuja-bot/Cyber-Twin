"""PostgreSQL Database Adapter & Production Engine Support.

Provides connection diagnostics, table schema export, and configuration management
for deploying the Cyber Twin structured models to production PostgreSQL environments.
"""

import os
from typing import Any, Dict
from sqlalchemy import create_engine, text


class PostgresAdapter:
    """Manages PostgreSQL connection, verification, and migration DDL."""

    def __init__(self, database_url: str = None):
        self.url = database_url or os.getenv("DATABASE_URL", "sqlite:///./cyber_twin.db")
        self.is_postgres = self.url.startswith("postgresql")

    def check_connection(self) -> Dict[str, Any]:
        """Test database connection and report driver status."""
        if not self.is_postgres:
            return {
                "active_driver": "sqlite",
                "database_url_type": "sqlite_local_fallback",
                "status": "active_development_fallback",
                "message": "SQLite active for zero-dependency local development and testing. Set DATABASE_URL=postgresql://... for production PostgreSQL.",
            }

        try:
            engine = create_engine(self.url, pool_pre_ping=True)
            with engine.connect() as conn:
                version = conn.execute(text("SELECT version();")).scalar()
            return {
                "active_driver": "postgresql",
                "database_url_type": "postgresql_production",
                "status": "connected",
                "server_version": str(version),
            }
        except Exception as e:
            return {
                "active_driver": "postgresql",
                "database_url_type": "postgresql_production",
                "status": "connection_error",
                "error": str(e),
                "fallback_active": False,
            }

    def generate_ddl_schema(self) -> str:
        """Generate PostgreSQL DDL table creation statements."""
        return """-- Cyber Twin PostgreSQL Production Schema
CREATE TABLE IF NOT EXISTS cases (
    case_id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS evidence (
    evidence_id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES cases(case_id) ON DELETE CASCADE,
    type VARCHAR(64) NOT NULL,
    source VARCHAR(255) NOT NULL,
    timestamp VARCHAR(64) NOT NULL,
    hash VARCHAR(64) NOT NULL,
    filename VARCHAR(255),
    file_size_bytes BIGINT,
    mime_type VARCHAR(128),
    location VARCHAR(255),
    description TEXT,
    collector VARCHAR(128),
    processing_status VARCHAR(64) DEFAULT 'verified',
    metadata_json TEXT,
    media_path VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS events (
    event_id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES cases(case_id) ON DELETE CASCADE,
    timestamp VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    "user" VARCHAR(128),
    device VARCHAR(128),
    source_ip VARCHAR(64),
    destination_ip VARCHAR(64),
    file VARCHAR(255),
    server VARCHAR(128),
    evidence_id VARCHAR(64) REFERENCES evidence(evidence_id)
);

CREATE TABLE IF NOT EXISTS findings (
    finding_id VARCHAR(64) PRIMARY KEY,
    case_id VARCHAR(64) REFERENCES cases(case_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    confidence FLOAT NOT NULL DEFAULT 0.95
);
"""
