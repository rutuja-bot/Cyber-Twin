from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class FindingBase(BaseModel):
    title: str = Field(..., description="Title of the forensic finding")
    description: str = Field(..., description="Detailed explanation of the alert or malicious activity")
    severity: str = Field(..., description="Severity level: LOW, MEDIUM, HIGH, CRITICAL")
    confidence: float = Field(..., description="Confidence score from 0.0 to 1.0", ge=0.0, le=1.0)
    event_ids: List[str] = Field(default_factory=list, description="IDs of correlated events supporting this finding")
    evidence_ids: List[str] = Field(default_factory=list, description="IDs of evidence artifacts supporting this finding")


class FindingCreate(FindingBase):
    finding_id: Optional[str] = Field(None, description="Unique finding ID (e.g. FND-001)")


class FindingResponse(FindingBase):
    finding_id: str
    case_id: str

    model_config = ConfigDict(from_attributes=True)
