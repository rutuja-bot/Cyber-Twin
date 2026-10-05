"""Tests for multimedia evidence, OpenCV processing, 3D markers, report, and database adapters."""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.hashing import calculate_sha256

# Add forensic-engine to sys.path
sys.path.insert(0, str(Path("forensic-engine/evidence-processing")))
sys.path.insert(0, str(Path("forensic-engine/evidence-linking")))
from processor import EvidenceProcessor
from linker import EvidenceLinker
from database.postgresql.adapter import PostgresAdapter
from database.neo4j.adapter import Neo4jAdapter


def test_evidence_processor_opencv_image():
    """Verify real OpenCV image processing extracts dimensions, sharpness, and keypoints."""
    proc = EvidenceProcessor(output_dir="data/processed/evidence")
    img_path = Path("data/evidence/workstation_photo.jpg")
    assert img_path.is_file(), "workstation_photo.jpg should exist"

    res = proc.process_image(img_path, artifact_id="TEST-IMG-01", export_processed=True)
    assert res["evidence_id"] == "TEST-IMG-01"
    assert res["width"] == 1280
    assert res["height"] == 720
    assert res["channels"] == 3
    assert res["sha256"] is not None
    assert "opencv_analysis" in res
    analysis = res["opencv_analysis"]
    assert analysis["sharpness_laplacian_variance"] > 0
    assert analysis["detected_keypoints"] > 0
    assert analysis["edge_pixels"] > 0
    assert res["processed_artifacts"]["composite_path"] is not None


def test_evidence_processor_cctv_video():
    """Verify CCTV video processing extracts video metadata and duration."""
    proc = EvidenceProcessor(output_dir="data/processed/evidence")
    vid_path = Path("data/evidence/cctv_server_room.mp4")
    assert vid_path.is_file(), "cctv_server_room.mp4 should exist"

    res = proc.process_video(vid_path, artifact_id="TEST-CCTV-01", camera_id="CAM-04")
    assert res["evidence_id"] == "TEST-CCTV-01"
    assert res["camera_id"] == "CAM-04"
    assert "video_metadata" in res
    assert res["video_metadata"]["width"] > 0
    assert res["video_metadata"]["height"] > 0
    assert res["video_metadata"]["duration_seconds"] > 0


def test_evidence_linker_traceability():
    """Verify bidirectional evidence linking and traceability."""
    sample_recon = {
        "case_id": "CASE-001",
        "events": [
            {"event_id": "EVT-001", "evidence_id": "EVD-001", "entities": ["user:employee01", "device:WORKSTATION-01"]}
        ],
        "findings": [
            {"finding_id": "FND-001", "title": "Compromised Account", "event_ids": ["EVT-001"], "evidence_ids": ["EVD-001"]}
        ],
        "graph": {"nodes": [], "edges": []},
    }

    linker = EvidenceLinker(sample_recon)
    trace = linker.trace_finding("FND-001")
    assert trace is not None
    assert trace["finding_id"] == "FND-001"
    assert trace["supporting_evidence_ids"] == ["EVD-001"]

    ev_trace = linker.trace_evidence("EVD-001")
    assert "EVT-001" in ev_trace["supported_events"]
    assert "FND-001" in ev_trace["supported_findings"]


def test_postgres_adapter_fallback():
    """Verify PostgreSQL adapter reports clean SQLite development fallback."""
    adapter = PostgresAdapter()
    status = adapter.check_connection()
    assert status["active_driver"] == "sqlite"
    assert "sqlite_local_fallback" in status["database_url_type"]
    ddl = adapter.generate_ddl_schema()
    assert "CREATE TABLE IF NOT EXISTS cases" in ddl
    assert "CREATE TABLE IF NOT EXISTS evidence" in ddl


def test_neo4j_adapter_cypher_export():
    """Verify Neo4j adapter compiles Cyber Twin nodes and edges to valid Cypher."""
    adapter = Neo4jAdapter()
    sample_graph = {
        "nodes": [{"id": "user:employee01", "type": "user", "label": "employee01"}],
        "edges": [{"source": "user:employee01", "target": "device:WORKSTATION-01", "type": "AUTHENTICATED_TO", "event_id": "EVT-001"}],
    }
    cypher = adapter.generate_cypher(sample_graph, case_id="CASE-001")
    assert "MERGE (n:CyberEntity:User {id: 'user:employee01'})" in cypher
    assert "MERGE (src)-[r:AUTHENTICATED_TO" in cypher


def test_api_list_evidence_includes_multimedia_and_physical(client: TestClient):
    """Verify API returns all 9 evidence items including photo, CCTV, physical, and report."""
    response = client.get("/cases/CASE-001/evidence")
    assert response.status_code == 200
    evidence = response.json()
    assert len(evidence) >= 9
    ev_ids = [e["evidence_id"] for e in evidence]
    assert "EVD-001" in ev_ids
    assert "EVD-006" in ev_ids  # Photo
    assert "EVD-007" in ev_ids  # CCTV
    assert "EVD-008" in ev_ids  # Physical
    assert "EVD-009" in ev_ids  # Report


def test_api_get_evidence_opencv_details(client: TestClient):
    """Verify single evidence lookup returns metadata and OpenCV results for photo."""
    response = client.get("/cases/CASE-001/evidence/EVD-006")
    assert response.status_code == 200
    item = response.json()
    assert item["evidence_id"] == "EVD-006"
    assert item["type"] == "photo_evidence"
    assert item["location"] is not None
    assert item["metadata_json"] is not None


def test_api_evidence_3d_markers(client: TestClient):
    """Verify 3D evidence markers API returns spatial coordinates and scene zones."""
    response = client.get("/cases/CASE-001/evidence/markers/3d")
    assert response.status_code == 200
    markers = response.json()
    assert len(markers) >= 9
    m_001 = next(m for m in markers if m["evidence_id"] == "EVD-001")
    assert "position" in m_001
    assert len(m_001["position"]) == 3
    assert m_001["zone"] is not None


def test_api_forensic_report(client: TestClient):
    """Verify comprehensive forensic report API compiles executive summary, evidence, and findings."""
    response = client.get("/cases/CASE-001/reconstruction/report")
    assert response.status_code == 200
    rep = response.json()
    assert rep["case_id"] == "CASE-001"
    assert "executive_summary" in rep
    assert len(rep["evidence_inventory"]) >= 9
    assert len(rep["findings"]) >= 3
    assert len(rep["remediation_actions"]) >= 5


def test_api_database_status_and_neo4j_export(client: TestClient):
    """Verify database status diagnostic and Cypher export endpoints."""
    status_resp = client.get("/cases/CASE-001/reconstruction/database/status")
    assert status_resp.status_code == 200
    db_status = status_resp.json()
    assert "relational_storage" in db_status
    assert "graph_database" in db_status

    export_resp = client.post("/cases/CASE-001/reconstruction/database/export-neo4j")
    assert export_resp.status_code == 200
    export_data = export_resp.json()
    assert "cypher_export_path" in export_data
    assert "cypher_statements_preview" in export_data


def test_api_3d_scene_metadata(client: TestClient):
    """Verify 3D scene metadata API returns GLB asset URL and investigation zones."""
    response = client.get("/cases/CASE-001/reconstruction/3d-scene")
    assert response.status_code == 200
    scene = response.json()
    assert scene["case_id"] == "CASE-001"
    assert "/models/investigation_scene.glb" in scene["model_asset_url"]
    assert len(scene["zones"]) >= 3
    assert len(scene["markers"]) >= 9
