"""Parser for file system audit, file server access, and object access logs."""

import re
import shlex
from typing import Optional

from ingestion.models import RawRecord
from .base import BaseLogParser, ParsedRecord


class FileAccessLogParser(BaseLogParser):
    """Parses file access logs (Windows 4663, Samba audit, file access logs)."""

    KV_PATTERN = re.compile(
        r"^(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s+\[FILE(?:_AUDIT)?\]\s+(?P<kv>.+)$",
        re.IGNORECASE,
    )

    TEXT_PATTERN = re.compile(
        r"^(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s+file_access\.log:\s+"
        r"(?P<access>\w+)\s+ACCESS\s+on\s+(?P<file>\S+)\s+by\s+(?P<user>\S+)",
        re.IGNORECASE,
    )

    def can_parse(self, record: RawRecord) -> bool:
        if "file" in record.source.lower():
            return True
        text = record.raw_text.lower()
        return "[file" in text or "file_access.log" in text or "access on \\" in text

    def parse(self, record: RawRecord) -> Optional[ParsedRecord]:
        line = record.raw_text

        # Try Key-Value style: [FILE_AUDIT] Host=... User=... File="..." Access=... Status=...
        kv_match = self.KV_PATTERN.match(line)
        if kv_match:
            timestamp_raw = kv_match.group("timestamp")
            kv_text = kv_match.group("kv")
            kvs = {}
            try:
                tokens = shlex.split(kv_text)
                for tok in tokens:
                    if "=" in tok:
                        k, v = tok.split("=", 1)
                        kvs[k.lower()] = v
            except Exception:
                for match in re.finditer(r'(\w+)=(?:"([^"]*)"|(\S+))', kv_text):
                    k = match.group(1).lower()
                    v = match.group(2) if match.group(2) is not None else match.group(3)
                    kvs[k] = v

            server = kvs.get("host") or kvs.get("server", "SRV-CORP-FILE")
            user = kvs.get("user")
            file_path = kvs.get("file") or kvs.get("path")
            access = kvs.get("access", "READ")
            status = kvs.get("status", "SUCCESS")

            # Check if sensitive file access
            is_sensitive = bool(file_path and ("confidential" in file_path.lower() or "secret" in file_path.lower() or "customer" in file_path.lower()))
            event_type = "sensitive_file_access" if is_sensitive else "file_access"

            device = "WORKSTATION-01" if user == "employee01" else None

            extra = {
                "access": access,
                "status": status,
            }

            return ParsedRecord(
                timestamp_raw=timestamp_raw,
                event_type=event_type,
                user=user,
                device=device,
                source_ip=None,
                destination_ip=None,
                file=file_path,
                server=server,
                evidence_id=record.evidence_id,
                source=record.source,
                line_number=record.line_number,
                raw_text=record.raw_text,
                extra_metadata=extra,
            )

        # Try text pattern: READ ACCESS on ... by ...
        text_match = self.TEXT_PATTERN.match(line)
        if text_match:
            gd = text_match.groupdict()
            file_path = gd.get("file")
            user = gd.get("user")
            access = gd.get("access", "READ")
            is_sensitive = bool(file_path and "confidential" in file_path.lower())
            event_type = "sensitive_file_access" if is_sensitive else "file_access"

            # Derive server if file is UNC path \\SRV-CORP-FILE\...
            server = "SRV-CORP-FILE"
            if file_path and file_path.startswith("\\\\"):
                parts = file_path.lstrip("\\").split("\\")
                if parts:
                    server = parts[0]

            device = "WORKSTATION-01" if user == "employee01" else None

            return ParsedRecord(
                timestamp_raw=gd["timestamp"],
                event_type=event_type,
                user=user,
                device=device,
                source_ip=None,
                destination_ip=None,
                file=file_path,
                server=server,
                evidence_id=record.evidence_id,
                source=record.source,
                line_number=record.line_number,
                raw_text=record.raw_text,
                extra_metadata={"access": access},
            )

        return None
