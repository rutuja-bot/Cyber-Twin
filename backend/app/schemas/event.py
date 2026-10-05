from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class EventBase(BaseModel):
    timestamp: str = Field(..., description="Event occurrence time (ISO 8601)")
    event_type: str = Field(..., description="Type of activity (e.g. suspicious_login, process_spawn)")
    user: Optional[str] = Field(None, description="User/account involved")
    device: Optional[str] = Field(None, description="Device involved")
    source_ip: Optional[str] = Field(None, description="Source IP when applicable")
    destination_ip: Optional[str] = Field(None, description="Destination IP when applicable")
    file: Optional[str] = Field(None, description="File involved when applicable")
    server: Optional[str] = Field(None, description="Server involved when applicable")
    evidence_id: Optional[str] = Field(None, description="Supporting evidence identifier when applicable")


class EventCreate(EventBase):
    event_id: Optional[str] = Field(None, description="Unique event identifier (e.g. EVT-001)")


class EventResponse(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    case_id: str = Field(..., description="Investigation case identifier")
    timestamp: str = Field(..., description="Event occurrence time")
    event_type: str = Field(..., description="Type of activity")
    user: Optional[str] = Field(None, description="User/account involved")
    device: Optional[str] = Field(None, description="Device involved")
    source_ip: Optional[str] = Field(None, description="Source IP when applicable")
    destination_ip: Optional[str] = Field(None, description="Destination IP when applicable")
    file: Optional[str] = Field(None, description="File involved when applicable")
    server: Optional[str] = Field(None, description="Server involved when applicable")
    evidence_id: Optional[str] = Field(None, description="Supporting evidence identifier when applicable")

    model_config = ConfigDict(from_attributes=True)
