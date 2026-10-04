"""Base parser classes and structured parsed representations."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict, Optional

from ingestion.models import RawRecord


@dataclass
class ParsedRecord:
    """Represents a structured record extracted from a raw log entry."""

    timestamp_raw: str
    event_type: str
    user: Optional[str] = None
    device: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    file: Optional[str] = None
    server: Optional[str] = None
    evidence_id: Optional[str] = None
    source: str = ""
    line_number: int = 0
    raw_text: str = ""
    extra_metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert parsed record to dictionary."""
        return {
            "timestamp_raw": self.timestamp_raw,
            "event_type": self.event_type,
            "user": self.user,
            "device": self.device,
            "source_ip": self.source_ip,
            "destination_ip": self.destination_ip,
            "file": self.file,
            "server": self.server,
            "evidence_id": self.evidence_id,
            "source": self.source,
            "line_number": self.line_number,
            "raw_text": self.raw_text,
            "extra_metadata": self.extra_metadata,
        }


class BaseLogParser(ABC):
    """Abstract base class for log parsers."""

    @abstractmethod
    def can_parse(self, record: RawRecord) -> bool:
        """Return True if this parser can handle the given raw record."""
        pass

    @abstractmethod
    def parse(self, record: RawRecord) -> Optional[ParsedRecord]:
        """Parse raw record into a structured ParsedRecord.

        Returns None if record cannot be parsed or represents unactionable noise.
        """
        pass
