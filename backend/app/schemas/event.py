from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class EventBase(BaseModel):
    timestamp: str = Field(..., description="Normalized event timestamp (ISO 8601)")
    event_type: str = Field(..., description="Action category (e.g. LOGIN_SUCCESS, PROCESS_SPAWN, FILE_ACCESS)")
    user: Optional[str] = Field(None, description="Associated user identity")
    device: Optional[str] = Field(None, description="Host or device name")
    source_ip: Optional[str] = Field(None, description="Source IP address")
    evidence_id: Optional[str] = Field(None, description="Associated evidence ID linking to source log")


class EventCreate(EventBase):
    event_id: Optional[str] = Field(None, description="Unique event identifier (e.g. EVT-001)")


class EventResponse(EventBase):
    event_id: str
    case_id: str

    model_config = ConfigDict(from_attributes=True)
