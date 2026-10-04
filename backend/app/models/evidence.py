from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship

from app.database.connection import Base


class EvidenceModel(Base):
    __tablename__ = "evidence"

    evidence_id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.case_id"), nullable=False, index=True)
    type = Column(String, nullable=False)
    source = Column(String, nullable=False)
    timestamp = Column(String, nullable=False)
    hash = Column(String, nullable=False)

    case = relationship("CaseModel", back_populates="evidence_items")
    events = relationship("EventModel", back_populates="evidence")
