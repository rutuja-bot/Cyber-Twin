"""Forensic Engine — Evidence Linking Module.

Maintains bidirectional provenance and backward traceability from investigator-facing outputs
(Findings, Graph Nodes, Timeline Events, Replay Events, 3D Markers) back to their supporting digital evidence.
"""

from typing import Any, Dict, List, Optional


class EvidenceLinker:
    """Computes backward traceability chains across reconstructed incident artifacts."""

    def __init__(self, reconstruction_data: Dict[str, Any]):
        self.data = reconstruction_data
        self.case_id = reconstruction_data.get("case_id", "CASE-001")
        self._index = self._build_index()

    def _build_index(self) -> Dict[str, Any]:
        """Index events, evidence, entities, findings, and graph edges."""
        events = self.data.get("events", [])
        findings = self.data.get("findings", [])
        graph = self.data.get("graph", {})
        nodes = graph.get("nodes", [])
        edges = graph.get("edges", [])

        evt_by_id = {e.get("event_id"): e for e in events if e.get("event_id")}
        fnd_by_id = {f.get("finding_id"): f for f in findings if f.get("finding_id")}
        node_by_id = {n.get("id"): n for n in nodes if n.get("id")}

        # Map Evidence -> Events
        evd_to_events: Dict[str, List[str]] = {}
        for evt in events:
            evd_id = evt.get("evidence_id")
            if evd_id:
                evd_to_events.setdefault(evd_id, []).append(evt.get("event_id"))

        # Map Evidence -> Findings
        evd_to_findings: Dict[str, List[str]] = {}
        for fnd in findings:
            for evd_id in fnd.get("evidence_ids", []):
                evd_to_findings.setdefault(evd_id, []).append(fnd.get("finding_id"))

        # Map Evidence -> Entities
        evd_to_entities: Dict[str, List[str]] = {}
        for evt in events:
            evd_id = evt.get("evidence_id")
            if evd_id:
                for ent in evt.get("entities", []):
                    if ent not in evd_to_entities.setdefault(evd_id, []):
                        evd_to_entities[evd_id].append(ent)

        return {
            "events_by_id": evt_by_id,
            "findings_by_id": fnd_by_id,
            "nodes_by_id": node_by_id,
            "edges": edges,
            "evd_to_events": evd_to_events,
            "evd_to_findings": evd_to_findings,
            "evd_to_entities": evd_to_entities,
        }

    def trace_finding(self, finding_id: str) -> Optional[Dict[str, Any]]:
        """Trace a Finding back to its supporting Events, Evidence, and raw provenance."""
        finding = self._index["findings_by_id"].get(finding_id)
        if not finding:
            return None

        linked_events = [
            self._index["events_by_id"].get(evt_id)
            for evt_id in finding.get("event_ids", [])
            if self._index["events_by_id"].get(evt_id)
        ]

        evidence_ids = finding.get("evidence_ids", [])

        return {
            "chain_type": "finding_to_evidence",
            "finding_id": finding_id,
            "title": finding.get("title"),
            "severity": finding.get("severity"),
            "confidence": finding.get("confidence"),
            "supporting_events": linked_events,
            "supporting_evidence_ids": evidence_ids,
            "mitre_tactics": finding.get("mitre_tactics", []),
            "mitre_techniques": finding.get("mitre_techniques", []),
        }

    def trace_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        """Trace an Event back to its source Evidence, and forward to Findings."""
        event = self._index["events_by_id"].get(event_id)
        if not event:
            return None

        evd_id = event.get("evidence_id")
        findings = [
            fnd
            for fnd_id, fnd in self._index["findings_by_id"].items()
            if event_id in fnd.get("event_ids", [])
        ]

        return {
            "chain_type": "event_to_evidence",
            "event_id": event_id,
            "event_type": event.get("event_type"),
            "timestamp": event.get("timestamp"),
            "supporting_evidence_id": evd_id,
            "associated_entities": event.get("entities", []),
            "mitre_technique": event.get("mitre_attack", {}),
            "corroborating_findings": [f.get("finding_id") for f in findings],
        }

    def trace_evidence(self, evidence_id: str) -> Dict[str, Any]:
        """Trace an Evidence item to all Events, Entities, and Findings it supports."""
        linked_event_ids = self._index["evd_to_events"].get(evidence_id, [])
        linked_finding_ids = self._index["evd_to_findings"].get(evidence_id, [])
        linked_entity_ids = self._index["evd_to_entities"].get(evidence_id, [])

        return {
            "chain_type": "evidence_to_investigation",
            "evidence_id": evidence_id,
            "supported_events": linked_event_ids,
            "supported_findings": linked_finding_ids,
            "involved_entities": linked_entity_ids,
        }

    def trace_3d_marker(self, marker_id: str, evidence_id: str, location_label: str) -> Dict[str, Any]:
        """Trace a 3D scene marker to its Evidence, Events, Entities, and Findings."""
        evidence_chain = self.trace_evidence(evidence_id)
        return {
            "chain_type": "3d_marker_to_investigation",
            "marker_id": marker_id,
            "location": location_label,
            "evidence_id": evidence_id,
            "events": evidence_chain["supported_events"],
            "entities": evidence_chain["involved_entities"],
            "findings": evidence_chain["supported_findings"],
        }
