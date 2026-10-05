"""Data models for Evidence Mapping and threat framework alignment."""

from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional

from normalization.models import NormalizedEvent


@dataclass
class MitreTechnique:
    """MITRE ATT&CK technique mapping."""

    technique_id: str
    technique_name: str
    tactic: str
    subtechnique_id: Optional[str] = None
    url: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class MappedEvent:
    """A normalized event enriched with MITRE ATT&CK tactics, entities, and evidence linkage."""

    event_id: str
    case_id: str
    timestamp: str
    event_type: str
    user: Optional[str] = None
    device: Optional[str] = None
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    file: Optional[str] = None
    server: Optional[str] = None
    evidence_id: Optional[str] = None
    mitre_attack: Optional[MitreTechnique] = None
    entities: List[str] = field(default_factory=list)
    confidence: float = 0.90
    rule_id: str = "RULE-GENERIC"
    technique_description: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "event_id": self.event_id,
            "case_id": self.case_id,
            "timestamp": self.timestamp,
            "event_type": self.event_type,
            "user": self.user,
            "device": self.device,
            "source_ip": self.source_ip,
            "destination_ip": self.destination_ip,
            "file": self.file,
            "server": self.server,
            "evidence_id": self.evidence_id,
            "mitre_attack": self.mitre_attack.to_dict() if self.mitre_attack else None,
            "entities": self.entities,
            "confidence": self.confidence,
            "rule_id": self.rule_id,
            "technique_description": self.technique_description,
        }
