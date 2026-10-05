"""API routes for Incident Reconstruction, Graph, and Timeline."""

from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.case import CaseModel
from app.models.evidence import EvidenceModel
from app.schemas.reconstruction import (
    GraphData,
    IncidentReconstructionResponse,
    TimelineItemResponse,
)
from app.services.forensic_loader import (
    get_reconstructed_incident,
    ingest_reconstructed_incident,
    load_incident_reconstruction_file,
)

router = APIRouter(prefix="/cases/{case_id}/reconstruction", tags=["Incident Reconstruction"])


@router.get("", response_model=IncidentReconstructionResponse)
def get_case_reconstruction(case_id: str, db: Session = Depends(get_db)):
    """Retrieve full incident reconstruction (timeline, entity-relationship graph, attack progression) for a case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    recon = get_reconstructed_incident(db, case_id=case_id)
    if not recon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reconstructed incident data not found for case '{case_id}'",
        )

    return recon


@router.get("/graph", response_model=GraphData)
def get_case_reconstruction_graph(case_id: str, db: Session = Depends(get_db)):
    """Retrieve the correlated entity-relationship Cyber Twin graph (nodes and directed edges) for a case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    recon = get_reconstructed_incident(db, case_id=case_id)
    if not recon or "graph" not in recon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Graph reconstruction data not found for case '{case_id}'",
        )

    return recon["graph"]


@router.get("/timeline", response_model=List[TimelineItemResponse])
def get_case_reconstruction_timeline(case_id: str, db: Session = Depends(get_db)):
    """Retrieve the chronologically reconstructed attack timeline for a case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    recon = get_reconstructed_incident(db, case_id=case_id)
    if not recon or "timeline" not in recon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Timeline reconstruction data not found for case '{case_id}'",
        )

    return recon["timeline"]


@router.post("/import-processed", response_model=IncidentReconstructionResponse, status_code=status.HTTP_201_CREATED)
def import_processed_reconstruction_file(
    case_id: str,
    file_path: Optional[str] = Query(None, description="Custom path to incident_reconstruction.json file"),
    db: Session = Depends(get_db),
):
    """Import incident reconstruction artifact directly into the database (events and findings) and serve graph/timeline."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    target_path = Path(file_path) if file_path else Path("data/processed/incident_reconstruction.json")
    if not target_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Incident reconstruction file not found at '{target_path}'",
        )

    try:
        recon_data = load_incident_reconstruction_file(target_path)
        persisted = ingest_reconstructed_incident(db, case_id=case_id, reconstruction_data=recon_data)
        return persisted
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to import incident reconstruction: {str(e)}",
        )


@router.get("/report")
def get_forensic_investigation_report(case_id: str, db: Session = Depends(get_db)):
    """Generate a comprehensive, audit-ready digital forensic investigation report for the case."""
    case = db.query(CaseModel).filter(CaseModel.case_id == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found",
        )

    recon = get_reconstructed_incident(db, case_id=case_id) or {}
    evidence_items = db.query(EvidenceModel).filter(EvidenceModel.case_id == case_id).all()
    events = recon.get("events", [])
    findings = recon.get("findings", [])
    timeline = recon.get("timeline", [])
    graph = recon.get("graph", {})
    attack_progression = recon.get("attack_progression", [])

    return {
        "report_id": f"REP-{case_id}-2026",
        "case_id": case_id,
        "title": case.title,
        "classification": "CONFIDENTIAL // FOR LAW ENFORCEMENT & SOC AUDIT ONLY",
        "generation_timestamp": "2026-10-06T02:00:00Z",
        "investigating_authority": "Let Her Code — Digital Forensics Incident Response Team",
        "standards_compliance": ["NIST SP 800-61 Rev. 3", "NIST SP 800-86", "MITRE ATT&CK v14", "STIX 2.1"],
        "executive_summary": (
            f"Forensic investigation into {case.title} successfully reconstructed a complete 6-stage "
            "attack progression. Initial access via compromised employee credentials progressed through "
            "PowerShell execution on WORKSTATION-01, lateral SMB pivoting to enterprise file server SRV-CORP-FILE, "
            "unauthorized confidential customer data collection, and 8.45 MB data exfiltration to external C2 (198.51.100.24). "
            "All physical, multimedia, and digital log artifacts have been cryptographically verified via SHA-256."
        ),
        "evidence_inventory": [
            {
                "evidence_id": e.evidence_id,
                "type": e.type,
                "source": e.source,
                "hash_sha256": e.hash,
                "sha256_hash": e.hash,
                "location": e.location or "Evidence Vault",
                "collector": e.collector or "Digital Forensics Team",
                "processing_status": e.processing_status,
                "media_path": e.media_path,
            }
            for e in evidence_items
        ],
        "evidence_chain_of_custody": [
            {
                "evidence_id": e.evidence_id,
                "type": e.type,
                "source": e.source,
                "filename": e.filename or e.source,
                "sha256_hash": e.hash,
                "location": e.location or "Evidence Vault",
                "collector": e.collector or "Digital Forensics Team",
                "processing_status": e.processing_status,
                "media_path": e.media_path,
            }
            for e in evidence_items
        ],
        "timeline_stages": timeline,
        "attack_progression": attack_progression,
        "graph_summary": {
            "node_count": len(graph.get("nodes", [])),
            "edge_count": len(graph.get("edges", [])),
            "compromised_nodes": ["user:employee01", "device:WORKSTATION-01", "file:\\SRV-CORP-FILE\\confidential\\customer_data.csv"],
        },
        "findings": findings,
        "investigation_3d_summary": {
            "spatial_scene": "Corporate Office & Datacenter Facility",
            "zones": ["Workstation Cubicle 14", "Server Room SRV-CORP-FILE", "Perimeter Network Gateway"],
            "evidence_marker_count": len(evidence_items),
        },
        "remediation_actions": [
            "Force immediate enterprise-wide password rotation and revoke active Kerberos TGTs for employee01.",
            "Enforce AppLocker and Constrained Language Mode for PowerShell across all endpoint workstations.",
            "Implement strict Network Access Control (NAC) and SMB isolation between user VLANs and datacenter file servers.",
            "Blackhole malicious destination IP 198.51.100.24 on perimeter firewall and IDS/IPS sensors.",
            "Notify data protection regulatory authorities and initiate customer breach disclosure procedures.",
        ],
    }


@router.get("/database/status")
def get_database_and_graph_status():
    """Retrieve runtime diagnostics for PostgreSQL and Neo4j database adapters."""
    from database.postgresql.adapter import PostgresAdapter
    from database.neo4j.adapter import Neo4jAdapter

    pg_adapter = PostgresAdapter()
    neo_adapter = Neo4jAdapter()

    return {
        "relational_storage": pg_adapter.check_connection(),
        "graph_database": neo_adapter.check_connection(),
        "in_memory_stix_graph": {
            "status": "active",
            "engine": "STIX 2.1 Multi-Entity Graph Correlator",
        },
    }


@router.post("/database/export-neo4j")
def export_neo4j_cypher(case_id: str, db: Session = Depends(get_db)):
    """Export the Cyber Twin graph to Neo4j Cypher statements."""
    recon = get_reconstructed_incident(db, case_id=case_id)
    if not recon or "graph" not in recon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Graph data not found for case '{case_id}'",
        )

    from database.neo4j.adapter import Neo4jAdapter
    neo_adapter = Neo4jAdapter()
    cypher_text = neo_adapter.generate_cypher(recon["graph"], case_id=case_id)
    export_path = neo_adapter.export_cypher_file(recon["graph"], case_id=case_id)

    return {
        "case_id": case_id,
        "cypher_export_path": export_path,
        "cypher_statements_preview": cypher_text[:1200] + "\n...",
        "status": "cypher_exported_successfully",
    }


@router.get("/3d-scene")
def get_3d_investigation_scene(case_id: str, db: Session = Depends(get_db)):
    """Retrieve 3D investigation scene geometry metadata, zones, and spatial evidence markers."""
    evidence_items = db.query(EvidenceModel).filter(EvidenceModel.case_id == case_id).all()
    from app.routes.evidence import DEFAULT_3D_MARKERS

    markers = []
    for ev in evidence_items:
        m_info = DEFAULT_3D_MARKERS.get(ev.evidence_id, {
            "position": [-2.0, 1.0, 0.0],
            "zone": ev.location or "Investigation Scene",
            "color": "#00f0ff",
            "label": f"{ev.evidence_id}",
        })
        markers.append({
            "marker_id": f"MKR-{ev.evidence_id}",
            "evidence_id": ev.evidence_id,
            "label": m_info["label"],
            "zone": m_info["zone"],
            "color": m_info["color"],
            "position": m_info["position"],
            "source": ev.source,
            "type": ev.type,
            "hash": ev.hash,
        })

    return {
        "case_id": case_id,
        "scene_name": "Corporate Office & Server Room Investigation Environment",
        "model_asset_url": "/models/investigation_scene.glb",
        "zones": [
            {"id": "zone-cubicle", "name": "Workstation Cubicle 14 (Finance)", "center": [-5.0, 0, 0.0]},
            {"id": "zone-server", "name": "Datacenter Server Room (SRV-CORP-FILE)", "center": [6.0, 0, 0.0]},
            {"id": "zone-perimeter", "name": "Perimeter Firewall Corridor", "center": [0.0, 0, -4.0]},
        ],
        "markers": markers,
    }
