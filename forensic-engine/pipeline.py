"""Forensic Engine Pipeline: End-to-end processing from raw logs to reconstructed incident.

Executes:
1. Ingestion of raw logs (auth.log, endpoint.log, server.log, file_access.log, firewall.log)
2. Parsing of heterogeneous security log formats
3. Normalization into canonical Event objects -> data/processed/normalized_events.json
4. Evidence Mapping: Enriches events with MITRE ATT&CK techniques, tactics, and entities
5. Correlation & Incident Reconstruction: Assembles chronological timeline, entity graph,
   kill chain attack progression, and forensic findings -> data/processed/incident_reconstruction.json
"""

import json
from pathlib import Path
import sys
from typing import Dict, List, Optional, Tuple, Union

# Ensure forensic-engine directory is on sys.path for direct script execution
CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.insert(0, str(CURRENT_DIR))

import types
if "evidence_mapping" not in sys.modules:
    _pkg = types.ModuleType("evidence_mapping")
    _pkg.__path__ = [str(CURRENT_DIR / "evidence-mapping")]
    _pkg.__file__ = str(CURRENT_DIR / "evidence-mapping" / "__init__.py")
    sys.modules["evidence_mapping"] = _pkg

from correlation.correlator import EventCorrelator
from correlation.models import ReconstructedIncident
from evidence_mapping.mapper import EvidenceMapper
from evidence_mapping.models import MappedEvent
from ingestion.reader import LogIngester
from normalization.models import NormalizedEvent
from normalization.normalizer import EventNormalizer
from parsing.registry import ParserRegistry


class ForensicPipeline:
    """Coordinates the complete digital forensic pipeline."""

    def __init__(
        self,
        case_id: str = "CASE-001",
        ingester: Optional[LogIngester] = None,
        registry: Optional[ParserRegistry] = None,
        normalizer: Optional[EventNormalizer] = None,
        mapper: Optional[EvidenceMapper] = None,
        correlator: Optional[EventCorrelator] = None,
    ):
        self.case_id = case_id
        self.ingester = ingester or LogIngester()
        self.registry = registry or ParserRegistry()
        self.normalizer = normalizer or EventNormalizer(case_id=case_id)
        self.mapper = mapper or EvidenceMapper()
        self.correlator = correlator or EventCorrelator(case_id=case_id)

    def process_directory(
        self,
        raw_dir: Union[str, Path],
        output_file: Optional[Union[str, Path]] = None,
    ) -> List[NormalizedEvent]:
        """Run Milestone 1: Ingestion -> Parsing -> Normalization."""
        raw_path = Path(raw_dir)
        if not raw_path.exists():
            raise FileNotFoundError(f"Raw logs directory does not exist: {raw_dir}")

        raw_records = self.ingester.ingest_directory(raw_path)
        parsed_records = self.registry.parse_all(raw_records)
        normalized_events = self.normalizer.normalize_all(parsed_records, case_id=self.case_id)

        if output_file:
            self.save_events(normalized_events, output_file)

        return normalized_events

    def map_evidence(self, events: List[NormalizedEvent]) -> List[MappedEvent]:
        """Run Milestone 2 Part 1: Map normalized events to MITRE ATT&CK techniques & entities."""
        return self.mapper.map_all(events)

    def reconstruct_incident(
        self,
        events: Union[List[NormalizedEvent], List[MappedEvent]],
        output_file: Optional[Union[str, Path]] = None,
    ) -> ReconstructedIncident:
        """Run Milestone 2 Part 2 & 3: Correlate mapped events and generate incident reconstruction."""
        if not events:
            raise ValueError("No events provided for reconstruction.")

        if isinstance(events[0], NormalizedEvent):
            mapped_events = self.map_evidence(events)  # type: ignore
        else:
            mapped_events = events  # type: ignore

        incident = self.correlator.correlate(mapped_events)

        if output_file:
            self.save_reconstruction(incident, output_file)

        return incident

    def run_full_pipeline(
        self,
        raw_dir: Union[str, Path],
        events_output: Optional[Union[str, Path]] = None,
        reconstruction_output: Optional[Union[str, Path]] = None,
    ) -> Tuple[List[NormalizedEvent], ReconstructedIncident]:
        """Execute full end-to-end pipeline."""
        normalized_events = self.process_directory(raw_dir, output_file=events_output)
        incident = self.reconstruct_incident(normalized_events, output_file=reconstruction_output)
        return normalized_events, incident

    @staticmethod
    def save_events(events: List[NormalizedEvent], output_file: Union[str, Path]) -> Path:
        """Serialize normalized events into formatted JSON file."""
        out_path = Path(output_file)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        payload = [e.to_dict() for e in events]
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
        return out_path

    @staticmethod
    def save_reconstruction(incident: ReconstructedIncident, output_file: Union[str, Path]) -> Path:
        """Serialize reconstructed incident model into formatted JSON file."""
        out_path = Path(output_file)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(incident.to_dict(), f, indent=2)
        return out_path


def run(
    raw_dir: Optional[Union[str, Path]] = None,
    events_output: Optional[Union[str, Path]] = None,
    reconstruction_output: Optional[Union[str, Path]] = None,
    case_id: str = "CASE-001",
) -> Tuple[List[NormalizedEvent], ReconstructedIncident]:
    """Helper entry point for the complete forensic engine pipeline."""
    repo_root = CURRENT_DIR.parent
    source_dir = Path(raw_dir) if raw_dir else repo_root / "data" / "raw"
    target_events = (
        Path(events_output)
        if events_output
        else repo_root / "data" / "processed" / "normalized_events.json"
    )
    target_reconstruction = (
        Path(reconstruction_output)
        if reconstruction_output
        else repo_root / "data" / "processed" / "incident_reconstruction.json"
    )

    pipeline = ForensicPipeline(case_id=case_id)
    events, incident = pipeline.run_full_pipeline(source_dir, target_events, target_reconstruction)
    print(f"[+] Successfully processed {len(events)} normalized events for case {case_id}")
    print(f"[+] Normalized events saved to: {target_events}")
    print(f"[+] Reconstructed incident saved to: {target_reconstruction}")
    print(f"[+] Timeline entries: {len(incident.timeline)} | Graph Nodes: {len(incident.graph_nodes)} | Edges: {len(incident.graph_edges)}")
    print(f"[+] Attack Progression Stages: {len(incident.attack_progression)} | Findings: {len(incident.findings)}")
    return events, incident


if __name__ == "__main__":
    run()
