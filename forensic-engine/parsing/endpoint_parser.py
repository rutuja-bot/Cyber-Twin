"""Parser for endpoint, EDR, and process execution telemetry logs."""

import re
import shlex
from typing import Optional

from ingestion.models import RawRecord
from .base import BaseLogParser, ParsedRecord


class EndpointLogParser(BaseLogParser):
    """Parses endpoint telemetry logs (Sysmon, EDR, process events)."""

    KV_PATTERN = re.compile(
        r"^(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s+\[ENDPOINT(?:_AUDIT)?\]\s+(?P<kv>.+)$",
        re.IGNORECASE,
    )

    SPAWNED_BY_PATTERN = re.compile(
        r"^(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s+endpoint\.log:\s+"
        r"Process\s+(?P<process>\S+)(?:\s+(?P<args>[^,]+?))?\s+spawned\s+by\s+(?P<user>\S+)\s+"
        r"on\s+(?P<device>\S+)(?:\s+\(PID:\s*(?P<pid>\d+)\))?",
        re.IGNORECASE,
    )

    def can_parse(self, record: RawRecord) -> bool:
        if "endpoint" in record.source.lower():
            return True
        text = record.raw_text.lower()
        return "[endpoint" in text or "process" in text and "spawned by" in text

    def parse(self, record: RawRecord) -> Optional[ParsedRecord]:
        line = record.raw_text

        # Try Key-Value style: [ENDPOINT] Host=... User=... Process=... Action=...
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
                # Simple regex fallback for key=value
                for match in re.finditer(r'(\w+)=(?:"([^"]*)"|(\S+))', kv_text):
                    k = match.group(1).lower()
                    v = match.group(2) if match.group(2) is not None else match.group(3)
                    kvs[k] = v

            device = kvs.get("host") or kvs.get("device")
            user = kvs.get("user")
            process = kvs.get("process")
            cmd = kvs.get("commandline")
            action = kvs.get("action", "process_spawn")
            pid = kvs.get("pid")

            # Determine event_type
            if "suspicious" in action.lower() or (process and "powershell" in process.lower() and cmd and "-enc" in cmd):
                event_type = "suspicious_process_spawn"
            elif action:
                event_type = action
            else:
                event_type = "process_spawn"

            extra = {}
            if cmd:
                extra["command_line"] = cmd
            if pid:
                extra["pid"] = int(pid) if pid.isdigit() else pid

            return ParsedRecord(
                timestamp_raw=timestamp_raw,
                event_type=event_type,
                user=user,
                device=device,
                source_ip=None,
                destination_ip=None,
                file=process,
                server=None,
                evidence_id=record.evidence_id,
                source=record.source,
                line_number=record.line_number,
                raw_text=record.raw_text,
                extra_metadata=extra,
            )

        # Try "Process ... spawned by ... on ..." pattern
        spawn_match = self.SPAWNED_BY_PATTERN.match(line)
        if spawn_match:
            gd = spawn_match.groupdict()
            process = gd.get("process")
            args = gd.get("args")
            user = gd.get("user")
            device = gd.get("device")
            pid = gd.get("pid")

            is_suspicious = bool(process and "powershell" in process.lower() and args and "-enc" in args)
            event_type = "suspicious_process_spawn" if is_suspicious else "process_spawn"

            extra = {}
            if args:
                extra["command_line"] = f"{process} {args}".strip()
            if pid:
                extra["pid"] = int(pid)

            return ParsedRecord(
                timestamp_raw=gd["timestamp"],
                event_type=event_type,
                user=user,
                device=device,
                source_ip=None,
                destination_ip=None,
                file=process,
                server=None,
                evidence_id=record.evidence_id,
                source=record.source,
                line_number=record.line_number,
                raw_text=record.raw_text,
                extra_metadata=extra,
            )

        return None
