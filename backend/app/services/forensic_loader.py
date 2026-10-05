"""Forensic event loader service for integrating normalized forensic engine output into the Cyber Twin backend."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from sqlalchemy.orm import Session

from app.models.case import CaseModel
from app.models.event import EventModel
from app.models.evidence import EvidenceModel
from app.models.finding import FindingModel
from app.schemas.event import EventCreate
from app.services.hashing import calculate_sha256

# Standard evidence mappings matching the forensic engine's milestone 1 artifacts
# Standard evidence mappings matching the forensic engine and PPT artifacts
DEFAULT_FORENSIC_EVIDENCE = [
    {
        "evidence_id": "EVD-001",
        "type": "auth_log",
        "source": "auth.log",
        "timestamp": "2026-10-04T10:15:00",
        "content": "2026-10-04 10:15:00 auth.log sshd[12410]: Accepted password for employee01 from 192.168.1.20 port 44321 ssh2",
        "filename": "auth.log",
        "location": "Workstation Cubicle 14 (Login Terminal)",
        "description": "Linux/SSH authentication log capturing credential acceptance for employee01.",
        "collector": "Identity & Access Management Logger",
        "processing_status": "verified",
        "media_path": "/evidence/auth.log",
    },
    {
        "evidence_id": "EVD-002",
        "type": "endpoint_log",
        "source": "endpoint.log",
        "timestamp": "2026-10-04T10:18:30",
        "content": '2026-10-04 10:18:30 [ENDPOINT] Host=WORKSTATION-01 User=employee01 Process=powershell.exe CommandLine="powershell.exe -enc SQBFAFgA" Action=suspicious_process_spawn PID=4912',
        "filename": "endpoint.log",
        "location": "Workstation Cubicle 14 (WORKSTATION-01)",
        "description": "EDR process telemetry logging obfuscated Base64 PowerShell spawn PID 4912.",
        "collector": "CrowdStrike / Sysmon Agent",
        "processing_status": "verified",
        "media_path": "/evidence/endpoint.log",
    },
    {
        "evidence_id": "EVD-003",
        "type": "server_log",
        "source": "server.log",
        "timestamp": "2026-10-04T10:21:05",
        "content": "2026-10-04 10:21:05 [SERVER] Host=SRV-CORP-FILE ClientIP=192.168.1.20 User=employee01 Service=SMB Action=session_connect Status=SUCCESS",
        "filename": "server.log",
        "location": "Server Room Entrance (Hallway)",
        "description": "Windows Server audit event 4624 establishing lateral SMB session from 192.168.1.20.",
        "collector": "Windows Event Forwarding (WEF)",
        "processing_status": "verified",
        "media_path": "/evidence/server.log",
    },
    {
        "evidence_id": "EVD-004",
        "type": "file_access_log",
        "source": "file_access.log",
        "timestamp": "2026-10-04T10:22:45",
        "content": '2026-10-04 10:22:45 [FILE_AUDIT] Host=SRV-CORP-FILE User=employee01 File="\\\\SRV-CORP-FILE\\confidential\\customer_data.csv" Access=READ Status=SUCCESS',
        "filename": "file_access.log",
        "location": "Server Rack SRV-CORP-FILE (Datacenter)",
        "description": "File system access audit log confirming unauthorized read access to customer_data.csv.",
        "collector": "NTFS Audit Monitor",
        "processing_status": "verified",
        "media_path": "/evidence/file_access.log",
    },
    {
        "evidence_id": "EVD-005",
        "type": "firewall_log",
        "source": "firewall.log",
        "timestamp": "2026-10-04T10:25:00",
        "content": "2026-10-04 10:25:00 [FIREWALL] PROTO=TCP SRC=192.168.1.20:49152 DST=198.51.100.24:443 ACTION=ALLOW BYTES_SENT=8452100 BYTES_RCVD=15200",
        "filename": "firewall.log",
        "location": "Perimeter Firewall Gateway",
        "description": "Palo Alto firewall flow record confirming 8.45 MB outbound exfiltration to 198.51.100.24.",
        "collector": "Perimeter Network Sensor",
        "processing_status": "verified",
        "media_path": "/evidence/firewall.log",
    },
    {
        "evidence_id": "EVD-006",
        "type": "photo_evidence",
        "source": "workstation_photo.jpg",
        "timestamp": "2026-10-04T10:16:00",
        "content": "workstation_photo_jpg_simulated_bytes",
        "filename": "workstation_photo.jpg",
        "location": "Workstation Cubicle 14 (Desk Surface)",
        "description": "Scene photograph of employee01 physical desk showing monitor terminal and active USB indicator.",
        "collector": "Field Forensics Unit Lead",
        "processing_status": "processed_by_opencv",
        "media_path": "/evidence/workstation_photo.jpg",
    },
    {
        "evidence_id": "EVD-007",
        "type": "cctv_footage",
        "source": "cctv_server_room.mp4",
        "timestamp": "2026-10-04T10:20:45",
        "content": "cctv_server_room_mp4_simulated_bytes",
        "filename": "cctv_server_room.mp4",
        "location": "Server Room Entrance Door (Hallway)",
        "description": "Simulated CCTV surveillance recording verifying badge swipe attempt matching lateral SMB movement.",
        "collector": "Physical Access Control CAM-04",
        "processing_status": "processed_by_opencv",
        "media_path": "/evidence/cctv_server_room.mp4",
    },
    {
        "evidence_id": "EVD-008",
        "type": "physical_evidence",
        "source": "tampered_usb_drive.jpg",
        "timestamp": "2026-10-04T10:17:15",
        "content": "tampered_usb_drive_jpg_simulated_bytes",
        "filename": "tampered_usb_drive.jpg",
        "location": "Workstation Cubicle 14 (PC Tower USB Port 2)",
        "description": "Recovered physical USB flash drive containing staged payload script. Custody seal intact.",
        "collector": "Hardware Evidence Specialist",
        "processing_status": "verified",
        "media_path": "/evidence/tampered_usb_drive.jpg",
    },
    {
        "evidence_id": "EVD-009",
        "type": "document_evidence",
        "source": "forensic_intake_report.txt",
        "timestamp": "2026-10-04T10:12:00",
        "content": "CYBER INCIDENT INTAKE & FORENSIC EVIDENCE CUSTODY RECORD",
        "filename": "forensic_intake_report.txt",
        "location": "SOC Incident Queue (Terminal A)",
        "description": "Formal security operations center incident intake report initiating case CASE-001.",
        "collector": "SOC Shift Supervisor",
        "processing_status": "verified",
        "media_path": "/evidence/forensic_intake_report.txt",
    },
]


def _find_data_file(rel_path: Union[str, Path]) -> Path:
    p = Path(rel_path)
    if p.is_file():
        return p
    current = Path(__file__).resolve()
    for parent in current.parents:
        candidate = parent / rel_path
        if candidate.is_file():
            return candidate
    return p


def load_normalized_events_file(file_path: Union[str, Path]) -> List[Dict[str, Any]]:
    """Read and deserialize normalized event JSON generated by the forensic engine."""
    path = _find_data_file(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"Normalized events file not found: {file_path}")

    with open(path, "r", encoding="utf-8-sig") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Normalized events JSON must contain a top-level list of event objects")

    return data


def ensure_forensic_evidence_records(db: Session, case_id: str) -> None:
    """Ensure baseline forensic evidence records exist in the database so foreign keys resolve."""
    for ev_info in DEFAULT_FORENSIC_EVIDENCE:
        ev_id = ev_info["evidence_id"]
        # Primary key check across evidence table
        existing = db.query(EvidenceModel).filter(
            EvidenceModel.evidence_id == ev_id,
        ).first()

        if not existing:
            real_file = Path("data/evidence") / ev_info.get("filename", "")
            if real_file.is_file():
                ev_hash = calculate_sha256(real_file)
                file_size = real_file.stat().st_size
            else:
                ev_hash = calculate_sha256(ev_info["content"])
                file_size = len(ev_info["content"])

            db_ev = EvidenceModel(
                evidence_id=ev_id,
                case_id=case_id,
                type=ev_info["type"],
                source=ev_info["source"],
                timestamp=ev_info["timestamp"],
                hash=ev_hash,
                filename=ev_info.get("filename"),
                file_size_bytes=file_size,
                location=ev_info.get("location"),
                description=ev_info.get("description"),
                collector=ev_info.get("collector"),
                processing_status=ev_info.get("processing_status", "verified"),
                media_path=ev_info.get("media_path"),
            )
            db.add(db_ev)
    db.commit()


def ingest_normalized_events(
    db: Session,
    case_id: str,
    events: List[Union[Dict[str, Any], EventCreate]],
) -> List[EventModel]:
    """Ingest a list of normalized events into the database under the specified case.

    Validates schema against EventCreate, avoids duplicate event_id errors by updating
    existing records or generating scoped IDs for different cases, and returns the list of EventModel instances.
    """
    # Ensure parent case exists
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise ValueError(f"Case with ID '{case_id}' does not exist")

    # Ensure evidence records exist so foreign keys resolve
    ensure_forensic_evidence_records(db, case_id)

    persisted_events: List[EventModel] = []

    for item in events:
        # Validate through Pydantic schema
        if isinstance(item, dict):
            event_obj = EventCreate(**item)
        else:
            event_obj = item

        if not event_obj.event_id:
            raise ValueError("Normalized events from forensic engine must provide an event_id")

        target_id = event_obj.event_id
        existing_evt = db.query(EventModel).filter(EventModel.event_id == target_id).first()

        if existing_evt and existing_evt.case_id == case_id:
            # Update attributes in place for this case
            existing_evt.timestamp = event_obj.timestamp
            existing_evt.event_type = event_obj.event_type
            existing_evt.user = event_obj.user
            existing_evt.device = event_obj.device
            existing_evt.source_ip = event_obj.source_ip
            existing_evt.destination_ip = event_obj.destination_ip
            existing_evt.file = event_obj.file
            existing_evt.server = event_obj.server
            existing_evt.evidence_id = event_obj.evidence_id
            persisted_events.append(existing_evt)
        else:
            # If the ID exists in another case, namespace the ID to preserve cross-case uniqueness
            if existing_evt and existing_evt.case_id != case_id:
                target_id = f"{case_id}-{event_obj.event_id}"

            new_evt = EventModel(
                event_id=target_id,
                case_id=case_id,
                timestamp=event_obj.timestamp,
                event_type=event_obj.event_type,
                user=event_obj.user,
                device=event_obj.device,
                source_ip=event_obj.source_ip,
                destination_ip=event_obj.destination_ip,
                file=event_obj.file,
                server=event_obj.server,
                evidence_id=event_obj.evidence_id,
            )
            db.add(new_evt)
            persisted_events.append(new_evt)

    db.commit()
    for evt in persisted_events:
        db.refresh(evt)

    return persisted_events


_RECONSTRUCTION_STORE: Dict[str, Dict[str, Any]] = {}


def load_incident_reconstruction_file(file_path: Union[str, Path]) -> Dict[str, Any]:
    """Read and deserialize incident reconstruction JSON generated by the forensic engine."""
    path = _find_data_file(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"Incident reconstruction file not found: {file_path}")

    with open(path, "r", encoding="utf-8-sig") as f:
        data = json.load(f)

    if not isinstance(data, dict):
        raise ValueError("Incident reconstruction JSON must contain a top-level dictionary")

    return data


def ingest_reconstructed_incident(
    db: Session,
    case_id: str,
    reconstruction_data: Dict[str, Any],
) -> Dict[str, Any]:
    """Ingest a reconstructed incident into the database under the specified case.

    Persists normalized events and findings, and caches the graph/timeline reconstruction.
    """
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise ValueError(f"Case with ID '{case_id}' does not exist")

    # Ingest events if present in the reconstruction
    if "events" in reconstruction_data and isinstance(reconstruction_data["events"], list):
        ingest_normalized_events(db, case_id=case_id, events=reconstruction_data["events"])

    # Ingest findings if present
    if "findings" in reconstruction_data and isinstance(reconstruction_data["findings"], list):
        for f_data in reconstruction_data["findings"]:
            f_id = f_data.get("finding_id")
            if not f_id:
                continue

            existing_finding = db.query(FindingModel).filter(FindingModel.finding_id == f_id).first()
            if existing_finding and existing_finding.case_id == case_id:
                existing_finding.title = f_data.get("title", existing_finding.title)
                existing_finding.description = f_data.get("description", existing_finding.description)
                existing_finding.severity = f_data.get("severity", existing_finding.severity)
                existing_finding.confidence = f_data.get("confidence", existing_finding.confidence)
                existing_finding.event_ids = f_data.get("event_ids", existing_finding.event_ids)
                existing_finding.evidence_ids = f_data.get("evidence_ids", existing_finding.evidence_ids)
            else:
                target_f_id = f_id if not existing_finding else f"{case_id}-{f_id}"
                new_finding = FindingModel(
                    finding_id=target_f_id,
                    case_id=case_id,
                    title=f_data.get("title", "Forensic Finding"),
                    description=f_data.get("description", ""),
                    severity=f_data.get("severity", "MEDIUM"),
                    confidence=f_data.get("confidence", 0.9),
                    event_ids=f_data.get("event_ids", []),
                    evidence_ids=f_data.get("evidence_ids", []),
                )
                db.add(new_finding)
        db.commit()

    # Store reconstruction for fast retrieval
    payload = dict(reconstruction_data)
    payload["case_id"] = case_id
    _RECONSTRUCTION_STORE[case_id] = payload

    return payload


def get_reconstructed_incident(db: Session, case_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve the incident reconstruction for a case from memory cache or default processed output."""
    if case_id in _RECONSTRUCTION_STORE:
        return _RECONSTRUCTION_STORE[case_id]

    # Check default incident_reconstruction.json
    default_path = _find_data_file("data/processed/incident_reconstruction.json")
    if default_path.is_file():
        try:
            data = load_incident_reconstruction_file(default_path)
            if data.get("case_id") == case_id:
                _RECONSTRUCTION_STORE[case_id] = data
                return data
        except Exception:
            pass

    return None
