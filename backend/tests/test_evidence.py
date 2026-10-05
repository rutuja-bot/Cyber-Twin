from app.services.hashing import calculate_sha256


def test_list_case_evidence(client):
    response = client.get("/cases/CASE-001/evidence")
    assert response.status_code == 200
    evidence_list = response.json()
    assert isinstance(evidence_list, list)
    assert len(evidence_list) >= 4

    evd_ids = [e["evidence_id"] for e in evidence_list]
    assert "EVD-001" in evd_ids
    assert "EVD-002" in evd_ids


def test_list_case_evidence_nonexistent_case(client):
    response = client.get("/cases/CASE-999999/evidence")
    assert response.status_code == 404


def test_create_evidence_with_content(client):
    raw_content = "2026-10-04 10:15:22 security.log: Kerberos pre-auth failure for svc_sql"
    expected_hash = calculate_sha256(raw_content)

    payload = {
        "evidence_id": "EVD-TEST-099",
        "type": "security_event_log",
        "source": "security.evtx",
        "timestamp": "2026-10-04T10:15:22",
        "content": raw_content,
    }
    response = client.post("/cases/CASE-001/evidence", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["evidence_id"] == "EVD-TEST-099"
    assert data["case_id"] == "CASE-001"
    assert data["hash"] == expected_hash

    # Verify presence in list
    list_res = client.get("/cases/CASE-001/evidence")
    assert any(e["evidence_id"] == "EVD-TEST-099" for e in list_res.json())


def test_create_evidence_with_explicit_hash(client):
    custom_hash = "a" * 64
    payload = {
        "evidence_id": "EVD-TEST-100",
        "type": "pcap",
        "source": "capture.pcap",
        "timestamp": "2026-10-04T10:20:00",
        "hash": custom_hash,
    }
    response = client.post("/cases/CASE-001/evidence", json=payload)
    assert response.status_code == 201
    assert response.json()["hash"] == custom_hash


def test_create_evidence_duplicate_id(client):
    payload = {
        "evidence_id": "EVD-001",
        "type": "auth_log",
        "source": "auth.log",
    }
    response = client.post("/cases/CASE-001/evidence", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_create_evidence_nonexistent_case(client):
    payload = {
        "evidence_id": "EVD-FAIL",
        "type": "auth_log",
        "source": "auth.log",
    }
    response = client.post("/cases/CASE-NONEXISTENT/evidence", json=payload)
    assert response.status_code == 404
