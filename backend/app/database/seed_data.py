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
        fnd3 = db.query(FindingModel).filter(FindingModel.finding_id == "FND-003").first()
        if not fnd3:
            db.add(
                FindingModel(
                    finding_id="FND-003",
                    case_id="CASE-001",
                    title="External Command-and-Control and Data Exfiltration",
                    description="Internal workstation 192.168.1.20 initiated external connection and transmitted 8.45MB of confidential records to 198.51.100.24:443.",
                    severity="CRITICAL",
                    confidence=0.98,
                    event_ids=["EVT-005", "EVT-006"],
                    evidence_ids=["EVD-005"],
                )
            )
            db.commit()
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

    # 2. Simulated Evidence Artifacts (matching PPT: cyber logs, photos, CCTV, physical, reports)
    from pathlib import Path
    evidence_items = [
        EvidenceModel(
            evidence_id="EVD-001",
            case_id="CASE-001",
            type="auth_log",
            source="auth.log",
            timestamp="2026-10-04T10:15:00",
            hash=calculate_sha256("2026-10-04 10:15:00 auth.log sshd[12410]: Accepted password for employee01 from 192.168.1.20 port 44321 ssh2"),
            filename="auth.log",
            file_size_bytes=24576,
            mime_type="text/plain",
            location="Workstation Cubicle 14 (Login Terminal)",
            description="Linux/SSH authentication log capturing credential acceptance for employee01.",
            collector="Identity & Access Management Logger",
            processing_status="verified",
            media_path="/evidence/auth.log",
        ),
        EvidenceModel(
            evidence_id="EVD-002",
            case_id="CASE-001",
            type="endpoint_log",
            source="endpoint.log",
            timestamp="2026-10-04T10:18:30",
            hash=calculate_sha256('2026-10-04 10:18:30 [ENDPOINT] Host=WORKSTATION-01 User=employee01 Process=powershell.exe CommandLine="powershell.exe -enc SQBFAFgA" Action=suspicious_process_spawn PID=4912'),
            filename="endpoint.log",
            file_size_bytes=38912,
            mime_type="text/plain",
            location="Workstation Cubicle 14 (WORKSTATION-01)",
            description="EDR process telemetry logging obfuscated Base64 PowerShell spawn PID 4912.",
            collector="CrowdStrike / Sysmon Agent",
            processing_status="verified",
            media_path="/evidence/endpoint.log",
        ),
        EvidenceModel(
            evidence_id="EVD-003",
            case_id="CASE-001",
            type="server_log",
            source="server.log",
            timestamp="2026-10-04T10:21:05",
            hash=calculate_sha256("2026-10-04 10:21:05 [SERVER] Host=SRV-CORP-FILE ClientIP=192.168.1.20 User=employee01 Service=SMB Action=session_connect Status=SUCCESS"),
            filename="server.log",
            file_size_bytes=19456,
            mime_type="text/plain",
            location="Server Room Entrance (Hallway)",
            description="Windows Server audit event 4624 establishing lateral SMB session from 192.168.1.20.",
            collector="Windows Event Forwarding (WEF)",
            processing_status="verified",
            media_path="/evidence/server.log",
        ),
        EvidenceModel(
            evidence_id="EVD-004",
            case_id="CASE-001",
            type="file_access_log",
            source="file_access.log",
            timestamp="2026-10-04T10:22:45",
            hash=calculate_sha256('2026-10-04 10:22:45 [FILE_AUDIT] Host=SRV-CORP-FILE User=employee01 File="\\\\SRV-CORP-FILE\\confidential\\customer_data.csv" Access=READ Status=SUCCESS'),
            filename="file_access.log",
            file_size_bytes=15360,
            mime_type="text/plain",
            location="Server Rack SRV-CORP-FILE (Datacenter)",
            description="File system access audit log confirming unauthorized read access to customer_data.csv.",
            collector="NTFS Audit Monitor",
            processing_status="verified",
            media_path="/evidence/file_access.log",
        ),
        EvidenceModel(
            evidence_id="EVD-005",
            case_id="CASE-001",
            type="firewall_log",
            source="firewall.log",
            timestamp="2026-10-04T10:25:00",
            hash=calculate_sha256("2026-10-04 10:25:00 [FIREWALL] PROTO=TCP SRC=192.168.1.20:49152 DST=198.51.100.24:443 ACTION=ALLOW BYTES_SENT=8452100 BYTES_RCVD=15200"),
            filename="firewall.log",
            file_size_bytes=51200,
            mime_type="text/plain",
            location="Perimeter Firewall Gateway",
            description="Palo Alto firewall flow record confirming 8.45 MB outbound exfiltration to 198.51.100.24.",
            collector="Perimeter Network Sensor",
            processing_status="verified",
            media_path="/evidence/firewall.log",
        ),
        EvidenceModel(
            evidence_id="EVD-006",
            case_id="CASE-001",
            type="photo_evidence",
            source="workstation_photo.jpg",
            timestamp="2026-10-04T10:16:00",
            hash=calculate_sha256(Path("data/evidence/workstation_photo.jpg").read_bytes() if Path("data/evidence/workstation_photo.jpg").is_file() else "workstation_photo_content"),
            filename="workstation_photo.jpg",
            file_size_bytes=128400,
            mime_type="image/jpeg",
            location="Workstation Cubicle 14 (Desk Surface)",
            description="Scene photograph of employee01 physical desk showing monitor terminal and active USB indicator.",
            collector="Field Forensics Unit Lead",
            processing_status="processed_by_opencv",
            metadata_json='{"dimensions": {"width": 1280, "height": 720}, "opencv_analysis": {"sharpness_laplacian_variance": 2293.76, "detected_keypoints": 500, "edge_pixels": 24414}}',
            media_path="/evidence/workstation_photo.jpg",
        ),
        EvidenceModel(
            evidence_id="EVD-007",
            case_id="CASE-001",
            type="cctv_footage",
            source="cctv_server_room.mp4",
            timestamp="2026-10-04T10:20:45",
            hash=calculate_sha256(Path("data/evidence/cctv_server_room.mp4").read_bytes() if Path("data/evidence/cctv_server_room.mp4").is_file() else "cctv_video_content"),
            filename="cctv_server_room.mp4",
            file_size_bytes=248000,
            mime_type="video/mp4",
            location="Server Room Entrance Door (Hallway)",
            description="Simulated CCTV surveillance recording verifying badge swipe attempt matching lateral SMB movement.",
            collector="Physical Access Control CAM-04",
            processing_status="processed_by_opencv",
            metadata_json='{"video_metadata": {"width": 854, "height": 480, "fps": 15.0, "duration_seconds": 6.0, "camera_id": "CAM-04"}}',
            media_path="/evidence/cctv_server_room.mp4",
        ),
        EvidenceModel(
            evidence_id="EVD-008",
            case_id="CASE-001",
            type="physical_evidence",
            source="tampered_usb_drive.jpg",
            timestamp="2026-10-04T10:17:15",
            hash=calculate_sha256(Path("data/evidence/tampered_usb_drive.jpg").read_bytes() if Path("data/evidence/tampered_usb_drive.jpg").is_file() else "tampered_usb_drive_content"),
            filename="tampered_usb_drive.jpg",
            file_size_bytes=98200,
            mime_type="image/jpeg",
            location="Workstation Cubicle 14 (PC Tower USB Port 2)",
            description="Recovered physical USB flash drive containing staged payload script. Custody seal intact.",
            collector="Hardware Evidence Specialist",
            processing_status="verified",
            metadata_json='{"physical_metadata": {"asset_tag": "PHYS-8821", "capacity": "64GB", "locker": "Evidence Vault Locker #12"}}',
            media_path="/evidence/tampered_usb_drive.jpg",
        ),
        EvidenceModel(
            evidence_id="EVD-009",
            case_id="CASE-001",
            type="document_evidence",
            source="forensic_intake_report.txt",
            timestamp="2026-10-04T10:12:00",
            hash=calculate_sha256(Path("data/evidence/forensic_intake_report.txt").read_bytes() if Path("data/evidence/forensic_intake_report.txt").is_file() else "intake_report_content"),
            filename="forensic_intake_report.txt",
            file_size_bytes=4200,
            mime_type="text/plain",
            location="SOC Incident Queue (Terminal A)",
            description="Formal security operations center incident intake report initiating case CASE-001.",
            collector="SOC Shift Supervisor",
            processing_status="verified",
            metadata_json='{"document_metadata": {"sample_line_count": 25, "case_ref": "CASE-001"}}',
            media_path="/evidence/forensic_intake_report.txt",
        ),
    ]
    for item in evidence_items:
        db.add(item)
    db.commit()

    # 3. Simulated Correlated Events (exact output of Forensic Engine Milestone 1)
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
            timestamp="2026-10-04T10:21:05",
            event_type="internal_server_connection",
            user="employee01",
            device="WORKSTATION-01",
            source_ip="192.168.1.20",
            destination_ip=None,
            file=None,
            server="SRV-CORP-FILE",
            evidence_id="EVD-003",
        ),
        EventModel(
            event_id="EVT-004",
            case_id="CASE-001",
            timestamp="2026-10-04T10:22:45",
            event_type="sensitive_file_access",
            user="employee01",
            device="WORKSTATION-01",
            source_ip=None,
            destination_ip=None,
            file="\\SRV-CORP-FILE\\confidential\\customer_data.csv",
            server="SRV-CORP-FILE",
            evidence_id="EVD-004",
        ),
        EventModel(
            event_id="EVT-005",
            case_id="CASE-001",
            timestamp="2026-10-04T10:24:15",
            event_type="suspicious_network_connection",
            user=None,
            device=None,
            source_ip="192.168.1.20",
            destination_ip="198.51.100.24",
            file=None,
            server=None,
            evidence_id="EVD-005",
        ),
        EventModel(
            event_id="EVT-006",
            case_id="CASE-001",
            timestamp="2026-10-04T10:25:00",
            event_type="outbound_data_transfer",
            user=None,
            device=None,
            source_ip="192.168.1.20",
            destination_ip="198.51.100.24",
            file=None,
            server=None,
            evidence_id="EVD-005",
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
            event_ids=["EVT-004", "EVT-006"],
            evidence_ids=["EVD-004", "EVD-005"],
        ),
        FindingModel(
            finding_id="FND-003",
            case_id="CASE-001",
            title="External Command-and-Control and Data Exfiltration",
            description="Internal workstation 192.168.1.20 initiated external connection and transmitted 8.45MB of confidential records to 198.51.100.24:443.",
            severity="CRITICAL",
            confidence=0.98,
            event_ids=["EVT-005", "EVT-006"],
            evidence_ids=["EVD-005"],
        ),
    ]
    for fnd in findings:
        db.add(fnd)
    db.commit()
