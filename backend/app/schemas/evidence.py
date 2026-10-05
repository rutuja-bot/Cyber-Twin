from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class EvidenceBase(BaseModel):
    type: str = Field(..., description="Evidence category (e.g. auth_log, endpoint_log, photo, cctv, physical, report)")
    source: str = Field(..., description="Evidence source file or system identifier (e.g. auth.log, CAM-04)")
    timestamp: Optional[str] = Field(None, description="Timestamp of collection or evidence recording")
    hash: Optional[str] = Field(None, description="SHA-256 hash. Computed automatically if content is supplied.")
    filename: Optional[str] = Field(None, description="Filename on disk or in repository")
    file_size_bytes: Optional[int] = Field(None, description="File size in bytes")
    mime_type: Optional[str] = Field(None, description="MIME type of evidence artifact")
    location: Optional[str] = Field(None, description="Physical or logical scene location (e.g. Workstation Desk 14)")
    description: Optional[str] = Field(None, description="Detailed evidence description and forensic notes")
    collector: Optional[str] = Field(None, description="Name or identifier of collecting investigator / sensor")
    processing_status: Optional[str] = Field("verified", description="Processing lifecycle status (verified, pending, processed_by_opencv)")
    metadata_json: Optional[str] = Field(None, description="JSON-serialized metadata dictionary including OpenCV results")
    media_path: Optional[str] = Field(None, description="Relative URL or file path to media asset")


class EvidenceCreate(EvidenceBase):
    evidence_id: Optional[str] = Field(None, description="Unique evidence ID (e.g. EVD-001)")
    content: Optional[str] = Field(None, description="Raw log or file text content used to calculate SHA-256 hash")
    process_with_opencv: Optional[bool] = Field(False, description="Flag to trigger real OpenCV image processing on ingestion")


class EvidenceResponse(BaseModel):
    evidence_id: str
    case_id: str
    type: str
    source: str
    timestamp: str
    hash: str
    filename: Optional[str] = None
    file_size_bytes: Optional[int] = None
    mime_type: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    collector: Optional[str] = None
    processing_status: Optional[str] = "verified"
    metadata_json: Optional[str] = None
    media_path: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
