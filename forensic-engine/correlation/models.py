"""Data models for correlated incident reconstruction, entities, and relationships."""

from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


@dataclass
class EntityNode:
    """Graph node representing an asset, actor, or artifact involved in the incident."""

    id: str
    type: str  # user, workstation, server, ip_address, file_object
    label: str
    first_seen: str
    last_seen: str
    properties: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class RelationshipEdge:
    """Directed relationship edge connecting entities or events."""

    relationship_id: str
    source: str
    target: str
    type: str  # AUTHENTICATED_TO, EXECUTED, CONNECTED_TO, ACCESSED, EXFILTRATED_TO
    event_id: str
    evidence_ids: List[str]
    timestamp: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class TimelineItem:
    """Chronologically ordered timeline item for incident reconstruction."""

    timeline_event_id: str
    event_id: str
    sequence: int
    timestamp: str
    stage: str
    technique: str
    description: str
    evidence_id: Optional[str]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AttackStage:
    """Step in the attack progression chain."""

    stage_id: str
    stage_name: str
    tactic: str
    technique_id: str
    technique_name: str
    event_ids: List[str]
    summary: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class CorrelatedFinding:
    """Forensic finding synthesized from correlated events."""

    finding_id: str
    case_id: str
    title: str
    description: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    confidence: float
    event_ids: List[str]
    evidence_ids: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class ReconstructedIncident:
    """Unified incident reconstruction model containing timeline, graph, and attack chain."""

    case_id: str
    title: str
    summary: str
    status: str
    timeline: List[TimelineItem]
    graph_nodes: List[EntityNode]
    graph_edges: List[RelationshipEdge]
    attack_progression: List[AttackStage]
    findings: List[CorrelatedFinding]
    events: List[Dict[str, Any]]
    total_events: int

    def to_dict(self) -> Dict[str, Any]:
        return {
            "case_id": self.case_id,
            "title": self.title,
            "status": self.status,
            "summary": self.summary,
            "total_events": self.total_events,
            "timeline": [item.to_dict() for item in self.timeline],
            "graph": {
                "nodes": [node.to_dict() for node in self.graph_nodes],
                "edges": [edge.to_dict() for edge in self.graph_edges],
            },
            "attack_progression": [stage.to_dict() for stage in self.attack_progression],
            "findings": [finding.to_dict() for finding in self.findings],
            "events": self.events,
        }
