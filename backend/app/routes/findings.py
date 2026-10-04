import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.case import CaseModel
from app.models.finding import FindingModel
from app.schemas.finding import FindingCreate, FindingResponse

router = APIRouter(prefix="/cases/{case_id}/findings", tags=["Findings"])


@router.get("", response_model=List[FindingResponse])
def list_case_findings(case_id: str, db: Session = Depends(get_db)):
    """Retrieve correlated forensic findings linked to supporting evidence for a case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )
    return db.query(FindingModel).filter(FindingModel.case_id == case_id).all()


@router.post("", response_model=FindingResponse, status_code=status.HTTP_201_CREATED)
def create_case_finding(case_id: str, finding_in: FindingCreate, db: Session = Depends(get_db)):
    """Record a verified forensic finding with explicit event and evidence links."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    finding_id = finding_in.finding_id or f"FND-{uuid.uuid4().hex[:6].upper()}"

    existing = db.query(FindingModel).filter(FindingModel.finding_id == finding_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Finding with ID '{finding_id}' already exists",
        )

    db_finding = FindingModel(
        finding_id=finding_id,
        case_id=case_id,
        title=finding_in.title,
        description=finding_in.description,
        severity=finding_in.severity,
        confidence=finding_in.confidence,
        event_ids=finding_in.event_ids,
        evidence_ids=finding_in.evidence_ids,
    )
    db.add(db_finding)
    db.commit()
    db.refresh(db_finding)
    return db_finding
