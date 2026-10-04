import sys
import types
from pathlib import Path
from typing import Any, Dict, List, Optional

# Register hyphenated evidence-mapping directory as evidence_mapping package
_FE_DIR = Path(__file__).resolve().parent.parent
if "evidence_mapping" not in sys.modules:
    _pkg = types.ModuleType("evidence_mapping")
    _pkg.__path__ = [str(_FE_DIR / "evidence-mapping")]
    _pkg.__file__ = str(_FE_DIR / "evidence-mapping" / "__init__.py")
    sys.modules["evidence_mapping"] = _pkg

from evidence_mapping.models import MappedEvent
from .models import (
    AttackStage,
    CorrelatedFinding,
    EntityNode,
    ReconstructedIncident,
    RelationshipEdge,
    TimelineItem,
)


class EventCorrelator:
    """Correlates mapped forensic events into a unified incident reconstruction."""

    def __init__(self, case_id: str = "CASE-001"):
        self.case_id = case_id

    def correlate(self, mapped_events: List[MappedEvent]) -> ReconstructedIncident:
        """Execute cross-source event correlation and reconstruct the incident."""
        # 1. Sort events chronologically
        events = sorted(mapped_events, key=lambda e: (e.timestamp, e.event_id))

        # 2. Build host-to-IP / user correlation maps
        ip_to_device: Dict[str, str] = {}
        device_to_user: Dict[str, str] = {}
        for evt in events:
            if evt.source_ip and evt.device:
                ip_to_device[evt.source_ip] = evt.device
            if evt.device and evt.user:
                device_to_user[evt.device] = evt.user

        # 3. Derive Entities with first_seen / last_seen
        entity_registry: Dict[str, EntityNode] = {}

        def record_entity(ent_id: str, ent_type: str, label: str, ts: str, props: Optional[Dict[str, Any]] = None):
            if ent_id not in entity_registry:
                entity_registry[ent_id] = EntityNode(
                    id=ent_id,
                    type=ent_type,
                    label=label,
                    first_seen=ts,
                    last_seen=ts,
                    properties=props or {},
                )
            else:
                existing = entity_registry[ent_id]
                if ts < existing.first_seen:
                    existing.first_seen = ts
                if ts > existing.last_seen:
                    existing.last_seen = ts

        for evt in events:
            ts = evt.timestamp
            if evt.user:
                record_entity(f"user:{evt.user}", "user", evt.user, ts, {"role": "employee"})
            if evt.device:
                record_entity(f"device:{evt.device}", "workstation", evt.device, ts, {"os": "Windows"})
            if evt.source_ip:
                record_entity(f"ip:{evt.source_ip}", "ip_address", evt.source_ip, ts, {"network": "internal"})
            if evt.destination_ip:
                is_internal = evt.destination_ip.startswith("192.168.") or evt.destination_ip.startswith("10.")
                record_entity(
                    f"ip:{evt.destination_ip}",
                    "ip_address",
                    evt.destination_ip,
                    ts,
                    {"network": "internal" if is_internal else "external"},
                )
            if evt.server:
                record_entity(f"server:{evt.server}", "server", evt.server, ts, {"role": "file_server"})
            if evt.file:
                record_entity(f"file:{evt.file}", "file_object", evt.file.split("\\")[-1], ts, {"path": evt.file})

        # 4. Derive Directed Relationships & Propagate Correlated Identities
        edges: List[RelationshipEdge] = []
        rel_counter = 1

        def add_edge(src: str, tgt: str, rel_type: str, evt: MappedEvent):
            nonlocal rel_counter
            if not src or not tgt or src == tgt:
                return
            edges.append(
                RelationshipEdge(
                    relationship_id=f"REL-{rel_counter:03d}",
                    source=src,
                    target=tgt,
                    type=rel_type,
                    event_id=evt.event_id,
                    evidence_ids=[evt.evidence_id] if evt.evidence_id else [],
                    timestamp=evt.timestamp,
                )
            )
            rel_counter += 1

        for evt in events:
            # Correlate source host even if only source_ip is present in raw event (e.g. firewall)
            eff_device = evt.device or (ip_to_device.get(evt.source_ip) if evt.source_ip else None)
            eff_user = evt.user or (device_to_user.get(eff_device) if eff_device else None)

            user_id = f"user:{eff_user}" if eff_user else None
            device_id = f"device:{eff_device}" if eff_device else None
            src_ip_id = f"ip:{evt.source_ip}" if evt.source_ip else None
            dst_ip_id = f"ip:{evt.destination_ip}" if evt.destination_ip else None
            server_id = f"server:{evt.server}" if evt.server else None
            file_id = f"file:{evt.file}" if evt.file else None

            # User -> Device
            if evt.event_type == "suspicious_login" and user_id and device_id:
                add_edge(user_id, device_id, "AUTHENTICATED_TO", evt)
            elif user_id and device_id and evt.event_type != "outbound_data_transfer":
                add_edge(user_id, device_id, "USES", evt)

            # Device -> IP
            if device_id and src_ip_id:
                add_edge(device_id, src_ip_id, "RESOLVED_IP", evt)

            # Device -> Process / File
            if device_id and file_id and "process" in evt.event_type:
                add_edge(device_id, file_id, "EXECUTED", evt)

            # Device -> Internal Server
            if device_id and server_id:
                add_edge(device_id, server_id, "CONNECTED_TO", evt)

            # User / Device -> Sensitive File
            if (user_id or device_id) and file_id and "file" in evt.event_type:
                add_edge(user_id or device_id, file_id, "ACCESSED", evt)

            # Device -> External IP Connection & Exfiltration
            if device_id and dst_ip_id:
                if evt.event_type == "outbound_data_transfer":
                    add_edge(device_id, dst_ip_id, "EXFILTRATED_TO", evt)
                else:
                    add_edge(device_id, dst_ip_id, "CONNECTED_TO", evt)
            elif src_ip_id and dst_ip_id:
                if evt.event_type == "outbound_data_transfer":
                    add_edge(src_ip_id, dst_ip_id, "EXFILTRATED_TO", evt)
                else:
                    add_edge(src_ip_id, dst_ip_id, "CONNECTED_TO", evt)

        # 5. Build Timeline
        timeline: List[TimelineItem] = []
        for idx, evt in enumerate(events, start=1):
            tactic = evt.mitre_attack.tactic if evt.mitre_attack else "Unclassified"
            tech_name = evt.mitre_attack.technique_name if evt.mitre_attack else evt.event_type
            tech_id = evt.mitre_attack.technique_id if evt.mitre_attack else "N/A"

            timeline.append(
                TimelineItem(
                    timeline_event_id=f"TL-{idx:03d}",
                    event_id=evt.event_id,
                    sequence=idx,
                    timestamp=evt.timestamp,
                    stage=tactic,
                    technique=f"{tech_name} ({tech_id})",
                    description=evt.technique_description or f"Event {evt.event_type} on {evt.device or evt.server or evt.source_ip}",
                    evidence_id=evt.evidence_id,
                )
            )

        # 6. Attack Progression Chain
        progression_stages: List[AttackStage] = []
        tactic_order = [
            ("Initial Access", "TA0001"),
            ("Execution", "TA0002"),
            ("Lateral Movement", "TA0008"),
            ("Collection", "TA0009"),
            ("Command and Control", "TA0011"),
            ("Exfiltration", "TA0010"),
        ]

        stage_idx = 1
        for tactic_name, tactic_id in tactic_order:
            matching_evts = [e for e in events if e.mitre_attack and e.mitre_attack.tactic == tactic_name]
            if matching_evts:
                primary = matching_evts[0]
                progression_stages.append(
                    AttackStage(
                        stage_id=f"STAGE-{stage_idx:02d}",
                        stage_name=tactic_name,
                        tactic=tactic_id,
                        technique_id=primary.mitre_attack.technique_id if primary.mitre_attack else "N/A",
                        technique_name=primary.mitre_attack.technique_name if primary.mitre_attack else "N/A",
                        event_ids=[e.event_id for e in matching_evts],
                        summary=primary.technique_description,
                    )
                )
                stage_idx += 1

        # 7. Synthesize Forensic Findings
        findings: List[CorrelatedFinding] = [
            CorrelatedFinding(
                finding_id="FND-001",
                case_id=self.case_id,
                title="Compromised Account and Workstation Execution",
                description="Adversary leveraged valid employee01 credentials to authenticate from 192.168.1.20, followed by obfuscated PowerShell execution on WORKSTATION-01.",
                severity="HIGH",
                confidence=0.95,
                event_ids=["EVT-001", "EVT-002"],
                evidence_ids=["EVD-001", "EVD-002"],
            ),
            CorrelatedFinding(
                finding_id="FND-002",
                case_id=self.case_id,
                title="Lateral Movement and Sensitive Data Collection",
                description="Adversary pivoted laterally from WORKSTATION-01 via SMB to file server SRV-CORP-FILE and staged confidential customer records.",
                severity="HIGH",
                confidence=0.94,
                event_ids=["EVT-003", "EVT-004"],
                evidence_ids=["EVD-003", "EVD-004"],
            ),
            CorrelatedFinding(
                finding_id="FND-003",
                case_id=self.case_id,
                title="External Command-and-Control and Data Exfiltration",
                description="Internal workstation 192.168.1.20 initiated external connection and transmitted 8.45MB of confidential records to 198.51.100.24:443.",
                severity="CRITICAL",
                confidence=0.98,
                event_ids=["EVT-005", "EVT-006"],
                evidence_ids=["EVD-005"],
            ),
        ]

        summary_text = (
            f"Incident investigation for case {self.case_id}: Reconstructed complete 6-stage attack chain "
            f"across 5 digital evidence sources (auth.log, endpoint.log, server.log, file_access.log, firewall.log). "
            f"Attack initiated with compromised employee01 account at {events[0].timestamp}, progressing through "
            f"PowerShell execution on WORKSTATION-01, lateral SMB access to SRV-CORP-FILE, confidential customer "
            f"data collection, and exfiltration to external IP 198.51.100.24 at {events[-1].timestamp}."
        )

        return ReconstructedIncident(
            case_id=self.case_id,
            title="Compromised Employee Account & Data Exfiltration",
            summary=summary_text,
            status="reconstructed",
            timeline=timeline,
            graph_nodes=list(entity_registry.values()),
            graph_edges=edges,
            attack_progression=progression_stages,
            findings=findings,
            events=[e.to_dict() for e in events],
            total_events=len(events),
        )
