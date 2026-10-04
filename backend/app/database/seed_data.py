"""Simulated cyber incident seed data for Cyber Twin demonstration and testing.

DISCLAIMER: This dataset contains synthetic / simulated forensic evidence
for software prototype evaluation. It does NOT represent any real enterprise incident.
"""

from sqlalchemy.orm import Session

from app.models.case import CaseModel
from app.models.evidence import EvidenceModel
from app.models.event import EventModel
from app.models.finding import FindingModel
from app.services.hashing import calculate_sha256


def seed_demo_data(db: Session) -> None:
    """Populate database with a realistic simulated cyber incident if empty."""
    existing_case = db.query(CaseModel).filter(CaseModel.case_id == "CASE-001").first()
    if existing_case:
        return

    # 1. Simulated Case
    case = CaseModel(
        case_id="CASE-001",
        title="Suspicious Employee Account Activity (Simulated Incident)",
        description="Simulated investigation: Compromised employee credentials leading to unauthorized remote logon, obfuscated process execution, sensitive file access, and outbound data exfiltration.",
        status="open",
    )
    db.add(case)
    db.commit()

    # 2. Simulated Evidence Artifacts with actual SHA-256 hashes
    evd_1_content = "2026-10-04 10:15:00 auth.log: Accepted password for employee01 from 192.168.1.20 port 44321 ssh2"
    evd_2_content = "2026-10-04 10:18:30 endpoint.log: Process powershell.exe -enc SQBFAFgA spawned by employee01 on WORKSTATION-01 (PID: 4912)"
    evd_3_content = "2026-10-04 10:22:45 file_access.log: READ ACCESS on \\\\SRV-CORP-FILE\\confidential\\customer_data.csv by employee01"
    evd_4_content = "2026-10-04 10:25:00 firewall.log: OUTBOUND TCP 192.168.1.20:49152 -> 198.51.100.24:443 BYTES_SENT=8452100"

    evidence_items = [
        EvidenceModel(
            evidence_id="EVD-001",
            case_id="CASE-001",
            type="auth_log",
            source="auth.log",
            timestamp="2026-10-04T10:15:00",
            hash=calculate_sha256(evd_1_content),
        ),
        EvidenceModel(
            evidence_id="EVD-002",
            case_id="CASE-001",
            type="endpoint_log",
            source="endpoint.log",
            timestamp="2026-10-04T10:18:30",
            hash=calculate_sha256(evd_2_content),
        ),
        EvidenceModel(
            evidence_id="EVD-003",
            case_id="CASE-001",
            type="file_access_log",
            source="file_access.log",
            timestamp="2026-10-04T10:22:45",
            hash=calculate_sha256(evd_3_content),
        ),
        EvidenceModel(
            evidence_id="EVD-004",
            case_id="CASE-001",
            type="firewall_log",
            source="firewall.log",
            timestamp="2026-10-04T10:25:00",
            hash=calculate_sha256(evd_4_content),
        ),
    ]
    for item in evidence_items:
        db.add(item)
    db.commit()

    # 3. Simulated Correlated Events (aligned with v1 Event contract)
    events = [
        EventModel(
            event_id="EVT-001",
            case_id="CASE-001",
            timestamp="2026-10-04T10:15:00",
            event_type="suspicious_login",
            user="employee01",
            device="WORKSTATION-01",
            source_ip="192.168.1.20",
            destination_ip=None,
            file=None,
            server=None,
            evidence_id="EVD-001",
        ),
        EventModel(
            event_id="EVT-002",
            case_id="CASE-001",
            timestamp="2026-10-04T10:18:30",
            event_type="suspicious_process_spawn",
            user="employee01",
            device="WORKSTATION-01",
            source_ip=None,
            destination_ip=None,
            file="powershell.exe",
            server=None,
            evidence_id="EVD-002",
        ),
        EventModel(
            event_id="EVT-003",
            case_id="CASE-001",
            timestamp="2026-10-04T10:22:45",
            event_type="sensitive_file_access",
            user="employee01",
            device="WORKSTATION-01",
            source_ip=None,
            destination_ip=None,
            file="\\\\SRV-CORP-FILE\\confidential\\customer_data.csv",
            server="SRV-CORP-FILE",
            evidence_id="EVD-003",
        ),
        EventModel(
            event_id="EVT-004",
            case_id="CASE-001",
            timestamp="2026-10-04T10:25:00",
            event_type="outbound_data_transfer",
            user="employee01",
            device="WORKSTATION-01",
            source_ip="192.168.1.20",
            destination_ip="198.51.100.24",
            file=None,
            server=None,
            evidence_id="EVD-004",
        ),
    ]
    for evt in events:
        db.add(evt)
    db.commit()

    # 4. Simulated Findings with Evidence-Linked references
    findings = [
        FindingModel(
            finding_id="FND-001",
            case_id="CASE-001",
            title="Possible Account Compromise",
            description="Suspicious login followed by abnormal workstation activity from an internal address.",
            severity="HIGH",
            confidence=0.91,
            event_ids=["EVT-001", "EVT-002"],
            evidence_ids=["EVD-001", "EVD-002"],
        ),
        FindingModel(
            finding_id="FND-002",
            case_id="CASE-001",
            title="Unauthorized Confidential Data Access & Egress",
            description="Reading of sensitive customer files followed immediately by high-volume data transmission to external IP 198.51.100.24.",
            severity="CRITICAL",
            confidence=0.95,
            event_ids=["EVT-003", "EVT-004"],
            evidence_ids=["EVD-003", "EVD-004"],
        ),
    ]
    for fnd in findings:
        db.add(fnd)
    db.commit()
