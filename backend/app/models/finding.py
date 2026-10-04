from sqlalchemy import Column, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import relationship

from app.database.connection import Base


class FindingModel(Base):
    __tablename__ = "findings"

    finding_id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.case_id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    event_ids = Column(JSON, nullable=False, default=list)
    evidence_ids = Column(JSON, nullable=False, default=list)

    case = relationship("CaseModel", back_populates="findings")
