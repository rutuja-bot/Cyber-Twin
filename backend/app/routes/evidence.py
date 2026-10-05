"""API routes for Evidence Ingestion, OpenCV Processing, Metadata, and 3D Markers."""

import json
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.case import CaseModel
from app.models.evidence import EvidenceModel
from app.schemas.evidence import EvidenceCreate, EvidenceResponse
from app.services.hashing import calculate_sha256

# Import EvidenceProcessor and EvidenceLinker from forensic-engine
import sys
sys.path.insert(0, str(Path("forensic-engine/evidence-processing")))
sys.path.insert(0, str(Path("forensic-engine/evidence-linking")))
from processor import EvidenceProcessor
from linker import EvidenceLinker
from app.services.forensic_loader import get_reconstructed_incident

router = APIRouter(prefix="/cases/{case_id}/evidence", tags=["Evidence"])

# 3D Spatial Marker Coordinates for Case-001 Investigation Scene
DEFAULT_3D_MARKERS = {
    "EVD-001": {"position": [-4.5, 0.85, 0.2], "zone": "Workstation Cubicle 14", "color": "#00f0ff", "label": "auth.log (Login Terminal)"},
    "EVD-002": {"position": [-3.8, 0.35, 0.6], "zone": "Workstation Cubicle 14", "color": "#ffaa00", "label": "endpoint.log (PowerShell Spawn)"},
    "EVD-003": {"position": [2.1, 1.2, 0.0], "zone": "Server Room Entrance", "color": "#aa00ff", "label": "server.log (Lateral SMB Pivot)"},
    "EVD-004": {"position": [5.5, 1.5, -1.0], "zone": "Server Rack SRV-CORP-FILE", "color": "#ff0055", "label": "file_access.log (Customer DB)"},
    "EVD-005": {"position": [0.0, 1.0, -4.0], "zone": "Perimeter Firewall Gateway", "color": "#00ff88", "label": "firewall.log (C2 Exfiltration)"},
    "EVD-006": {"position": [-5.2, 0.85, -0.4], "zone": "Workstation Cubicle 14", "color": "#ffcc00", "label": "Scene Photo (Desk 14)"},
    "EVD-007": {"position": [3.5, 2.5, 0.0], "zone": "Server Room Ceiling", "color": "#7928ca", "label": "CCTV Camera 04 (Hallway)"},
    "EVD-008": {"position": [-3.5, 0.82, 0.4], "zone": "Workstation Cubicle 14", "color": "#ff0033", "label": "Physical Evidence (USB Media)"},
    "EVD-009": {"position": [-7.5, 0.85, 2.0], "zone": "SOC Command Post", "color": "#0099ff", "label": "Intake Report (DOC-001)"},
}


@router.post("", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
def create_evidence(case_id: str, evidence_in: EvidenceCreate, db: Session = Depends(get_db)):
    """Register a new digital/physical/multimedia evidence artifact with SHA-256 and metadata."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    evidence_id = evidence_in.evidence_id or f"EVD-{uuid.uuid4().hex[:6].upper()}"

    existing = db.query(EvidenceModel).filter(EvidenceModel.evidence_id == evidence_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Evidence with ID '{evidence_id}' already exists",
        )

    # Calculate SHA-256 hash
    if evidence_in.content is not None:
        computed_hash = calculate_sha256(evidence_in.content)
    elif evidence_in.hash:
        computed_hash = evidence_in.hash
    else:
        computed_hash = calculate_sha256(f"{evidence_in.source}:{evidence_in.type}:{evidence_id}")

    timestamp = evidence_in.timestamp or datetime.utcnow().isoformat()
    processing_status = evidence_in.processing_status or "verified"
    metadata_json = evidence_in.metadata_json

    # Run OpenCV image processing if requested or if image file exists
    if evidence_in.process_with_opencv or "photo" in evidence_in.type.lower() or "image" in (evidence_in.mime_type or "").lower():
        try:
            # Check if file exists on disk
            potential_path = Path("data/evidence") / (evidence_in.filename or evidence_in.source)
            if potential_path.is_file():
                proc = EvidenceProcessor(output_dir="data/processed/evidence")
                opencv_res = proc.process_image(potential_path, artifact_id=evidence_id, export_processed=True)
                processing_status = "processed_by_opencv"
                meta_dict = json.loads(metadata_json) if metadata_json else {}
                meta_dict["opencv_analysis"] = opencv_res.get("opencv_analysis", {})
                metadata_json = json.dumps(meta_dict)
        except Exception:
            pass

    db_evidence = EvidenceModel(
        evidence_id=evidence_id,
        case_id=case_id,
        type=evidence_in.type,
        source=evidence_in.source,
        timestamp=timestamp,
        hash=computed_hash,
        filename=evidence_in.filename or evidence_in.source,
        file_size_bytes=evidence_in.file_size_bytes or (len(evidence_in.content) if evidence_in.content else 1024),
        mime_type=evidence_in.mime_type or "text/plain",
        location=evidence_in.location or "Digital Forensic Vault",
        description=evidence_in.description or f"Forensic artifact {evidence_id}",
        collector=evidence_in.collector or "Digital Forensics Unit",
        processing_status=processing_status,
        metadata_json=metadata_json,
        media_path=evidence_in.media_path,
    )
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    return db_evidence


@router.post("/upload", response_model=EvidenceResponse, status_code=status.HTTP_201_CREATED)
async def upload_evidence_file(
    case_id: str,
    file: UploadFile = File(...),
    type: str = Form("unclassified"),
    location: Optional[str] = Form("Investigation Scene"),
    description: Optional[str] = Form("Uploaded forensic artifact"),
    collector: Optional[str] = Form("Lead Forensics Specialist"),
    db: Session = Depends(get_db),
):
    """Upload real forensic artifact (photo, CCTV, document, log) with OpenCV processing."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    file_bytes = await file.read()
    evidence_id = f"EVD-{uuid.uuid4().hex[:6].upper()}"
    filename = file.filename or f"evidence_{evidence_id}.bin"
    mime_type = file.content_type or "application/octet-stream"

    # Save to data/evidence and frontend/public/evidence
    save_dirs = [Path("data/evidence"), Path("frontend/public/evidence")]
    for d in save_dirs:
        d.mkdir(parents=True, exist_ok=True)
        with open(d / filename, "wb") as f:
            f.write(file_bytes)

    # Compute SHA-256
    proc = EvidenceProcessor(output_dir="data/processed/evidence")
    sha256_hash = proc.calculate_sha256(file_bytes)
    processing_status = "verified"
    metadata_dict: Dict[str, Any] = {"file_size_bytes": len(file_bytes), "mime_type": mime_type}

    # Run OpenCV if image
    if "image" in mime_type.lower() or filename.lower().endswith((".jpg", ".jpeg", ".png")):
        try:
            cv_res = proc.process_image(file_bytes, artifact_id=evidence_id, export_processed=True)
            processing_status = "processed_by_opencv"
            metadata_dict["opencv_analysis"] = cv_res.get("opencv_analysis", {})
            metadata_dict["dimensions"] = {"width": cv_res.get("width"), "height": cv_res.get("height")}
            type = "photo_evidence" if type == "unclassified" else type
        except Exception as e:
            metadata_dict["opencv_error"] = str(e)

    # Run Video Processing if CCTV / video
    elif "video" in mime_type.lower() or filename.lower().endswith((".mp4", ".webm", ".avi")):
        try:
            vid_res = proc.process_video(Path("data/evidence") / filename, artifact_id=evidence_id, location=location or "Scene")
            processing_status = "processed_by_opencv"
            metadata_dict["video_metadata"] = vid_res.get("video_metadata", {})
            type = "cctv_footage" if type == "unclassified" else type
        except Exception as e:
            metadata_dict["video_error"] = str(e)

    # Run Document Processing if text / pdf
    elif "text" in mime_type.lower() or "pdf" in mime_type.lower() or filename.lower().endswith((".txt", ".log", ".pdf")):
        try:
            doc_res = proc.process_document(file_bytes, artifact_id=evidence_id)
            metadata_dict["document_metadata"] = doc_res.get("document_metadata", {})
            type = "document_evidence" if type == "unclassified" else type
        except Exception:
            pass

    media_path = f"/evidence/{filename}"

    db_evidence = EvidenceModel(
        evidence_id=evidence_id,
        case_id=case_id,
        type=type,
        source=filename,
        timestamp=datetime.utcnow().isoformat(),
        hash=sha256_hash,
        filename=filename,
        file_size_bytes=len(file_bytes),
        mime_type=mime_type,
        location=location,
        description=description,
        collector=collector,
        processing_status=processing_status,
        metadata_json=json.dumps(metadata_dict),
        media_path=media_path,
    )
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)
    return db_evidence


@router.get("", response_model=List[EvidenceResponse])
def list_case_evidence(case_id: str, db: Session = Depends(get_db)):
    """Retrieve all evidence artifacts associated with a case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )
    return db.query(EvidenceModel).filter(EvidenceModel.case_id == case_id).all()


@router.get("/{evidence_id}", response_model=EvidenceResponse)
def get_evidence_item(case_id: str, evidence_id: str, db: Session = Depends(get_db)):
    """Retrieve a specific evidence artifact with full metadata."""
    item = db.query(EvidenceModel).filter(
        EvidenceModel.case_id == case_id,
        EvidenceModel.evidence_id == evidence_id,
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence '{evidence_id}' not found under case '{case_id}'",
        )
    return item


@router.post("/{evidence_id}/process", response_model=EvidenceResponse)
def process_evidence_opencv(case_id: str, evidence_id: str, db: Session = Depends(get_db)):
    """Trigger OpenCV feature extraction and visual enhancement on an evidence item."""
    item = db.query(EvidenceModel).filter(
        EvidenceModel.case_id == case_id,
        EvidenceModel.evidence_id == evidence_id,
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evidence '{evidence_id}' not found",
        )

    proc = EvidenceProcessor(output_dir="data/processed/evidence")
    file_path = Path("data/evidence") / (item.filename or item.source)
    if not file_path.is_file():
        file_path = Path("frontend/public/evidence") / (item.filename or item.source)

    if file_path.is_file():
        res = proc.process_image(file_path, artifact_id=evidence_id, export_processed=True)
        meta = json.loads(item.metadata_json) if item.metadata_json else {}
        meta["opencv_analysis"] = res.get("opencv_analysis", {})
        meta["processed_artifacts"] = res.get("processed_artifacts", {})
        item.metadata_json = json.dumps(meta)
        item.processing_status = "processed_by_opencv"
        db.commit()
        db.refresh(item)

    return item


@router.get("/{evidence_id}/traceability")
def get_evidence_traceability(case_id: str, evidence_id: str, db: Session = Depends(get_db)):
    """Get complete backward and forward traceability chain for an evidence artifact."""
    recon = get_reconstructed_incident(db, case_id=case_id)
    if not recon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Reconstruction data not found for case",
        )

    linker = EvidenceLinker(recon)
    chain = linker.trace_evidence(evidence_id)

    # Fetch evidence item details
    item = db.query(EvidenceModel).filter(EvidenceModel.evidence_id == evidence_id).first()
    if item:
        chain["hash"] = item.hash
        chain["source"] = item.source
        chain["location"] = item.location
        chain["type"] = item.type

    return chain


@router.get("/markers/3d")
def get_3d_evidence_markers(case_id: str, db: Session = Depends(get_db)):
    """Retrieve all 3D spatial evidence markers with scene coordinates and labels."""
    evidence_items = db.query(EvidenceModel).filter(EvidenceModel.case_id == case_id).all()
    recon = get_reconstructed_incident(db, case_id=case_id) or {}
    linker = EvidenceLinker(recon) if recon else None

    markers = []
    for ev in evidence_items:
        m_info = DEFAULT_3D_MARKERS.get(ev.evidence_id, {
            "position": [-2.0, 1.0, 0.0],
            "zone": ev.location or "Investigation Scene",
            "color": "#00f0ff",
            "label": f"{ev.evidence_id} ({ev.source})",
        })

        trace = linker.trace_evidence(ev.evidence_id) if linker else {}

        markers.append({
            "marker_id": f"MKR-{ev.evidence_id}",
            "evidence_id": ev.evidence_id,
            "label": m_info["label"],
            "zone": m_info["zone"],
            "color": m_info["color"],
            "position": m_info["position"],
            "type": ev.type,
            "source": ev.source,
            "hash": ev.hash,
            "location": ev.location or m_info["zone"],
            "description": ev.description,
            "media_path": ev.media_path,
            "supported_events": trace.get("supported_events", []),
            "involved_entities": trace.get("involved_entities", []),
            "supported_findings": trace.get("supported_findings", []),
        })

    return markers
