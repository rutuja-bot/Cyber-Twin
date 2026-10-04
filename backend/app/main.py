from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, SessionLocal, engine
from app.database.seed_data import seed_demo_data
import app.models  # Ensure all models are registered with Base metadata
from app.routes import cases_router, evidence_router, events_router, findings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    # Populate initial simulated cyber incident dataset if empty
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Cyber Twin API",
    description="Digital Forensics Investigation System — Interactive Cyber Incident Reconstruction & Replay Backend",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for local frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health", tags=["Health"])
def health_check():
    """Health check endpoint to confirm service availability."""
    return {"status": "ok"}


# Register API routers
app.include_router(cases_router)
app.include_router(evidence_router)
app.include_router(events_router)
app.include_router(findings_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
