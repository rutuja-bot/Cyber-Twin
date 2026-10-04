"""API routes for Incident Reconstruction, Graph, and Timeline."""

from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.case import CaseModel
from app.schemas.reconstruction import (
    GraphData,
    IncidentReconstructionResponse,
    TimelineItemResponse,
)
from app.services.forensic_loader import (
    get_reconstructed_incident,
    ingest_reconstructed_incident,
    load_incident_reconstruction_file,
)

router = APIRouter(prefix="/cases/{case_id}/reconstruction", tags=["Incident Reconstruction"])


@router.get("", response_model=IncidentReconstructionResponse)
def get_case_reconstruction(case_id: str, db: Session = Depends(get_db)):
    """Retrieve full incident reconstruction (timeline, entity-relationship graph, attack progression) for a case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    recon = get_reconstructed_incident(db, case_id=case_id)
    if not recon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reconstructed incident data not found for case '{case_id}'",
        )

    return recon


@router.get("/graph", response_model=GraphData)
def get_case_reconstruction_graph(case_id: str, db: Session = Depends(get_db)):
    """Retrieve the correlated entity-relationship Cyber Twin graph (nodes and directed edges) for a case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    recon = get_reconstructed_incident(db, case_id=case_id)
    if not recon or "graph" not in recon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Graph reconstruction data not found for case '{case_id}'",
        )

    return recon["graph"]


@router.get("/timeline", response_model=List[TimelineItemResponse])
def get_case_reconstruction_timeline(case_id: str, db: Session = Depends(get_db)):
    """Retrieve the chronologically reconstructed attack timeline for a case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    recon = get_reconstructed_incident(db, case_id=case_id)
    if not recon or "timeline" not in recon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Timeline reconstruction data not found for case '{case_id}'",
        )

    return recon["timeline"]


@router.post("/import-processed", response_model=IncidentReconstructionResponse, status_code=status.HTTP_201_CREATED)
def import_processed_reconstruction_file(
    case_id: str,
    file_path: Optional[str] = Query(None, description="Custom path to incident_reconstruction.json file"),
    db: Session = Depends(get_db),
):
    """Import incident reconstruction artifact directly into the database (events and findings) and serve graph/timeline."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    target_path = Path(file_path) if file_path else Path("data/processed/incident_reconstruction.json")
    if not target_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident reconstruction file not found at '{target_path}'",
        )

    try:
        recon_data = load_incident_reconstruction_file(target_path)
        persisted = ingest_reconstructed_incident(db, case_id=case_id, reconstruction_data=recon_data)
        return persisted
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to import incident reconstruction: {str(e)}",
        )
