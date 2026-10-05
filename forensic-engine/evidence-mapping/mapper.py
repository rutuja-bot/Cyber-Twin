"""Evidence Mapper module evaluating threat rules and extracting entity associations."""

from typing import List, Optional

from normalization.models import NormalizedEvent
from .models import MappedEvent, MitreTechnique
from .rules import STANDARD_MITRE_RULES, MappingRule


class EvidenceMapper:
    """Maps normalized forensic events to MITRE ATT&CK techniques and incident entities."""

    def __init__(self, rules: Optional[List[MappingRule]] = None):
        self.rules = rules or STANDARD_MITRE_RULES

    @staticmethod
    def extract_entities(event: NormalizedEvent) -> List[str]:
        """Extract canonical entity references from a normalized event."""
        entities = []
        if event.user:
            entities.append(f"user:{event.user}")
        if event.device:
            entities.append(f"device:{event.device}")
        if event.source_ip:
            entities.append(f"ip:{event.source_ip}")
        if event.destination_ip:
            entities.append(f"ip:{event.destination_ip}")
        if event.server:
            entities.append(f"server:{event.server}")
        if event.file:
            entities.append(f"file:{event.file}")
        return entities

    def map_event(self, event: NormalizedEvent) -> MappedEvent:
        """Map a single normalized event against rule set."""
        entities = self.extract_entities(event)

        matched_rule: Optional[MappingRule] = None
        for rule in self.rules:
            try:
                if rule.condition(event):
                    matched_rule = rule
                    break
            except Exception:
                continue

        if matched_rule:
            return MappedEvent(
                event_id=event.event_id,
                case_id=event.case_id,
                timestamp=event.timestamp,
                event_type=event.event_type,
                user=event.user,
                device=event.device,
                source_ip=event.source_ip,
                destination_ip=event.destination_ip,
                file=event.file,
                server=event.server,
                evidence_id=event.evidence_id,
                mitre_attack=matched_rule.mitre_technique,
                entities=entities,
                confidence=matched_rule.confidence,
                rule_id=matched_rule.rule_id,
                technique_description=matched_rule.description,
            )

        # Fallback if no specific rule matches
        return MappedEvent(
            event_id=event.event_id,
            case_id=event.case_id,
            timestamp=event.timestamp,
            event_type=event.event_type,
            user=event.user,
            device=event.device,
            source_ip=event.source_ip,
            destination_ip=event.destination_ip,
            file=event.file,
            server=event.server,
            evidence_id=event.evidence_id,
            mitre_attack=MitreTechnique(
                technique_id="T0000",
                technique_name="Unclassified Activity",
                tactic="Unknown",
                url="",
            ),
            entities=entities,
            confidence=0.50,
            rule_id="RULE-DEFAULT",
            technique_description="General normalized activity without explicit threat pattern match.",
        )

    def map_all(self, events: List[NormalizedEvent]) -> List[MappedEvent]:
        """Map a collection of normalized events."""
        return [self.map_event(e) for e in events]
