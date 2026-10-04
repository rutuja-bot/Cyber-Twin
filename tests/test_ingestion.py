"""Tests for raw log ingestion."""

import os
from pathlib import Path
import sys
import tempfile
import unittest

# Ensure forensic-engine is in sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent
FORENSIC_DIR = REPO_ROOT / "forensic-engine"
if str(FORENSIC_DIR) not in sys.path:
    sys.path.insert(0, str(FORENSIC_DIR))

from ingestion.models import RawRecord
from ingestion.reader import LogIngester, DEFAULT_EVIDENCE_MAP


class TestRawLogIngestion(unittest.TestCase):
    """Verifies that raw log files can be ingested without performing parsing."""

    def setUp(self):
        self.ingester = LogIngester()
        self.raw_data_dir = REPO_ROOT / "data" / "raw"

    def test_ingest_auth_log(self):
        auth_path = self.raw_data_dir / "auth.log"
        records = self.ingester.ingest_file(auth_path)
        self.assertGreaterEqual(len(records), 1)
        rec = records[0]
        self.assertIsInstance(rec, RawRecord)
        self.assertEqual(rec.source, "auth.log")
        self.assertEqual(rec.evidence_id, "EVD-001")
        self.assertEqual(len(rec.file_hash), 64)  # SHA-256
        self.assertIn("employee01", rec.raw_text)

    def test_ingest_all_five_simulated_logs(self):
        expected_files = ["auth.log", "endpoint.log", "server.log", "file_access.log", "firewall.log"]
        for filename in expected_files:
            file_path = self.raw_data_dir / filename
            self.assertTrue(file_path.exists(), f"Missing raw log file: {filename}")
            records = self.ingester.ingest_file(file_path)
            self.assertGreater(len(records), 0, f"No records read from {filename}")
            for r in records:
                self.assertEqual(r.source, filename)
                self.assertTrue(r.evidence_id.startswith("EVD-"))
                self.assertEqual(len(r.file_hash), 64)

    def test_ingest_directory(self):
        records = self.ingester.ingest_directory(self.raw_data_dir)
        self.assertGreaterEqual(len(records), 5)
        sources = {r.source for r in records}
        self.assertIn("auth.log", sources)
        self.assertIn("firewall.log", sources)
        self.assertIn("endpoint.log", sources)
        self.assertIn("file_access.log", sources)
        self.assertIn("server.log", sources)

    def test_ingestion_separates_from_parsing(self):
        """Ingestion must return raw records preserving exact lines and not parse them."""
        auth_path = self.raw_data_dir / "auth.log"
        records = self.ingester.ingest_file(auth_path)
        for r in records:
            # Must remain pure RawRecord without normalized fields
            self.assertTrue(hasattr(r, "raw_text"))
            self.assertTrue(hasattr(r, "line_number"))
            self.assertFalse(hasattr(r, "event_type"))
            self.assertFalse(hasattr(r, "timestamp"))

    def test_file_not_found(self):
        with self.assertRaises(FileNotFoundError):
            self.ingester.ingest_file(self.raw_data_dir / "non_existent.log")

    def test_empty_and_commented_lines_ignored(self):
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".log") as tmp:
            tmp.write("\n\n# Comment line\nValid log entry line\n   \n")
            tmp_path = tmp.name

        try:
            records = self.ingester.ingest_file(tmp_path)
            self.assertEqual(len(records), 1)
            self.assertEqual(records[0].raw_text, "Valid log entry line")
            self.assertEqual(records[0].line_number, 4)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)


if __name__ == "__main__":
    unittest.main()
