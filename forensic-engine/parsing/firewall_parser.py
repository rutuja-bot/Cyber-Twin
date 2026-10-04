"""Parser for perimeter network firewall traffic and connection logs."""

import re
import shlex
from typing import Optional

from ingestion.models import RawRecord
from .base import BaseLogParser, ParsedRecord


class FirewallLogParser(BaseLogParser):
    """Parses network firewall logs (iptables, Cisco, pfSense, generic key-value firewall)."""

    KV_PATTERN = re.compile(
        r"^(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s+\[FIREWALL\]\s+(?P<kv>.+)$",
        re.IGNORECASE,
    )

    TEXT_PATTERN = re.compile(
        r"^(?P<timestamp>\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\s+firewall\.log:\s+"
        r"(?:OUTBOUND\s+)?(?P<proto>\w+)\s+(?P<src_ip>\d+\.\d+\.\d+\.\d+)(?::(?P<src_port>\d+))?\s+"
        r"->\s+(?P<dst_ip>\d+\.\d+\.\d+\.\d+)(?::(?P<dst_port>\d+))?"
        r"(?:\s+BYTES_SENT=(?P<bytes_sent>\d+))?",
        re.IGNORECASE,
    )

    def can_parse(self, record: RawRecord) -> bool:
        if "firewall" in record.source.lower():
            return True
        text = record.raw_text.lower()
        return "[firewall]" in text or "firewall.log" in text or "bytes_sent=" in text

    @staticmethod
    def _split_ip_port(ip_port_str: Optional[str]):
        if not ip_port_str:
            return None, None
        if ":" in ip_port_str:
            parts = ip_port_str.split(":", 1)
            return parts[0], int(parts[1]) if parts[1].isdigit() else None
        return ip_port_str, None

    def parse(self, record: RawRecord) -> Optional[ParsedRecord]:
        line = record.raw_text

        # Try Key-Value style: [FIREWALL] PROTO=TCP SRC=... DST=... ACTION=... BYTES_SENT=...
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

            raw_src = kvs.get("src")
            raw_dst = kvs.get("dst")
            proto = kvs.get("proto", "TCP")
            action = kvs.get("action", "ALLOW")
            bytes_sent_str = kvs.get("bytes_sent") or kvs.get("bytes")
            bytes_rcvd_str = kvs.get("bytes_rcvd")

            src_ip, src_port = self._split_ip_port(raw_src)
            dst_ip, dst_port = self._split_ip_port(raw_dst)

            bytes_sent = int(bytes_sent_str) if bytes_sent_str and bytes_sent_str.isdigit() else 0
            bytes_rcvd = int(bytes_rcvd_str) if bytes_rcvd_str and bytes_rcvd_str.isdigit() else 0

            # High volume outbound bytes indicates data transfer/exfiltration
            if bytes_sent > 1000000:
                event_type = "outbound_data_transfer"
            else:
                event_type = "suspicious_network_connection"

            extra = {
                "proto": proto,
                "action": action,
                "bytes_sent": bytes_sent,
                "bytes_rcvd": bytes_rcvd,
            }
            if src_port:
                extra["source_port"] = src_port
            if dst_port:
                extra["destination_port"] = dst_port

            return ParsedRecord(
                timestamp_raw=timestamp_raw,
                event_type=event_type,
                user=None,
                device=None,
                source_ip=src_ip,
                destination_ip=dst_ip,
                file=None,
                server=None,
                evidence_id=record.evidence_id,
                source=record.source,
                line_number=record.line_number,
                raw_text=record.raw_text,
                extra_metadata=extra,
            )

        # Try Text style
        text_match = self.TEXT_PATTERN.match(line)
        if text_match:
            gd = text_match.groupdict()
            bytes_sent = int(gd["bytes_sent"]) if gd.get("bytes_sent") else 0
            event_type = "outbound_data_transfer" if bytes_sent > 1000000 else "suspicious_network_connection"

            extra = {
                "proto": gd.get("proto", "TCP"),
                "bytes_sent": bytes_sent,
            }
            if gd.get("src_port"):
                extra["source_port"] = int(gd["src_port"])
            if gd.get("dst_port"):
                extra["destination_port"] = int(gd["dst_port"])

            return ParsedRecord(
                timestamp_raw=gd["timestamp"],
                event_type=event_type,
                user=None,
                device=None,
                source_ip=gd.get("src_ip"),
                destination_ip=gd.get("dst_ip"),
                file=None,
                server=None,
                evidence_id=record.evidence_id,
                source=record.source,
                line_number=record.line_number,
                raw_text=record.raw_text,
                extra_metadata=extra,
            )

        return None
