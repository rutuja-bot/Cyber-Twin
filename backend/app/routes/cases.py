import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.case import CaseModel
from app.schemas.case import CaseCreate, CaseResponse

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post("", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    """Create a new forensic investigation case."""
    case_id = case_in.case_id or f"CASE-{uuid.uuid4().hex[:6].upper()}"

    existing = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Case with ID '{case_id}' already exists",
        )

    db_case = CaseModel(
        case_id=case_id,
        title=case_in.title,
        description=case_in.description,
        status=case_in.status or "open",
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case


@router.get("", response_model=List[CaseResponse])
def list_cases(db: Session = Depends(get_db)):
    """Retrieve all forensic investigation cases."""
    return db.query(CaseModel).all()


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: str, db: Session = Depends(get_db)):
    """Retrieve details of a single investigation case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )
    return case
