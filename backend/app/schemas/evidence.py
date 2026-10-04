from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class EvidenceBase(BaseModel):
    type: str = Field(..., description="Evidence category (e.g. auth_log, endpoint_log, firewall_log)")
    source: str = Field(..., description="Evidence source file or system identifier (e.g. auth.log)")
    timestamp: Optional[str] = Field(None, description="Timestamp of collection or evidence recording")
    hash: Optional[str] = Field(None, description="SHA-256 hash. Computed automatically if content is supplied.")


class EvidenceCreate(EvidenceBase):
    evidence_id: Optional[str] = Field(None, description="Unique evidence ID (e.g. EVD-001)")
    content: Optional[str] = Field(None, description="Raw log or file text content used to calculate SHA-256 hash")


class EvidenceResponse(BaseModel):
    evidence_id: str
    case_id: str
    type: str
    source: str
    timestamp: str
    hash: str

    model_config = ConfigDict(from_attributes=True)
