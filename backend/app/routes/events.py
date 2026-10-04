import uuid
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.case import CaseModel
from app.models.event import EventModel
from app.schemas.event import EventCreate, EventResponse
from app.services.forensic_loader import (
    ingest_normalized_events,
    load_normalized_events_file,
)

router = APIRouter(prefix="/cases/{case_id}/events", tags=["Events"])


@router.get("", response_model=List[EventResponse])
def list_case_events(case_id: str, db: Session = Depends(get_db)):
    """Retrieve normalized timeline events associated with a case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )
    return db.query(EventModel).filter(EventModel.case_id == case_id).order_by(EventModel.timestamp.asc()).all()


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_case_event(case_id: str, event_in: EventCreate, db: Session = Depends(get_db)):
    """Record a single normalized event under a specific case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    event_id = event_in.event_id or f"EVT-{uuid.uuid4().hex[:6].upper()}"

    existing = db.query(EventModel).filter(EventModel.event_id == event_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Event with ID '{event_id}' already exists",
        )

    db_event = EventModel(
        event_id=event_id,
        case_id=case_id,
        timestamp=event_in.timestamp,
        event_type=event_in.event_type,
        user=event_in.user,
        device=event_in.device,
        source_ip=event_in.source_ip,
        destination_ip=event_in.destination_ip,
        file=event_in.file,
        server=event_in.server,
        evidence_id=event_in.evidence_id,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


@router.post("/bulk", response_model=List[EventResponse], status_code=status.HTTP_201_CREATED)
def bulk_import_events(case_id: str, events_in: List[EventCreate], db: Session = Depends(get_db)):
    """Bulk import normalized events (e.g. from the forensic engine pipeline) under a case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    try:
        persisted = ingest_normalized_events(db, case_id=case_id, events=events_in)
        return persisted
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.post("/import-processed", response_model=List[EventResponse], status_code=status.HTTP_201_CREATED)
def import_processed_events_file(
    case_id: str,
    file_path: Optional[str] = Query(None, description="Custom path to normalized_events.json file"),
    db: Session = Depends(get_db),
):
    """Import normalized events directly from the forensic engine's output JSON file."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    target_path = Path(file_path) if file_path else Path("data/processed/normalized_events.json")
    if not target_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Normalized events file not found at '{target_path}'",
        )

    try:
        events_data = load_normalized_events_file(target_path)
        persisted = ingest_normalized_events(db, case_id=case_id, events=events_data)
        return persisted
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to import normalized events: {str(e)}",
        )
