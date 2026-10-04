from app.routes.cases import router as cases_router
from app.routes.evidence import router as evidence_router
from app.routes.events import router as events_router
from app.routes.findings import router as findings_router

__all__ = ["cases_router", "evidence_router", "events_router", "findings_router"]
