from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.orm import relationship

from app.database.connection import Base


class EventModel(Base):
    __tablename__ = "events"

    event_id = Column(String, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.case_id"), nullable=False, index=True)
    timestamp = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    user = Column(String, nullable=True)
    device = Column(String, nullable=True)
    source_ip = Column(String, nullable=True)
    evidence_id = Column(String, ForeignKey("evidence.evidence_id"), nullable=True, index=True)

    case = relationship("CaseModel", back_populates="events")
    evidence = relationship("EvidenceModel", back_populates="events")
