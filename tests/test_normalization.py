"""Tests for timestamp and event normalization."""

from pathlib import Path
import sys
import unittest

# Ensure forensic-engine is in sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
FORENSIC_DIR = REPO_ROOT / "forensic-engine"
if str(FORENSIC_DIR) not in sys.path:
    sys.path.insert(0, str(FORENSIC_DIR))

from normalization.models import NormalizedEvent
from normalization.normalizer import EventNormalizer
from normalization.timestamp import normalize_timestamp
from parsing.base import ParsedRecord


class TestNormalization(unittest.TestCase):
    """Verifies timestamp standardization and normalized Event contract."""

    def test_timestamp_normalization_iso(self):
        self.assertEqual(normalize_timestamp("2026-10-04T10:15:00"), "2026-10-04T10:15:00")
        self.assertEqual(normalize_timestamp("2026-10-04 10:15:00"), "2026-10-04T10:15:00")
        self.assertEqual(normalize_timestamp("2026-10-04T10:15:00Z"), "2026-10-04T10:15:00")
        self.assertEqual(normalize_timestamp("2026-10-04T10:15:00+00:00"), "2026-10-04T10:15:00")
        self.assertEqual(normalize_timestamp("2026-10-04 10:15:00.123456"), "2026-10-04T10:15:00")

    def test_timestamp_normalization_syslog(self):
        self.assertEqual(normalize_timestamp("Oct 04 10:15:00", default_year=2026), "2026-10-04T10:15:00")
        self.assertEqual(normalize_timestamp("Oct  4 10:15:00", default_year=2026), "2026-10-04T10:15:00")

    def test_timestamp_normalization_slashes(self):
        self.assertEqual(normalize_timestamp("2026/10/04 10:15:00"), "2026-10-04T10:15:00")

    def test_timestamp_invalid_raises(self):
        with self.assertRaises(ValueError):
            normalize_timestamp("invalid-date-string")

    def test_event_normalization_fields_and_nullable(self):
        normalizer = EventNormalizer(case_id="CASE-001")
        record = ParsedRecord(
            timestamp_raw="2026-10-04 10:15:00",
            event_type="suspicious_login",
            user="employee01",
            device="WORKSTATION-01",
            source_ip="192.168.1.20",
            destination_ip=None,
            file=None,
            server=None,
            evidence_id="EVD-001",
        )
        evt = normalizer.normalize(record, event_id="EVT-001")
        d = evt.to_dict()

        expected = {
            "event_id": "EVT-001",
            "case_id": "CASE-001",
            "timestamp": "2026-10-04T10:15:00",
            "event_type": "suspicious_login",
            "user": "employee01",
            "device": "WORKSTATION-01",
            "source_ip": "192.168.1.20",
            "destination_ip": None,
            "file": None,
            "server": None,
            "evidence_id": "EVD-001",
        }
        self.assertEqual(d, expected)

    def test_deterministic_event_id_generation(self):
        normalizer = EventNormalizer(case_id="CASE-001")
        # Give records out of chronological order
        records = [
            ParsedRecord(timestamp_raw="2026-10-04 10:25:00", event_type="transfer", source="firewall.log", line_number=2),
            ParsedRecord(timestamp_raw="2026-10-04 10:15:00", event_type="login", source="auth.log", line_number=1),
            ParsedRecord(timestamp_raw="2026-10-04 10:18:30", event_type="spawn", source="endpoint.log", line_number=1),
        ]
        events = normalizer.normalize_all(records)
        self.assertEqual(len(events), 3)

        # First event must be the earliest
        self.assertEqual(events[0].event_id, "EVT-001")
        self.assertEqual(events[0].event_type, "login")
        self.assertEqual(events[0].timestamp, "2026-10-04T10:15:00")

        self.assertEqual(events[1].event_id, "EVT-002")
        self.assertEqual(events[1].event_type, "spawn")
        self.assertEqual(events[1].timestamp, "2026-10-04T10:18:30")

        self.assertEqual(events[2].event_id, "EVT-003")
        self.assertEqual(events[2].event_type, "transfer")
        self.assertEqual(events[2].timestamp, "2026-10-04T10:25:00")


if __name__ == "__main__":
    unittest.main()
