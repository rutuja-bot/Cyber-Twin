def test_list_cases(client):
    response = client.get("/cases")
    assert response.status_code == 200
    cases = response.json()
    assert isinstance(cases, list)
    assert len(cases) >= 1
    assert any(c["case_id"] == "CASE-001" for c in cases)


def test_get_case_success(client):
    response = client.get("/cases/CASE-001")
    assert response.status_code == 200
    data = response.json()
    assert data["case_id"] == "CASE-001"
    assert "Suspicious Employee Account Activity" in data["title"]
    assert data["status"] == "open"


def test_get_case_not_found(client):
    response = client.get("/cases/CASE-999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Case 'CASE-999999' not found"


def test_create_case_success(client):
    payload = {
        "case_id": "CASE-TEST-002",
        "title": "Ransomware Lateral Movement Test",
        "description": "Simulation test case for ransomware telemetry",
        "status": "open",
    }
    response = client.post("/cases", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["case_id"] == "CASE-TEST-002"
    assert data["title"] == payload["title"]
    assert data["status"] == "open"

    # Verify retrieval
    get_res = client.get("/cases/CASE-TEST-002")
    assert get_res.status_code == 200
    assert get_res.json()["case_id"] == "CASE-TEST-002"


def test_create_case_duplicate(client):
    payload = {
        "case_id": "CASE-001",
        "title": "Duplicate Case Attempt",
        "description": "This should fail",
        "status": "open",
    }
    response = client.post("/cases", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
