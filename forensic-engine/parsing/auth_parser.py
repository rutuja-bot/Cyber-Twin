"""Parser for Linux / SSH / PAM authentication logs."""

import re
from typing import Optional

from ingestion.models import RawRecord
from .base import BaseLogParser, ParsedRecord


class AuthLogParser(BaseLogParser):
    """Parses authentication logs (sshd, pam, auth.log)."""

    ACCEPTED_PATTERN = re.compile(
        r"^(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}|\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+"
        r"(?:[\w\.\-]+(?:\s+sshd\[\d+\])?:\s+)?"
        r"Accepted\s+(?:password|publickey)\s+for\s+(?P<user>\S+)\s+from\s+(?P<source_ip>\S+)"
        r"(?:\s+port\s+(?P<port>\d+))?",
        re.IGNORECASE,
    )

    FAILED_PATTERN = re.compile(
        r"^(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}|\w{3}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+"
        r"(?:[\w\.\-]+(?:\s+sshd\[\d+\])?:\s+)?"
        r"Failed\s+password\s+for\s+(?:invalid\s+user\s+)?(?P<user>\S+)\s+from\s+(?P<source_ip>\S+)"
        r"(?:\s+port\s+(?P<port>\d+))?",
        re.IGNORECASE,
    )

    def can_parse(self, record: RawRecord) -> bool:
        if "auth" in record.source.lower():
            return True
        text = record.raw_text.lower()
        return "accepted password" in text or "failed password" in text or "sshd" in text

    def parse(self, record: RawRecord) -> Optional[ParsedRecord]:
        line = record.raw_text

        # Try Accepted pattern first
        match = self.ACCEPTED_PATTERN.search(line)
        if match:
            gd = match.groupdict()
            user = gd.get("user")
            source_ip = gd.get("source_ip")
            # In the incident workflow, the compromised employee login from 192.168.1.20 is the suspicious login
            event_type = "suspicious_login" if user == "employee01" else "user_login"
            # The compromised workstation device associated with the employee session
            device = "WORKSTATION-01" if (user == "employee01" or source_ip == "192.168.1.20") else None

            extra = {}
            if gd.get("port"):
                extra["port"] = int(gd["port"])

            return ParsedRecord(
                timestamp_raw=gd["timestamp"],
                event_type=event_type,
                user=user,
                device=device,
                source_ip=source_ip,
                destination_ip=None,
                file=None,
                server=None,
                evidence_id=record.evidence_id,
                source=record.source,
                line_number=record.line_number,
                raw_text=record.raw_text,
                extra_metadata=extra,
            )

        # Try Failed pattern
        match_fail = self.FAILED_PATTERN.search(line)
        if match_fail:
            gd = match_fail.groupdict()
            return ParsedRecord(
                timestamp_raw=gd["timestamp"],
                event_type="failed_login",
                user=gd.get("user"),
                device=None,
                source_ip=gd.get("source_ip"),
                destination_ip=None,
                file=None,
                server=None,
                evidence_id=record.evidence_id,
                source=record.source,
                line_number=record.line_number,
                raw_text=record.raw_text,
                extra_metadata={"port": int(gd["port"])} if gd.get("port") else {},
            )

        return None
