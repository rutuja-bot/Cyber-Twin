"""Schemas for Incident Reconstruction, Graph visualization, and Timeline endpoints."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    id: str
    type: str
    label: str
    first_seen: str
    last_seen: str
    properties: Dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    relationship_id: str
    source: str
    target: str
    type: str
    event_id: str
    evidence_ids: List[str] = Field(default_factory=list)
    timestamp: str


class GraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


class TimelineItemResponse(BaseModel):
    timeline_event_id: str
    event_id: str
    sequence: int
    timestamp: str
    stage: str
    technique: str
    description: str
    evidence_id: Optional[str] = None


class AttackStageResponse(BaseModel):
    stage_id: str
    stage_name: str
    tactic: str
    technique_id: str
    technique_name: str
    event_ids: List[str] = Field(default_factory=list)
    summary: str


class IncidentReconstructionResponse(BaseModel):
    case_id: str
    title: str
    status: str
    summary: str
    total_events: int
    timeline: List[TimelineItemResponse]
    graph: GraphData
    attack_progression: List[AttackStageResponse]
    findings: List[Dict[str, Any]] = Field(default_factory=list)
    events: List[Dict[str, Any]] = Field(default_factory=list)
