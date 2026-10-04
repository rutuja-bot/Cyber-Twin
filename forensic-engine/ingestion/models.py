"""Data models for raw log ingestion."""

from dataclasses import dataclass, asdict
from typing import Any, Dict


@dataclass
class RawRecord:
    """Represents an unparsed raw log record with provenance and integrity metadata."""

    source: str
    file_path: str
    line_number: int
    raw_text: str
    evidence_id: str
    file_hash: str

    def to_dict(self) -> Dict[str, Any]:
        """Convert record to dictionary."""
        return asdict(self)
