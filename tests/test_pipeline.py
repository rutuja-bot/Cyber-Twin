"""Tests for end-to-end forensic engine pipeline and normalized Event JSON structure."""

import json
from pathlib import Path
import sys
import tempfile
import unittest

# Ensure forensic-engine is in sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
FORENSIC_DIR = REPO_ROOT / "forensic-engine"
if str(FORENSIC_DIR) not in sys.path:
    sys.path.insert(0, str(FORENSIC_DIR))

from pipeline import ForensicPipeline, run


REQUIRED_EVENT_FIELDS = [
    "event_id",
    "case_id",
    "timestamp",
    "event_type",
    "user",
    "device",
    "source_ip",
    "destination_ip",
    "file",
    "server",
    "evidence_id",
]


class TestForensicPipelineEndToEnd(unittest.TestCase):
    """End-to-end verification of raw logs -> Ingestion -> Parsing -> Normalization -> JSON."""

    def setUp(self):
        self.raw_dir = REPO_ROOT / "data" / "raw"
        self.processed_file = REPO_ROOT / "data" / "processed" / "normalized_events.json"

    def test_full_pipeline_execution(self):
        with tempfile.TemporaryDirectory() as tmp_dir:
            temp_out = Path(tmp_dir) / "test_normalized_events.json"
            pipeline = ForensicPipeline(case_id="CASE-001")
            events = pipeline.process_directory(self.raw_dir, output_file=temp_out)

            self.assertGreaterEqual(len(events), 5)
            self.assertTrue(temp_out.exists())

            with open(temp_out, "r", encoding="utf-8") as f:
                saved_json = json.load(f)

            self.assertEqual(len(saved_json), len(events))

    def test_normalized_event_json_structure(self):
        """Verify each event in the output strictly matches the required 11-field Event API contract."""
        self.assertTrue(self.processed_file.exists(), "normalized_events.json does not exist")

        with open(self.processed_file, "r", encoding="utf-8") as f:
            events = json.load(f)

        self.assertIsInstance(events, list)
        self.assertGreaterEqual(len(events), 5)

        for idx, event in enumerate(events, start=1):
            # Check exactly required keys
            self.assertEqual(
                list(event.keys()),
                REQUIRED_EVENT_FIELDS,
                f"Event {idx} keys do not exactly match the required Event contract schema",
            )

            # Check field types and nullability rules
            self.assertTrue(isinstance(event["event_id"], str) and event["event_id"].startswith("EVT-"))
            self.assertEqual(event["case_id"], "CASE-001")
            self.assertTrue(isinstance(event["timestamp"], str) and "T" in event["timestamp"])
            self.assertTrue(isinstance(event["event_type"], str) and len(event["event_type"]) > 0)
            self.assertTrue(event["user"] is None or isinstance(event["user"], str))
            self.assertTrue(event["device"] is None or isinstance(event["device"], str))
            self.assertTrue(event["source_ip"] is None or isinstance(event["source_ip"], str))
            self.assertTrue(event["destination_ip"] is None or isinstance(event["destination_ip"], str))
            self.assertTrue(event["file"] is None or isinstance(event["file"], str))
            self.assertTrue(event["server"] is None or isinstance(event["server"], str))
            self.assertTrue(event["evidence_id"] is None or isinstance(event["evidence_id"], str))

    def test_evt_001_exact_contract(self):
        """Verify EVT-001 matches the expected incident kickoff event."""
        with open(self.processed_file, "r", encoding="utf-8") as f:
            events = json.load(f)

        evt_001 = events[0]
        expected_evt_001 = {
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
        self.assertEqual(evt_001, expected_evt_001)

    def test_complete_incident_represented(self):
        """Verify the complete incident attack chain is present across normalized events."""
        with open(self.processed_file, "r", encoding="utf-8") as f:
            events = json.load(f)

        event_types = [e["event_type"] for e in events]
        evidence_ids = {e["evidence_id"] for e in events}

        # 1. Suspicious Login
        self.assertIn("suspicious_login", event_types)
        # 2. Internal Workstation execution
        self.assertIn("suspicious_process_spawn", event_types)
        # 3. Internal Server Connection
        self.assertIn("internal_server_connection", event_types)
        # 4. Sensitive File Access
        self.assertIn("sensitive_file_access", event_types)
        # 5. Suspicious Network Connection
        self.assertIn("suspicious_network_connection", event_types)
        # 6. External IP / Possible Data Transfer
        self.assertIn("outbound_data_transfer", event_types)

        # All 5 simulated logs must be represented via their evidence IDs
        self.assertTrue({"EVD-001", "EVD-002", "EVD-003", "EVD-004", "EVD-005"}.issubset(evidence_ids))

    def test_incident_reconstruction_json_structure(self):
        """Verify the generated incident_reconstruction.json artifact structure and properties."""
        reconstruction_file = REPO_ROOT / "data" / "processed" / "incident_reconstruction.json"
        self.assertTrue(reconstruction_file.exists(), "incident_reconstruction.json does not exist")

        with open(reconstruction_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertEqual(data["case_id"], "CASE-001")
        self.assertEqual(data["status"], "reconstructed")
        self.assertIn("timeline", data)
        self.assertIn("graph", data)
        self.assertIn("attack_progression", data)
        self.assertIn("findings", data)
        self.assertIn("events", data)

        # Graph verification
        graph = data["graph"]
        self.assertGreaterEqual(len(graph["nodes"]), 5)
        self.assertGreaterEqual(len(graph["edges"]), 5)

        # Attack progression verification
        stages = [s["stage_name"] for s in data["attack_progression"]]
        self.assertIn("Initial Access", stages)
        self.assertIn("Execution", stages)
        self.assertIn("Lateral Movement", stages)
        self.assertIn("Collection", stages)
        self.assertIn("Command and Control", stages)
        self.assertIn("Exfiltration", stages)

        # Findings verification
        finding_ids = [f["finding_id"] for f in data["findings"]]
        self.assertIn("FND-001", finding_ids)
        self.assertIn("FND-002", finding_ids)
        self.assertIn("FND-003", finding_ids)

    def test_run_full_pipeline_helper(self):
        """Verify run() helper outputs both files and returns events and reconstructed incident."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            evts_out = Path(tmp_dir) / "events.json"
            recon_out = Path(tmp_dir) / "recon.json"

            events, incident = run(
                raw_dir=self.raw_dir,
                events_output=evts_out,
                reconstruction_output=recon_out,
                case_id="CASE-001",
            )
            self.assertEqual(len(events), 6)
            self.assertEqual(incident.total_events, 6)
            self.assertTrue(evts_out.exists())
            self.assertTrue(recon_out.exists())


if __name__ == "__main__":
    unittest.main()
