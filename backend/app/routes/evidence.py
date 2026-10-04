import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.case import CaseModel
from app.models.evidence import EvidenceModel
from app.schemas.evidence import EvidenceCreate, EvidenceResponse
from app.services.hashing import calculate_sha256

router = APIRouter(prefix="/cases/{case_id}/evidence", tags=["Evidence"])


@router.post("", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
def create_evidence(case_id: str, evidence_in: EvidenceCreate, db: Session = Depends(get_db)):
    """Register a new digital evidence artifact under a specific case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    evidence_id = evidence_in.evidence_id or f"EVD-{uuid.uuid4().hex[:6].upper()}"

    existing = db.query(EvidenceModel).filter(EvidenceModel.evidence_id == evidence_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Evidence with ID '{evidence_id}' already exists",
        )

    # Calculate SHA-256 hash from content if supplied, else use provided hash or fallback
    if evidence_in.content is not None:
        computed_hash = calculate_sha256(evidence_in.content)
    elif evidence_in.hash:
        computed_hash = evidence_in.hash
    else:
        # Fallback hash of metadata if raw content wasn't provided
        computed_hash = calculate_sha256(f"{evidence_in.source}:{evidence_in.type}")

    timestamp = evidence_in.timestamp or datetime.utcnow().isoformat()

    db_evidence = EvidenceModel(
        evidence_id=evidence_id,
        case_id=case_id,
        type=evidence_in.type,
        source=evidence_in.source,
        timestamp=timestamp,
        hash=computed_hash,
    )
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    return db_evidence


@router.get("", response_model=List[EvidenceResponse])
def list_case_evidence(case_id: str, db: Session = Depends(get_db)):
    """Retrieve all evidence artifacts associated with a case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )
    return db.query(EvidenceModel).filter(EvidenceModel.case_id == case_id).all()
