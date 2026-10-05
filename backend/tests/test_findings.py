def test_list_case_findings(client):
    response = client.get("/cases/CASE-001/findings")
    assert response.status_code == 200
    findings = response.json()
    assert isinstance(findings, list)
    assert len(findings) >= 2

    fnd_1 = next(f for f in findings if f["finding_id"] == "FND-001")
    assert fnd_1["title"] == "Possible Account Compromise"
    assert fnd_1["severity"] == "HIGH"
    assert fnd_1["confidence"] == 0.91
    assert "EVT-001" in fnd_1["event_ids"]
    assert "EVD-001" in fnd_1["evidence_ids"]


def test_list_case_findings_nonexistent_case(client):
    response = client.get("/cases/CASE-999999/findings")
    assert response.status_code == 404


def test_create_case_finding(client):
    payload = {
        "finding_id": "FND-TEST-003",
        "title": "C2 Domain Lookup",
        "description": "Workstation resolved known command and control infrastructure.",
        "severity": "CRITICAL",
        "confidence": 0.98,
        "event_ids": ["EVT-004"],
        "evidence_ids": ["EVD-004"],
    }
    response = client.post("/cases/CASE-001/findings", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["finding_id"] == "FND-TEST-003"
    assert data["case_id"] == "CASE-001"
    assert data["severity"] == "CRITICAL"
    assert data["confidence"] == 0.98
    assert data["event_ids"] == ["EVT-004"]
    assert data["evidence_ids"] == ["EVD-004"]


def test_create_case_finding_duplicate(client):
    payload = {
        "finding_id": "FND-001",
        "title": "Duplicate",
        "description": "Duplicate description",
        "severity": "LOW",
        "confidence": 0.5,
        "event_ids": [],
        "evidence_ids": [],
    }
    response = client.post("/cases/CASE-001/findings", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]
