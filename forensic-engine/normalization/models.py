"""Normalized Event data model aligned with Cyber Twin Event API contract."""

from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class NormalizedEvent:
    """Represents a discrete, normalized cyber event extracted from evidence."""

    event_id: str
    case_id: str
    timestamp: str
    event_type: str
    user: Optional[str] = None
    device: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    file: Optional[str] = None
    server: Optional[str] = None
    evidence_id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to ordered dictionary exactly matching the Event API contract."""
        return {
            "event_id": self.event_id,
            "case_id": self.case_id,
            "timestamp": self.timestamp,
            "event_type": self.event_type,
            "user": self.user,
            "device": self.device,
            "source_ip": self.source_ip,
            "destination_ip": self.destination_ip,
            "file": self.file,
            "server": self.server,
            "evidence_id": self.evidence_id,
        }
