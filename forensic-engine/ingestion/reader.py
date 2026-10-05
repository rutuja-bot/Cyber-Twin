"""Raw log file ingestion module for forensic artifacts."""

import hashlib
from pathlib import Path
from typing import Dict, List, Optional, Union

from .models import RawRecord


DEFAULT_EVIDENCE_MAP: Dict[str, str] = {
    "auth.log": "EVD-001",
    "endpoint.log": "EVD-002",
    "server.log": "EVD-003",
    "file_access.log": "EVD-004",
    "firewall.log": "EVD-005",
}


class LogIngester:
    """Ingests raw security log files into structured RawRecord containers.

    Ingestion preserves raw text, line numbering, source metadata, SHA-256 integrity
    hashes, and evidence tracking IDs without performing format-specific parsing.
    """

    def __init__(self, evidence_map: Optional[Dict[str, str]] = None):
        self.evidence_map = evidence_map or DEFAULT_EVIDENCE_MAP

    @staticmethod
    def calculate_file_hash(file_path: Union[str, Path]) -> str:
        """Calculate SHA-256 hash of the target log file for chain of custody."""
        sha256 = hashlib.sha256()
        path = Path(file_path)
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    def get_evidence_id(self, filename: str) -> str:
        """Resolve evidence ID for a given log source."""
        if filename in self.evidence_map:
            return self.evidence_map[filename]
        # Fallback deterministic evidence ID based on filename
        sanitized = filename.replace(".", "_").upper()
        return f"EVD-{sanitized}"

    def ingest_file(
        self, file_path: Union[str, Path], evidence_id: Optional[str] = None
    ) -> List[RawRecord]:
        """Ingest a single log file into a list of RawRecord objects."""
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"Log file not found: {file_path}")

        file_hash = self.calculate_file_hash(path)
        ev_id = evidence_id or self.get_evidence_id(path.name)
        records: List[RawRecord] = []

        with open(path, "r", encoding="utf-8") as f:
            for line_idx, line in enumerate(f, start=1):
                clean_line = line.strip()
                if not clean_line or clean_line.startswith("#"):
                    continue
                records.append(
                    RawRecord(
                        source=path.name,
                        file_path=str(path.resolve()),
                        line_number=line_idx,
                        raw_text=clean_line,
                        evidence_id=ev_id,
                        file_hash=file_hash,
                    )
                )

        return records

    def ingest_directory(
        self, dir_path: Union[str, Path], pattern: str = "*.log"
    ) -> List[RawRecord]:
        """Ingest all matching log files in a directory deterministically."""
        directory = Path(dir_path)
        if not directory.is_dir():
            raise NotADirectoryError(f"Directory not found: {dir_path}")

        # Deterministic sorting by filename
        log_files = sorted(directory.glob(pattern), key=lambda p: p.name)
        all_records: List[RawRecord] = []

        for log_file in log_files:
            all_records.extend(self.ingest_file(log_file))

        return all_records
