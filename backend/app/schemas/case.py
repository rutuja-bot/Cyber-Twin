from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class CaseBase(BaseModel):
    title: str = Field(..., description="Title of the forensic investigation case")
    description: Optional[str] = Field("", description="Detailed summary of the case")
    status: str = Field("open", description="Case status: 'open' or 'closed'")


class CaseCreate(CaseBase):
    case_id: Optional[str] = Field(None, description="Unique case identifier (e.g. CASE-001). Auto-assigned if omitted.")


class CaseResponse(CaseBase):
    case_id: str

    model_config = ConfigDict(from_attributes=True)
