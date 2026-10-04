def test_list_case_events(client):
    response = client.get("/cases/CASE-001/events")
    assert response.status_code == 200
    events = response.json()
    assert isinstance(events, list)
    assert len(events) >= 4

    evt_ids = [e["event_id"] for e in events]
    assert "EVT-001" in evt_ids
    assert "EVT-002" in evt_ids

    # Verify event structure
    evt_1 = next(e for e in events if e["event_id"] == "EVT-001")
    assert evt_1["event_type"] == "LOGIN_SUCCESS"
    assert evt_1["user"] == "employee01"
    assert evt_1["device"] == "WS-101"
    assert evt_1["source_ip"] == "185.220.101.5"
    assert evt_1["evidence_id"] == "EVD-001"


def test_list_case_events_nonexistent_case(client):
    response = client.get("/cases/CASE-999999/events")
    assert response.status_code == 404


def test_create_case_event(client):
    payload = {
        "event_id": "EVT-TEST-005",
        "timestamp": "2026-10-04T10:14:00",
        "event_type": "DNS_QUERY",
        "user": "employee01",
        "device": "WS-101",
        "source_ip": "192.168.10.45",
        "evidence_id": "EVD-004",
    }
    response = client.post("/cases/CASE-001/events", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["event_id"] == "EVT-TEST-005"
    assert data["case_id"] == "CASE-001"
    assert data["event_type"] == "DNS_QUERY"
    assert data["evidence_id"] == "EVD-004"


def test_create_case_event_duplicate(client):
    payload = {
        "event_id": "EVT-001",
        "timestamp": "2026-10-04T10:01:12",
        "event_type": "LOGIN_SUCCESS",
    }
    response = client.post("/cases/CASE-001/events", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
