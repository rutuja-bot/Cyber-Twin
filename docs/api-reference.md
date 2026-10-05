# API Reference

**Project:** Cyber-Twin — Digital Forensics & Incident Reconstruction Platform  
**Service:** FastAPI Backend REST Service  
**Base URL:** `http://127.0.0.1:8000`  
**Interactive Docs:** `http://127.0.0.1:8000/docs` (Swagger UI) / `http://127.0.0.1:8000/redoc`  

---

## 1. Overview

The Cyber-Twin backend provides 16 REST endpoints that serve case metadata, digital evidence records, normalized events, forensic findings, and graph/timeline reconstructions. The React investigation workbench queries these endpoints to populate the 2D topological graph, chronological timeline, 3D Cyber Twin layer, and incident replay engine.

---

## 2. API Endpoint Summary Table

| Method | Endpoint | Purpose |
|:--- |:--- |:--- |
| `GET` | `/health` | Service health check and database status confirmation |
| `GET` | `/cases` | List all registered forensic investigation cases |
| `POST` | `/cases` | Create a new forensic investigation case |
| `GET` | `/cases/{case_id}` | Retrieve details of a specific investigation case |
| `GET` | `/cases/{case_id}/evidence` | List all digital evidence artifacts registered under a case |
| `POST` | `/cases/{case_id}/evidence` | Register a new digital evidence artifact with SHA-256 calculation |
| `GET` | `/cases/{case_id}/events` | List normalized events in chronological order for a case |
| `POST` | `/cases/{case_id}/events` | Record a single normalized event under a case |
| `POST` | `/cases/{case_id}/events/bulk` | Bulk import an array of normalized events |
| `POST` | `/cases/{case_id}/events/import-processed` | Import normalized events directly from a processed JSON file |
| `GET` | `/cases/{case_id}/findings` | Retrieve correlated forensic findings with evidence citations |
| `POST` | `/cases/{case_id}/findings` | Record a verified forensic finding |
| `GET` | `/cases/{case_id}/reconstruction` | Retrieve full reconstructed incident payload (graph, timeline, attack chain) |
| `GET` | `/cases/{case_id}/reconstruction/graph` | Retrieve Cytoscape-compatible 2D entity-relationship topology |
| `GET` | `/cases/{case_id}/reconstruction/timeline` | Retrieve chronological attack stages with MITRE classifications |
| `POST` | `/cases/{case_id}/reconstruction/import-processed` | Import an incident reconstruction JSON artifact into the database |

---

## 3. Endpoint Specifications

### Health & System Status

#### `GET /health`
* **Purpose:** Confirms service availability.
* **Response (200 OK):**
  ```json
  { "status": "ok" }
  ```

---

### Cases API

#### `GET /cases`
* **Purpose:** Retrieves all forensic cases in the database.
* **Response (200 OK):** Array of case objects (`case_id`, `title`, `description`, `status`).

#### `POST /cases`
* **Purpose:** Creates a new forensic case.
* **Request Body:**
  ```json
  {
    "case_id": "CASE-002",
    "title": "Ransomware Triage",
    "description": "Lateral SMB spread investigation",
    "status": "open"
  }
  ```
* **Response (201 Created):** Created case record.

#### `GET /cases/{case_id}`
* **Purpose:** Retrieves a single case record by its identifier.
* **Path Parameter:** `case_id` (string, e.g., `"CASE-001"`).
* **Response (200 OK):** Case details or `404 Not Found`.

---

### Evidence API

#### `GET /cases/{case_id}/evidence`
* **Purpose:** Retrieves all evidence artifacts associated with a case.
* **Path Parameter:** `case_id` (string).
* **Response (200 OK):** Array of evidence records with cryptographic hashes:
  ```json
  [
    {
      "evidence_id": "EVD-001",
      "case_id": "CASE-001",
      "type": "auth_log",
      "source": "data/raw/auth.log",
      "timestamp": "2026-10-04T10:15:00",
      "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
  ]
  ```

#### `POST /cases/{case_id}/evidence`
* **Purpose:** Registers an evidence artifact and calculates its SHA-256 digest.
* **Path Parameter:** `case_id` (string).
* **Request Body:** Evidence metadata including `type`, `source`, and raw `content` (or precomputed `hash`).
* **Response (201 Created):** Stored evidence record containing the computed hash.

---

### Events API

#### `GET /cases/{case_id}/events`
* **Purpose:** Retrieves normalized timeline events for a case in chronological order.
* **Path Parameter:** `case_id` (string).
* **Response (200 OK):** Array of canonical 11-field events:
  ```json
  [
    {
      "event_id": "EVT-001",
      "case_id": "CASE-001",
      "timestamp": "2026-10-04T10:15:00",
      "event_type": "suspicious_login",
      "user": "employee01",
      "device": "WORKSTATION-01",
      "source_ip": "192.168.1.20",
      "destination_ip": null,
      "file": null,
      "server": null,
      "evidence_id": "EVD-001"
    }
  ]
  ```

#### `POST /cases/{case_id}/events`
* **Purpose:** Inserts a single normalized event under a case.
* **Request Body:** 11-field event payload (`EventCreate`).
* **Response (201 Created):** Persisted event record.

#### `POST /cases/{case_id}/events/bulk`
* **Purpose:** Bulk-imports an array of normalized events.
* **Request Body:** List of `EventCreate` objects.
* **Response (201 Created):** List of persisted event records.

#### `POST /cases/{case_id}/events/import-processed`
* **Purpose:** Imports events directly from a processed JSON file on disk.
* **Query Parameter:** `file_path` (optional, defaults to `data/processed/normalized_events.json`).
* **Response (201 Created):** List of persisted event records.

---

### Findings API

#### `GET /cases/{case_id}/findings`
* **Purpose:** Retrieves correlated forensic findings.
* **Response (200 OK):** Array of findings linking to corroborating event and evidence IDs:
  ```json
  [
    {
      "finding_id": "FND-001",
      "case_id": "CASE-001",
      "title": "Credential Compromise & Unauthorized Initial Access",
      "description": "Suspicious login on WORKSTATION-01 via compromised credentials.",
      "severity": "CRITICAL",
      "confidence": 0.95,
      "event_ids": ["EVT-001"],
      "evidence_ids": ["EVD-001"]
    }
  ]
  ```

#### `POST /cases/{case_id}/findings`
* **Purpose:** Records a verified forensic finding.
* **Request Body:** Finding payload (`title`, `severity`, `confidence`, `event_ids`, `evidence_ids`).
* **Response (201 Created):** Persisted finding record.

---

### Incident Reconstruction & Graph API

#### `GET /cases/{case_id}/reconstruction`
* **Purpose:** Primary endpoint consumed by the React workbench to load the complete reconstructed incident story.
* **Response (200 OK):**
  ```json
  {
    "case_id": "CASE-001",
    "title": "Unauthorized Lateral Movement and Data Exfiltration",
    "status": "reconstructed",
    "summary": "Multi-stage attack involving credential compromise, lateral pivot, and data exfiltration.",
    "total_events": 6,
    "timeline": [ ... ],
    "graph": { "nodes": [ ... ], "edges": [ ... ] },
    "attack_progression": [ ... ],
    "findings": [ ... ],
    "events": [ ... ]
  }
  ```

#### `GET /cases/{case_id}/reconstruction/graph`
* **Purpose:** Retrieves the entity-relationship topology graph for 2D Cytoscape rendering.
* **Response (200 OK):**
  ```json
  {
    "nodes": [
      {
        "id": "device:WORKSTATION-01",
        "type": "device",
        "label": "WORKSTATION-01",
        "first_seen": "2026-10-04T10:15:00",
        "last_seen": "2026-10-04T10:25:00",
        "properties": { "hostname": "WORKSTATION-01" }
      }
    ],
    "edges": [
      {
        "relationship_id": "REL-001",
        "source": "user:employee01",
        "target": "device:WORKSTATION-01",
        "type": "AUTHENTICATED_TO",
        "event_id": "EVT-001",
        "evidence_ids": ["EVD-001"],
        "timestamp": "2026-10-04T10:15:00"
      }
    ]
  }
  ```

#### `GET /cases/{case_id}/reconstruction/timeline`
* **Purpose:** Retrieves the sequential attack timeline for the timeline view.
* **Response (200 OK):** Array of attack stages with MITRE ATT&CK classifications:
  ```json
  [
    {
      "timeline_event_id": "TL-001",
      "event_id": "EVT-001",
      "sequence": 1,
      "timestamp": "2026-10-04T10:15:00",
      "stage": "Initial Access",
      "technique": "T1078 - Valid Accounts",
      "description": "Compromised credential login from internal workstation.",
      "evidence_id": "EVD-001"
    }
  ]
  ```

#### `POST /cases/{case_id}/reconstruction/import-processed`
* **Purpose:** Ingests an `incident_reconstruction.json` artifact into the backend cache and database.
* **Query Parameter:** `file_path` (optional, defaults to `data/processed/incident_reconstruction.json`).
* **Response (201 Created):** Loaded and cached incident reconstruction payload.

