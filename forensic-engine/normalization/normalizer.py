"""Event normalizer converting parsed records into the canonical Cyber Twin Event schema."""

from typing import List, Optional

from parsing.base import ParsedRecord
from .models import NormalizedEvent
from .timestamp import normalize_timestamp


class EventNormalizer:
    """Normalizes parsed log records into standardized events adhering to the Event API contract."""

    def __init__(self, case_id: str = "CASE-001", default_year: int = 2026):
        self.case_id = case_id
        self.default_year = default_year

    def normalize(
        self,
        record: ParsedRecord,
        event_id: str,
        case_id: Optional[str] = None,
    ) -> NormalizedEvent:
        """Convert a single parsed record into a NormalizedEvent."""
        norm_ts = normalize_timestamp(record.timestamp_raw, default_year=self.default_year)
        active_case_id = case_id or self.case_id

        return NormalizedEvent(
            event_id=event_id,
            case_id=active_case_id,
            timestamp=norm_ts,
            event_type=record.event_type,
            user=record.user,
            device=record.device,
            source_ip=record.source_ip,
            destination_ip=record.destination_ip,
            file=record.file,
            server=record.server,
            evidence_id=record.evidence_id,
        )

    def normalize_all(
        self,
        records: List[ParsedRecord],
        case_id: Optional[str] = None,
    ) -> List[NormalizedEvent]:
        """Normalize a collection of parsed records deterministically.

        Records are ordered chronologically by normalized timestamp before deterministic
        event ID assignment (e.g. EVT-001, EVT-002).
        """
        active_case_id = case_id or self.case_id

        # Precompute normalized timestamp for deterministic sort
        annotated = []
        for rec in records:
            norm_ts = normalize_timestamp(rec.timestamp_raw, default_year=self.default_year)
            annotated.append((norm_ts, rec.source, rec.line_number, rec))

        # Sort by timestamp, then source, then line_number
        annotated.sort(key=lambda item: (item[0], item[1], item[2]))

        normalized_events: List[NormalizedEvent] = []
        for idx, (norm_ts, _, _, rec) in enumerate(annotated, start=1):
            event_id = f"EVT-{idx:03d}"
            event = NormalizedEvent(
                event_id=event_id,
                case_id=active_case_id,
                timestamp=norm_ts,
                event_type=rec.event_type,
                user=rec.user,
                device=rec.device,
                source_ip=rec.source_ip,
                destination_ip=rec.destination_ip,
                file=rec.file,
                server=rec.server,
                evidence_id=rec.evidence_id,
            )
            normalized_events.append(event)

        return normalized_events
