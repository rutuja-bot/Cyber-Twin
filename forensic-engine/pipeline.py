"""Forensic Engine Pipeline: Ingestion -> Parsing -> Normalization -> Processed Output.

This pipeline executes Milestone 1 of the forensic engine:
1. Ingests fragmented raw logs (auth.log, endpoint.log, server.log, file_access.log, firewall.log)
2. Parses each heterogeneous log into structured representations
3. Normalizes timestamps and attributes into canonical Event objects
4. Exports the resulting events to data/processed/normalized_events.json
"""

import json
from pathlib import Path
import sys
from typing import List, Optional, Union

# Ensure forensic-engine directory is on sys.path for direct script execution
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

from ingestion.reader import LogIngester
from parsing.registry import ParserRegistry
from normalization.normalizer import EventNormalizer
from normalization.models import NormalizedEvent


class ForensicPipeline:
    """Coordinates Milestone 1 log ingestion, parsing, and normalization."""

    def __init__(
        self,
        case_id: str = "CASE-001",
        ingester: Optional[LogIngester] = None,
        registry: Optional[ParserRegistry] = None,
        normalizer: Optional[EventNormalizer] = None,
    ):
        self.case_id = case_id
        self.ingester = ingester or LogIngester()
        self.registry = registry or ParserRegistry()
        self.normalizer = normalizer or EventNormalizer(case_id=case_id)

    def process_directory(
        self,
        raw_dir: Union[str, Path],
        output_file: Optional[Union[str, Path]] = None,
    ) -> List[NormalizedEvent]:
        """Run the full ingestion -> parsing -> normalization pipeline on a directory of raw logs."""
        raw_path = Path(raw_dir)
        if not raw_path.exists():
            raise FileNotFoundError(f"Raw logs directory does not exist: {raw_dir}")

        # Step 1: Ingestion
        raw_records = self.ingester.ingest_directory(raw_path)

        # Step 2: Parsing
        parsed_records = self.registry.parse_all(raw_records)

        # Step 3: Normalization
        normalized_events = self.normalizer.normalize_all(parsed_records, case_id=self.case_id)

        # Step 4: Export to Processed JSON
        if output_file:
            self.save_events(normalized_events, output_file)

        return normalized_events

    @staticmethod
    def save_events(events: List[NormalizedEvent], output_file: Union[str, Path]) -> Path:
        """Serialize normalized events into formatted JSON file."""
        out_path = Path(output_file)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        payload = [e.to_dict() for e in events]
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)

        return out_path


def run(
    raw_dir: Optional[Union[str, Path]] = None,
    output_file: Optional[Union[str, Path]] = None,
    case_id: str = "CASE-001",
) -> List[NormalizedEvent]:
    """Helper entry point for the forensic engine pipeline."""
    repo_root = CURRENT_DIR.parent
    source_dir = Path(raw_dir) if raw_dir else repo_root / "data" / "raw"
    target_file = Path(output_file) if output_file else repo_root / "data" / "processed" / "normalized_events.json"

    pipeline = ForensicPipeline(case_id=case_id)
    events = pipeline.process_directory(source_dir, target_file)
    print(f"[+] Successfully processed {len(events)} events for case {case_id}")
    print(f"[+] Output written to: {target_file}")
    return events


if __name__ == "__main__":
    run()
