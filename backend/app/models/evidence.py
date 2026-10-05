from sqlalchemy import Column, ForeignKey, Integer, String, Text
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

    # Extended attributes for multimedia, physical evidence, and OpenCV processing
    filename = Column(String, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    mime_type = Column(String, nullable=True)
    location = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    collector = Column(String, nullable=True)
    processing_status = Column(String, nullable=True, default="verified")
    metadata_json = Column(Text, nullable=True)
    media_path = Column(String, nullable=True)

    case = relationship("CaseModel", back_populates="evidence_items")
    events = relationship("EventModel", back_populates="evidence")
