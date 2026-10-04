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
    evd_1_content = "2026-10-04 10:01:12 auth.log: Accepted password for employee01 from 185.220.101.5 port 44321 ssh2"
    evd_2_content = "2026-10-04 10:04:30 endpoint.log: Process powershell.exe -enc SQBFAFgA spawned by employee01 on WS-101 (PID: 4912)"
    evd_3_content = "2026-10-04 10:07:45 file_access.log: READ ACCESS on \\\\SRV-CORP-FILE\\confidential\\customer_data.csv by employee01"
    evd_4_content = "2026-10-04 10:11:00 firewall.log: OUTBOUND TCP 192.168.10.45:49152 -> 198.51.100.24:443 BYTES_SENT=8452100"

    evidence_items = [
        EvidenceModel(
            evidence_id="EVD-001",
            case_id="CASE-001",
            type="auth_log",
            source="auth.log",
            timestamp="2026-10-04T10:01:12",
            hash=calculate_sha256(evd_1_content),
        ),
        EvidenceModel(
            evidence_id="EVD-002",
            case_id="CASE-001",
            type="endpoint_log",
            source="endpoint.log",
            timestamp="2026-10-04T10:04:30",
            hash=calculate_sha256(evd_2_content),
        ),
        EvidenceModel(
            evidence_id="EVD-003",
            case_id="CASE-001",
            type="file_access_log",
            source="file_access.log",
            timestamp="2026-10-04T10:07:45",
            hash=calculate_sha256(evd_3_content),
        ),
        EvidenceModel(
            evidence_id="EVD-004",
            case_id="CASE-001",
            type="firewall_log",
            source="firewall.log",
            timestamp="2026-10-04T10:11:00",
            hash=calculate_sha256(evd_4_content),
        ),
    ]
    for item in evidence_items:
        db.add(item)
    db.commit()

    # 3. Simulated Correlated Events
    events = [
        EventModel(
            event_id="EVT-001",
            case_id="CASE-001",
            timestamp="2026-10-04T10:01:12",
            event_type="LOGIN_SUCCESS",
            user="employee01",
            device="WS-101",
            source_ip="185.220.101.5",
            evidence_id="EVD-001",
        ),
        EventModel(
            event_id="EVT-002",
            case_id="CASE-001",
            timestamp="2026-10-04T10:04:30",
            event_type="SUSPICIOUS_PROCESS_SPAWN",
            user="employee01",
            device="WS-101",
            source_ip="185.220.101.5",
            evidence_id="EVD-002",
        ),
        EventModel(
            event_id="EVT-003",
            case_id="CASE-001",
            timestamp="2026-10-04T10:07:45",
            event_type="SENSITIVE_FILE_ACCESS",
            user="employee01",
            device="WS-101",
            source_ip=None,
            evidence_id="EVD-003",
        ),
        EventModel(
            event_id="EVT-004",
            case_id="CASE-001",
            timestamp="2026-10-04T10:11:00",
            event_type="OUTBOUND_DATA_TRANSFER",
            user="employee01",
            device="WS-101",
            source_ip="192.168.10.45",
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
            description="Suspicious login followed by abnormal workstation activity from an untrusted IP address.",
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
