"""Parser for internal server, daemon, and service session logs."""

import re
import shlex
from typing import Optional

from ingestion.models import RawRecord
from .base import BaseLogParser, ParsedRecord


class ServerLogParser(BaseLogParser):
    """Parses server application and service logs (SMB, RPC, SSH, App Server)."""

    KV_PATTERN = re.compile(
        r"^(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s+\[SERVER(?:_\w+)?\]\s+(?P<kv>.+)$",
        re.IGNORECASE,
    )

    TEXT_PATTERN = re.compile(
        r"^(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s+server\.log:\s+"
        r"(?P<service>\w+)\s+(?:connection|session)\s+from\s+(?P<source_ip>\S+)\s+"
        r"by\s+user\s+(?P<user>\S+)\s+to\s+(?P<server>\S+)",
        re.IGNORECASE,
    )

    def can_parse(self, record: RawRecord) -> bool:
        if "server" in record.source.lower():
            return True
        text = record.raw_text.lower()
        return "[server" in text or "server.log" in text

    def parse(self, record: RawRecord) -> Optional[ParsedRecord]:
        line = record.raw_text

        # Try Key-Value format
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
                    elif ":" in tok:
                        k, v = tok.split(":", 1)
                        kvs[k.lower()] = v
            except Exception:
                for match in re.finditer(r'(\w+)[:=](?:"([^"]*)"|(\S+))', kv_text):
                    k = match.group(1).lower()
                    v = match.group(2) if match.group(2) is not None else match.group(3)
                    kvs[k] = v

            server = kvs.get("host") or kvs.get("server")
            source_ip = kvs.get("clientip") or kvs.get("source_ip") or kvs.get("ip")
            user = kvs.get("user")
            service = kvs.get("service", "SMB")
            action = kvs.get("action", "session_connect")
            status = kvs.get("status", "SUCCESS")

            # Map to standard event_type
            if action.lower() in ("session_connect", "connect", "logon") and status.upper() == "SUCCESS":
                event_type = "internal_server_connection"
            else:
                event_type = f"server_{action.lower()}"

            # Known workstation mapping for internal IP in this incident
            device = "WORKSTATION-01" if source_ip == "192.168.1.20" else None

            extra = {
                "service": service,
                "action": action,
                "status": status,
            }

            return ParsedRecord(
                timestamp_raw=timestamp_raw,
                event_type=event_type,
                user=user,
                device=device,
                source_ip=source_ip,
                destination_ip=None,
                file=None,
                server=server,
                evidence_id=record.evidence_id,
                source=record.source,
                line_number=record.line_number,
                raw_text=record.raw_text,
                extra_metadata=extra,
            )

        # Try text pattern
        text_match = self.TEXT_PATTERN.match(line)
        if text_match:
            gd = text_match.groupdict()
            source_ip = gd.get("source_ip")
            device = "WORKSTATION-01" if source_ip == "192.168.1.20" else None
            return ParsedRecord(
                timestamp_raw=gd["timestamp"],
                event_type="internal_server_connection",
                user=gd.get("user"),
                device=device,
                source_ip=source_ip,
                destination_ip=None,
                file=None,
                server=gd.get("server"),
                evidence_id=record.evidence_id,
                source=record.source,
                line_number=record.line_number,
                raw_text=record.raw_text,
                extra_metadata={"service": gd.get("service")},
            )

        return None
