"""Tests for log parsing across heterogeneous formats."""

from pathlib import Path
import sys
import unittest

# Ensure forensic-engine is in sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
FORENSIC_DIR = REPO_ROOT / "forensic-engine"
if str(FORENSIC_DIR) not in sys.path:
    sys.path.insert(0, str(FORENSIC_DIR))

from ingestion.models import RawRecord
from parsing.auth_parser import AuthLogParser
from parsing.endpoint_parser import EndpointLogParser
from parsing.file_access_parser import FileAccessLogParser
from parsing.firewall_parser import FirewallLogParser
from parsing.registry import ParserRegistry
from parsing.server_parser import ServerLogParser


class TestLogParsing(unittest.TestCase):
    """Verifies format-specific extraction for each log type."""

    def test_parse_auth_log_accepted(self):
        parser = AuthLogParser()
        raw = RawRecord(
            source="auth.log",
            file_path="/var/log/auth.log",
            line_number=1,
            raw_text="2026-10-04 10:15:00 auth.log sshd[12410]: Accepted password for employee01 from 192.168.1.20 port 44321 ssh2",
            evidence_id="EVD-001",
            file_hash="dummy_hash",
        )
        self.assertTrue(parser.can_parse(raw))
        parsed = parser.parse(raw)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed.user, "employee01")
        self.assertEqual(parsed.source_ip, "192.168.1.20")
        self.assertEqual(parsed.device, "WORKSTATION-01")
        self.assertEqual(parsed.event_type, "suspicious_login")
        self.assertEqual(parsed.evidence_id, "EVD-001")
        self.assertIsNone(parsed.destination_ip)
        self.assertIsNone(parsed.file)
        self.assertIsNone(parsed.server)

    def test_parse_auth_log_failed(self):
        parser = AuthLogParser()
        raw = RawRecord(
            source="auth.log",
            file_path="/var/log/auth.log",
            line_number=1,
            raw_text="2026-10-04 10:14:12 auth.log sshd[12401]: Failed password for invalid user admin from 192.168.1.20 port 51230 ssh2",
            evidence_id="EVD-001",
            file_hash="dummy_hash",
        )
        parsed = parser.parse(raw)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed.user, "admin")
        self.assertEqual(parsed.source_ip, "192.168.1.20")
        self.assertEqual(parsed.event_type, "failed_login")

    def test_parse_endpoint_log(self):
        parser = EndpointLogParser()
        raw = RawRecord(
            source="endpoint.log",
            file_path="/logs/endpoint.log",
            line_number=2,
            raw_text='2026-10-04 10:18:30 [ENDPOINT] Host=WORKSTATION-01 User=employee01 Process=powershell.exe CommandLine="powershell.exe -enc SQBFAFgA" Action=suspicious_process_spawn PID=4912',
            evidence_id="EVD-002",
            file_hash="dummy_hash",
        )
        self.assertTrue(parser.can_parse(raw))
        parsed = parser.parse(raw)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed.user, "employee01")
        self.assertEqual(parsed.device, "WORKSTATION-01")
        self.assertEqual(parsed.file, "powershell.exe")
        self.assertEqual(parsed.event_type, "suspicious_process_spawn")
        self.assertIsNone(parsed.source_ip)
        self.assertIsNone(parsed.destination_ip)
        self.assertIsNone(parsed.server)

    def test_parse_server_log(self):
        parser = ServerLogParser()
        raw = RawRecord(
            source="server.log",
            file_path="/logs/server.log",
            line_number=1,
            raw_text="2026-10-04 10:21:05 [SERVER] Host=SRV-CORP-FILE ClientIP=192.168.1.20 User=employee01 Service=SMB Action=session_connect Status=SUCCESS",
            evidence_id="EVD-003",
            file_hash="dummy_hash",
        )
        self.assertTrue(parser.can_parse(raw))
        parsed = parser.parse(raw)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed.user, "employee01")
        self.assertEqual(parsed.server, "SRV-CORP-FILE")
        self.assertEqual(parsed.source_ip, "192.168.1.20")
        self.assertEqual(parsed.device, "WORKSTATION-01")
        self.assertEqual(parsed.event_type, "internal_server_connection")
        self.assertIsNone(parsed.destination_ip)
        self.assertIsNone(parsed.file)

    def test_parse_file_access_log(self):
        parser = FileAccessLogParser()
        raw = RawRecord(
            source="file_access.log",
            file_path="/logs/file_access.log",
            line_number=1,
            raw_text=r'2026-10-04 10:22:45 [FILE_AUDIT] Host=SRV-CORP-FILE User=employee01 File="\\SRV-CORP-FILE\confidential\customer_data.csv" Access=READ Status=SUCCESS',
            evidence_id="EVD-004",
            file_hash="dummy_hash",
        )
        self.assertTrue(parser.can_parse(raw))
        parsed = parser.parse(raw)
        self.assertIsNotNone(parsed)
        self.assertEqual(parsed.user, "employee01")
        self.assertEqual(parsed.server, "SRV-CORP-FILE")
        self.assertEqual(parsed.device, "WORKSTATION-01")
        self.assertIn("customer_data.csv", parsed.file)
        self.assertEqual(parsed.event_type, "sensitive_file_access")
        self.assertIsNone(parsed.source_ip)
        self.assertIsNone(parsed.destination_ip)

    def test_parse_firewall_log(self):
        parser = FirewallLogParser()
        raw_conn = RawRecord(
            source="firewall.log",
            file_path="/logs/firewall.log",
            line_number=1,
            raw_text="2026-10-04 10:24:15 [FIREWALL] PROTO=TCP SRC=192.168.1.20:49150 DST=198.51.100.24:443 ACTION=ALLOW BYTES_SENT=1240 BYTES_RCVD=450",
            evidence_id="EVD-005",
            file_hash="dummy_hash",
        )
        self.assertTrue(parser.can_parse(raw_conn))
        parsed_conn = parser.parse(raw_conn)
        self.assertIsNotNone(parsed_conn)
        self.assertEqual(parsed_conn.source_ip, "192.168.1.20")
        self.assertEqual(parsed_conn.destination_ip, "198.51.100.24")
        self.assertEqual(parsed_conn.event_type, "suspicious_network_connection")
        self.assertIsNone(parsed_conn.user)
        self.assertIsNone(parsed_conn.device)

        raw_xfer = RawRecord(
            source="firewall.log",
            file_path="/logs/firewall.log",
            line_number=2,
            raw_text="2026-10-04 10:25:00 [FIREWALL] PROTO=TCP SRC=192.168.1.20:49152 DST=198.51.100.24:443 ACTION=ALLOW BYTES_SENT=8452100 BYTES_RCVD=15200",
            evidence_id="EVD-005",
            file_hash="dummy_hash",
        )
        parsed_xfer = parser.parse(raw_xfer)
        self.assertIsNotNone(parsed_xfer)
        self.assertEqual(parsed_xfer.source_ip, "192.168.1.20")
        self.assertEqual(parsed_xfer.destination_ip, "198.51.100.24")
        self.assertEqual(parsed_xfer.event_type, "outbound_data_transfer")

    def test_parser_registry_dispatch(self):
        registry = ParserRegistry()
        raw_records = [
            RawRecord("auth.log", "", 1, "2026-10-04 10:15:00 auth.log sshd[12410]: Accepted password for employee01 from 192.168.1.20 port 44321 ssh2", "EVD-001", "hash"),
            RawRecord("endpoint.log", "", 1, '2026-10-04 10:18:30 [ENDPOINT] Host=WORKSTATION-01 User=employee01 Process=powershell.exe CommandLine="powershell.exe" Action=suspicious_process_spawn PID=4912', "EVD-002", "hash"),
            RawRecord("server.log", "", 1, "2026-10-04 10:21:05 [SERVER] Host=SRV-CORP-FILE ClientIP=192.168.1.20 User=employee01 Service=SMB Action=session_connect Status=SUCCESS", "EVD-003", "hash"),
            RawRecord("file_access.log", "", 1, r'2026-10-04 10:22:45 [FILE_AUDIT] Host=SRV-CORP-FILE User=employee01 File="\\SRV-CORP-FILE\confidential\customer_data.csv" Access=READ Status=SUCCESS', "EVD-004", "hash"),
            RawRecord("firewall.log", "", 1, "2026-10-04 10:25:00 [FIREWALL] PROTO=TCP SRC=192.168.1.20:49152 DST=198.51.100.24:443 ACTION=ALLOW BYTES_SENT=8452100 BYTES_RCVD=15200", "EVD-005", "hash"),
        ]

        parsed = registry.parse_all(raw_records)
        self.assertEqual(len(parsed), 5)
        types = [p.event_type for p in parsed]
        self.assertEqual(types, [
            "suspicious_login",
            "suspicious_process_spawn",
            "internal_server_connection",
            "sensitive_file_access",
            "outbound_data_transfer",
        ])


if __name__ == "__main__":
    unittest.main()
