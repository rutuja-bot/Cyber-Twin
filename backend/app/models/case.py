from datetime import datetime
from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.orm import relationship

from app.database.connection import Base


class CaseModel(Base):
    __tablename__ = "cases"

    case_id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="open", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    evidence_items = relationship("EvidenceModel", back_populates="case", cascade="all, delete-orphan")
    events = relationship("EventModel", back_populates="case", cascade="all, delete-orphan")
    findings = relationship("FindingModel", back_populates="case", cascade="all, delete-orphan")
