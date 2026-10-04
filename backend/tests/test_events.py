def test_list_case_events(client):
    response = client.get("/cases/CASE-001/events")
    assert response.status_code == 200
    events = response.json()
    assert isinstance(events, list)
    assert len(events) >= 4

    evt_ids = [e["event_id"] for e in events]
    assert "EVT-001" in evt_ids
    assert "EVT-002" in evt_ids

    # Verify event structure conforms to v1 Event contract
    evt_1 = next(e for e in events if e["event_id"] == "EVT-001")
    assert evt_1 == {
        "event_id": "EVT-001",
        "case_id": "CASE-001",
        "timestamp": "2026-10-04T10:15:00",
        "event_type": "suspicious_login",
        "user": "employee01",
        "device": "WORKSTATION-01",
        "source_ip": "192.168.1.20",
        "destination_ip": None,
        "file": None,
        "server": None,
        "evidence_id": "EVD-001",
    }


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
        "destination_ip": "8.8.8.8",
        "file": None,
        "server": None,
        "evidence_id": "EVD-004",
    }
    response = client.post("/cases/CASE-001/events", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["event_id"] == "EVT-TEST-005"
    assert data["case_id"] == "CASE-001"
    assert data["event_type"] == "DNS_QUERY"
    assert data["destination_ip"] == "8.8.8.8"
    assert data["file"] is None
    assert data["server"] is None
    assert data["evidence_id"] == "EVD-004"


def test_create_case_event_duplicate(client):
    payload = {
        "event_id": "EVT-001",
        "timestamp": "2026-10-04T10:15:00",
        "event_type": "suspicious_login",
    }
    response = client.post("/cases/CASE-001/events", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_suspicious_login_v1_contract_example(client):
    """Test creating and retrieving an event matching the exact finalized v1 contract example."""
    payload = {
        "event_id": "EVT-TEST-SUSP-LOGIN",
        "timestamp": "2026-10-04T10:15:00",
        "event_type": "suspicious_login",
        "user": "employee01",
        "device": "WORKSTATION-01",
        "source_ip": "192.168.1.20",
        "destination_ip": None,
        "file": None,
        "server": None,
        "evidence_id": "EVD-001",
    }
    create_res = client.post("/cases/CASE-001/events", json=payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    assert created_data == {
        "event_id": "EVT-TEST-SUSP-LOGIN",
        "case_id": "CASE-001",
        "timestamp": "2026-10-04T10:15:00",
        "event_type": "suspicious_login",
        "user": "employee01",
        "device": "WORKSTATION-01",
        "source_ip": "192.168.1.20",
        "destination_ip": None,
        "file": None,
        "server": None,
        "evidence_id": "EVD-001",
    }

    # Verify retrieval via GET /cases/{case_id}/events
    get_res = client.get("/cases/CASE-001/events")
    assert get_res.status_code == 200
    retrieved_events = get_res.json()
    matching_evt = next((e for e in retrieved_events if e["event_id"] == "EVT-TEST-SUSP-LOGIN"), None)
    assert matching_evt is not None
    assert matching_evt == created_data


def test_create_event_with_all_optional_fields_populated(client):
    """Test an event with destination_ip, file, and server all populated."""
    payload = {
        "event_id": "EVT-TEST-FULL-001",
        "timestamp": "2026-10-04T10:30:00",
        "event_type": "file_exfiltration",
        "user": "attacker",
        "device": "WORKSTATION-01",
        "source_ip": "192.168.1.20",
        "destination_ip": "203.0.113.50",
        "file": "passwords.kdbx",
        "server": "SRV-DATA-STORAGE",
        "evidence_id": "EVD-004",
    }
    response = client.post("/cases/CASE-001/events", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["destination_ip"] == "203.0.113.50"
    assert data["file"] == "passwords.kdbx"
    assert data["server"] == "SRV-DATA-STORAGE"
