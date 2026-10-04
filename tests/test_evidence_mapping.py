"""Tests for Evidence Mapping module and MITRE ATT&CK threat intelligence alignment."""

from pathlib import Path
import sys
import unittest

# Ensure forensic-engine is in sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
FORENSIC_DIR = REPO_ROOT / "forensic-engine"
if str(FORENSIC_DIR) not in sys.path:
    sys.path.insert(0, str(FORENSIC_DIR))

import types
if "evidence_mapping" not in sys.modules:
    _pkg = types.ModuleType("evidence_mapping")
    _pkg.__path__ = [str(FORENSIC_DIR / "evidence-mapping")]
    _pkg.__file__ = str(FORENSIC_DIR / "evidence-mapping" / "__init__.py")
    sys.modules["evidence_mapping"] = _pkg

from evidence_mapping.mapper import EvidenceMapper
from evidence_mapping.models import MappedEvent, MitreTechnique
from normalization.models import NormalizedEvent


class TestEvidenceMapping(unittest.TestCase):
    """Verifies that normalized events map accurately to MITRE ATT&CK techniques and entities."""

    def setUp(self):
        self.mapper = EvidenceMapper()

    def test_map_suspicious_login_to_initial_access(self):
        event = NormalizedEvent(
            event_id="EVT-001",
            case_id="CASE-001",
            timestamp="2026-10-04T10:15:00",
            event_type="suspicious_login",
            user="employee01",
            device="WORKSTATION-01",
            source_ip="192.168.1.20",
            evidence_id="EVD-001",
        )
        mapped = self.mapper.map_event(event)
        self.assertIsInstance(mapped, MappedEvent)
        self.assertIsNotNone(mapped.mitre_attack)
        self.assertEqual(mapped.mitre_attack.technique_id, "T1078.002")
        self.assertEqual(mapped.mitre_attack.tactic, "Initial Access")
        self.assertIn("user:employee01", mapped.entities)
        self.assertIn("device:WORKSTATION-01", mapped.entities)
        self.assertIn("ip:192.168.1.20", mapped.entities)
        self.assertGreaterEqual(mapped.confidence, 0.90)

    def test_map_process_spawn_to_execution(self):
        event = NormalizedEvent(
            event_id="EVT-002",
            case_id="CASE-001",
            timestamp="2026-10-04T10:18:30",
            event_type="suspicious_process_spawn",
            user="employee01",
            device="WORKSTATION-01",
            file="powershell.exe",
            evidence_id="EVD-002",
        )
        mapped = self.mapper.map_event(event)
        self.assertEqual(mapped.mitre_attack.technique_id, "T1059.001")
        self.assertEqual(mapped.mitre_attack.tactic, "Execution")
        self.assertIn("file:powershell.exe", mapped.entities)

    def test_map_internal_connection_to_lateral_movement(self):
        event = NormalizedEvent(
            event_id="EVT-003",
            case_id="CASE-001",
            timestamp="2026-10-04T10:21:05",
            event_type="internal_server_connection",
            user="employee01",
            device="WORKSTATION-01",
            source_ip="192.168.1.20",
            server="SRV-CORP-FILE",
            evidence_id="EVD-003",
        )
        mapped = self.mapper.map_event(event)
        self.assertEqual(mapped.mitre_attack.technique_id, "T1021.002")
        self.assertEqual(mapped.mitre_attack.tactic, "Lateral Movement")
        self.assertIn("server:SRV-CORP-FILE", mapped.entities)

    def test_map_sensitive_file_access_to_collection(self):
        event = NormalizedEvent(
            event_id="EVT-004",
            case_id="CASE-001",
            timestamp="2026-10-04T10:22:45",
            event_type="sensitive_file_access",
            user="employee01",
            device="WORKSTATION-01",
            file=r"\\SRV-CORP-FILE\confidential\customer_data.csv",
            server="SRV-CORP-FILE",
            evidence_id="EVD-004",
        )
        mapped = self.mapper.map_event(event)
        self.assertEqual(mapped.mitre_attack.technique_id, "T1039")
        self.assertEqual(mapped.mitre_attack.tactic, "Collection")
        self.assertIn(r"file:\\SRV-CORP-FILE\confidential\customer_data.csv", mapped.entities)

    def test_map_network_connection_to_c2(self):
        event = NormalizedEvent(
            event_id="EVT-005",
            case_id="CASE-001",
            timestamp="2026-10-04T10:24:15",
            event_type="suspicious_network_connection",
            source_ip="192.168.1.20",
            destination_ip="198.51.100.24",
            evidence_id="EVD-005",
        )
        mapped = self.mapper.map_event(event)
        self.assertEqual(mapped.mitre_attack.technique_id, "T1071.001")
        self.assertEqual(mapped.mitre_attack.tactic, "Command and Control")

    def test_map_data_transfer_to_exfiltration(self):
        event = NormalizedEvent(
            event_id="EVT-006",
            case_id="CASE-001",
            timestamp="2026-10-04T10:25:00",
            event_type="outbound_data_transfer",
            source_ip="192.168.1.20",
            destination_ip="198.51.100.24",
            evidence_id="EVD-005",
        )
        mapped = self.mapper.map_event(event)
        self.assertEqual(mapped.mitre_attack.technique_id, "T1048.003")
        self.assertEqual(mapped.mitre_attack.tactic, "Exfiltration")

    def test_map_unknown_event_fallback(self):
        event = NormalizedEvent(
            event_id="EVT-999",
            case_id="CASE-001",
            timestamp="2026-10-04T12:00:00",
            event_type="unknown_custom_telemetry",
        )
        mapped = self.mapper.map_event(event)
        self.assertEqual(mapped.mitre_attack.technique_id, "T0000")
        self.assertEqual(mapped.mitre_attack.tactic, "Unknown")
        self.assertEqual(mapped.confidence, 0.50)


if __name__ == "__main__":
    unittest.main()
