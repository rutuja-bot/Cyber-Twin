"""Tests verifying integration of Forensic Engine Milestone 1 normalized output with the Backend."""

from pathlib import Path
from app.services.forensic_loader import load_normalized_events_file, ingest_normalized_events


PROCESSED_FILE = Path("data/processed/normalized_events.json")


def test_load_normalized_events_file():
    """Verify loading Person 2's actual normalized_events.json file."""
    assert PROCESSED_FILE.is_file(), "data/processed/normalized_events.json must exist"
    events = load_normalized_events_file(PROCESSED_FILE)
    assert isinstance(events, list)
    assert len(events) == 6

    # Verify first and last events from Person 2's output
    assert events[0]["event_id"] == "EVT-001"
    assert events[0]["event_type"] == "suspicious_login"
    assert events[0]["user"] == "employee01"
    assert events[0]["evidence_id"] == "EVD-001"

    assert events[5]["event_id"] == "EVT-006"
    assert events[5]["event_type"] == "outbound_data_transfer"
    assert events[5]["destination_ip"] == "198.51.100.24"
    assert events[5]["evidence_id"] == "EVD-005"


def test_api_bulk_import_forensic_events(client):
    """Test importing Person 2's normalized events via the POST /bulk API endpoint."""
    # Create an isolated case for bulk import
    case_payload = {
        "case_id": "CASE-BULK-001",
        "title": "Forensic Engine Integration Test Case",
        "description": "Verifying bulk import of Person 2 forensic events",
        "status": "open",
    }
    case_res = client.post("/cases", json=case_payload)
    assert case_res.status_code == 201

    events_data = load_normalized_events_file(PROCESSED_FILE)
    # Post bulk events
    bulk_res = client.post("/cases/CASE-BULK-001/events/bulk", json=events_data)
    assert bulk_res.status_code == 201
    persisted = bulk_res.json()
    assert len(persisted) == 6

    # Verify via standard GET /cases/{case_id}/events endpoint
    get_res = client.get("/cases/CASE-BULK-001/events")
    assert get_res.status_code == 200
    retrieved = get_res.json()
    assert len(retrieved) == 6

    # Verify chronological ordering and event types
    event_types = [e["event_type"] for e in retrieved]
    assert event_types == [
        "suspicious_login",
        "suspicious_process_spawn",
        "internal_server_connection",
        "sensitive_file_access",
        "suspicious_network_connection",
        "outbound_data_transfer",
    ]


def test_api_import_processed_file(client):
    """Test importing directly from data/processed/normalized_events.json via API."""
    case_payload = {
        "case_id": "CASE-FILE-001",
        "title": "File-based Import Test Case",
        "status": "open",
    }
    client.post("/cases", json=case_payload)

    import_res = client.post("/cases/CASE-FILE-001/events/import-processed")
    assert import_res.status_code == 201
    events = import_res.json()
    assert len(events) == 6
    assert events[0]["case_id"] == "CASE-FILE-001"


def test_seeded_events_match_forensic_output(client):
    """Verify that seeded events in CASE-001 match Person 2's complete incident chain."""
    response = client.get("/cases/CASE-001/events")
    assert response.status_code == 200
    events = response.json()
    assert len(events) >= 6

    # Verify all 6 events are present in CASE-001
    evt_ids = [e["event_id"] for e in events]
    for expected_id in ["EVT-001", "EVT-002", "EVT-003", "EVT-004", "EVT-005", "EVT-006"]:
        assert expected_id in evt_ids

    # Verify all 5 evidence items are present and linked
    evd_res = client.get("/cases/CASE-001/evidence")
    assert evd_res.status_code == 200
    evidence_ids = {e["evidence_id"] for e in evd_res.json()}
    assert {"EVD-001", "EVD-002", "EVD-003", "EVD-004", "EVD-005"}.issubset(evidence_ids)
