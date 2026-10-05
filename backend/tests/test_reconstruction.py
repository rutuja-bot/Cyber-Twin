"""Tests for Incident Reconstruction, Cyber Twin Graph, and Timeline API endpoints."""

from pathlib import Path
from app.services.forensic_loader import (
    load_incident_reconstruction_file,
    ingest_reconstructed_incident,
    get_reconstructed_incident,
)


def test_load_incident_reconstruction_file():
    """Verify that the forensic engine's incident_reconstruction.json can be loaded by the loader."""
    path = Path("data/processed/incident_reconstruction.json")
    assert path.is_file(), "incident_reconstruction.json must exist in data/processed"

    data = load_incident_reconstruction_file(path)
    assert data["case_id"] == "CASE-001"
    assert data["status"] == "reconstructed"
    assert len(data["timeline"]) == 6
    assert len(data["graph"]["nodes"]) >= 5
    assert len(data["graph"]["edges"]) >= 5
    assert len(data["attack_progression"]) == 6
    assert len(data["findings"]) == 3
    assert len(data["events"]) == 6


def test_get_case_reconstruction_success(client):
    """Verify GET /cases/{case_id}/reconstruction returns full incident reconstruction payload."""
    response = client.get("/cases/CASE-001/reconstruction")
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "CASE-001"
    assert data["status"] == "reconstructed"
    assert "timeline" in data
    assert "graph" in data
    assert "attack_progression" in data
    assert len(data["timeline"]) == 6
    assert len(data["graph"]["nodes"]) >= 5


def test_get_case_reconstruction_graph(client):
    """Verify GET /cases/{case_id}/reconstruction/graph returns nodes and edges for Cyber Twin graph."""
    response = client.get("/cases/CASE-001/reconstruction/graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data

    node_ids = {n["id"] for n in data["nodes"]}
    assert "user:employee01" in node_ids
    assert "device:WORKSTATION-01" in node_ids
    assert "ip:192.168.1.20" in node_ids

    edge_types = {e["type"] for e in data["edges"]}
    assert "AUTHENTICATED_TO" in edge_types
    assert "EXECUTED" in edge_types
    assert "EXFILTRATED_TO" in edge_types


def test_get_case_reconstruction_timeline(client):
    """Verify GET /cases/{case_id}/reconstruction/timeline returns chronological attack progression."""
    response = client.get("/cases/CASE-001/reconstruction/timeline")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 6

    # Verify sequential ordering
    sequences = [item["sequence"] for item in items]
    assert sequences == [1, 2, 3, 4, 5, 6]

    stages = [item["stage"] for item in items]
    assert stages[0] == "Initial Access"
    assert stages[-1] == "Exfiltration"


def test_import_processed_reconstruction_endpoint(client):

    """Verify POST /cases/{case_id}/reconstruction/import-processed ingests events and findings."""
    response = client.post("/cases/CASE-001/reconstruction/import-processed")
    assert response.status_code == 201
    data = response.json()
    assert data["case_id"] == "CASE-001"
    assert data["total_events"] == 6

    # Verify findings are now present in findings endpoint
    findings_resp = client.get("/cases/CASE-001/findings")
    assert findings_resp.status_code == 200
    findings = findings_resp.json()
    finding_ids = {f["finding_id"] for f in findings}
    assert "FND-001" in finding_ids
    assert "FND-002" in finding_ids
    assert "FND-003" in finding_ids


def test_get_reconstruction_case_not_found(client):
    """Verify 404 response when querying non-existent case."""
    response = client.get("/cases/CASE-NONEXISTENT/reconstruction")
    assert response.status_code == 404
