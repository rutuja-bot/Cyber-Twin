"""Tests for event correlation and incident reconstruction."""

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

from correlation.correlator import EventCorrelator
from correlation.models import ReconstructedIncident
from evidence_mapping.mapper import EvidenceMapper
from normalization.models import NormalizedEvent


class TestEventCorrelation(unittest.TestCase):
    """Verifies correlation across sources, graph generation, timeline, and findings."""

    def setUp(self):
        self.mapper = EvidenceMapper()
        self.correlator = EventCorrelator(case_id="CASE-001")

        self.sample_events = [
            NormalizedEvent("EVT-001", "CASE-001", "2026-10-04T10:15:00", "suspicious_login", "employee01", "WORKSTATION-01", "192.168.1.20", evidence_id="EVD-001"),
            NormalizedEvent("EVT-002", "CASE-001", "2026-10-04T10:18:30", "suspicious_process_spawn", "employee01", "WORKSTATION-01", file="powershell.exe", evidence_id="EVD-002"),
            NormalizedEvent("EVT-003", "CASE-001", "2026-10-04T10:21:05", "internal_server_connection", "employee01", "WORKSTATION-01", "192.168.1.20", server="SRV-CORP-FILE", evidence_id="EVD-003"),
            NormalizedEvent("EVT-004", "CASE-001", "2026-10-04T10:22:45", "sensitive_file_access", "employee01", "WORKSTATION-01", file=r"\\SRV-CORP-FILE\confidential\customer_data.csv", server="SRV-CORP-FILE", evidence_id="EVD-004"),
            NormalizedEvent("EVT-005", "CASE-001", "2026-10-04T10:24:15", "suspicious_network_connection", source_ip="192.168.1.20", destination_ip="198.51.100.24", evidence_id="EVD-005"),
            NormalizedEvent("EVT-006", "CASE-001", "2026-10-04T10:25:00", "outbound_data_transfer", source_ip="192.168.1.20", destination_ip="198.51.100.24", evidence_id="EVD-005"),
        ]

    def test_correlate_builds_reconstructed_incident(self):
        mapped = self.mapper.map_all(self.sample_events)
        incident = self.correlator.correlate(mapped)

        self.assertIsInstance(incident, ReconstructedIncident)
        self.assertEqual(incident.case_id, "CASE-001")
        self.assertEqual(incident.status, "reconstructed")
        self.assertEqual(incident.total_events, 6)

    def test_timeline_reconstruction_and_sequence(self):
        mapped = self.mapper.map_all(self.sample_events)
        incident = self.correlator.correlate(mapped)

        self.assertEqual(len(incident.timeline), 6)
        for idx, item in enumerate(incident.timeline, start=1):
            self.assertEqual(item.sequence, idx)
            self.assertTrue(item.timeline_event_id.startswith("TL-"))
            self.assertTrue(item.event_id.startswith("EVT-"))

        # Verify stages follow attack chain
        stages = [item.stage for item in incident.timeline]
        self.assertEqual(stages, [
            "Initial Access",
            "Execution",
            "Lateral Movement",
            "Collection",
            "Command and Control",
            "Exfiltration",
        ])

    def test_graph_nodes_and_edges(self):
        mapped = self.mapper.map_all(self.sample_events)
        incident = self.correlator.correlate(mapped)

        node_ids = {n.id for n in incident.graph_nodes}
        self.assertIn("user:employee01", node_ids)
        self.assertIn("device:WORKSTATION-01", node_ids)
        self.assertIn("ip:192.168.1.20", node_ids)
        self.assertIn("server:SRV-CORP-FILE", node_ids)
        self.assertIn("ip:198.51.100.24", node_ids)

        edge_types = {e.type for e in incident.graph_edges}
        self.assertIn("AUTHENTICATED_TO", edge_types)
        self.assertIn("EXECUTED", edge_types)
        self.assertIn("CONNECTED_TO", edge_types)
        self.assertIn("ACCESSED", edge_types)
        self.assertIn("EXFILTRATED_TO", edge_types)

    def test_cross_source_host_ip_correlation(self):
        """Verify that firewall events (which only contain source_ip 192.168.1.20) correlate with WORKSTATION-01."""
        mapped = self.mapper.map_all(self.sample_events)
        incident = self.correlator.correlate(mapped)

        # Edges originating from WORKSTATION-01 targeting external IP 198.51.100.24
        exfil_edges = [
            e for e in incident.graph_edges
            if e.source == "device:WORKSTATION-01" and e.target == "ip:198.51.100.24"
        ]
        self.assertGreater(len(exfil_edges), 0)

    def test_attack_progression_chain(self):
        mapped = self.mapper.map_all(self.sample_events)
        incident = self.correlator.correlate(mapped)

        self.assertEqual(len(incident.attack_progression), 6)
        tactics = [stage.stage_name for stage in incident.attack_progression]
        self.assertEqual(tactics, [
            "Initial Access",
            "Execution",
            "Lateral Movement",
            "Collection",
            "Command and Control",
            "Exfiltration",
        ])

    def test_forensic_findings_synthesis(self):
        mapped = self.mapper.map_all(self.sample_events)
        incident = self.correlator.correlate(mapped)

        self.assertEqual(len(incident.findings), 3)
        finding_ids = [f.finding_id for f in incident.findings]
        self.assertEqual(finding_ids, ["FND-001", "FND-002", "FND-003"])

        severities = {f.severity for f in incident.findings}
        self.assertIn("HIGH", severities)
        self.assertIn("CRITICAL", severities)


if __name__ == "__main__":
    unittest.main()
