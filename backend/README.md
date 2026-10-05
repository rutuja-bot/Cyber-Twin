# Cyber Twin — Backend Foundation

## Overview
The Cyber Twin backend provides the core application services and RESTful API foundation for the Digital Forensics Investigation System. It manages forensic investigation cases, tracks digital evidence artifacts with cryptographic SHA-256 integrity, serves normalized chronological cyber events, and exposes correlated findings linked back to supporting evidence.

---

## Technology Stack
- **Language**: Python 3.10+
- **Framework**: FastAPI (high performance, asynchronous web framework)
- **Data Validation & Schemas**: Pydantic v2
- **ORM / Database Layer**: SQLAlchemy 2.0 (PostgreSQL in production/staging, SQLite for local testing)
- **Cryptographic Hashing**: SHA-256 via Python `hashlib`
- **Testing**: Pytest & FastAPI `TestClient`

---

## Project Structure

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     # FastAPI application entrypoint and lifespan hooks
│   ├── models/                     # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── case.py                 # CaseModel
│   │   ├── evidence.py             # EvidenceModel
│   │   ├── event.py                # EventModel
│   │   └── finding.py              # FindingModel
│   ├── schemas/                    # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── case.py
│   │   ├── evidence.py
│   │   ├── event.py
│   │   └── finding.py
│   ├── routes/                     # FastAPI route handlers
│   │   ├── __init__.py
│   │   ├── cases.py                # /cases endpoints
│   │   ├── evidence.py             # /cases/{case_id}/evidence endpoints
│   │   ├── events.py               # /cases/{case_id}/events endpoints
│   │   └── findings.py             # /cases/{case_id}/findings endpoints
│   ├── services/                   # Core business logic services
│   │   ├── __init__.py
│   │   └── hashing.py              # SHA-256 evidence integrity hashing service
│   └── database/                   # Database engine and session configuration
│       ├── __init__.py
│       ├── connection.py           # SQLAlchemy engine, session maker, get_db dependency
│       └── seed_data.py            # Simulated cyber incident demo dataset
├── tests/                          # Automated pytest suite
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_cases.py
│   ├── test_evidence.py
│   ├── test_events.py
│   ├── test_findings.py
│   ├── test_hashing.py
│   └── test_health.py
├── .env.example                    # Environment variable configuration template
├── requirements.txt                # Python package dependencies
└── README.md
```

---

## Getting Started

### 1. Create and Activate a Virtual Environment
From the repository root or `backend/` directory:

```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 3. Configure Database Connection (`DATABASE_URL`)
Copy `.env.example` to `.env`:
```bash
cp backend/.env.example backend/.env
```
Set `DATABASE_URL` in your environment or `.env`:
- **Default (Local SQLite)**: `sqlite:///./cyber_twin.db`
- **PostgreSQL**: `postgresql://username:password@localhost:5432/cyber_twin_db`

Example environment export:
```powershell
$env:DATABASE_URL = "postgresql://user:password@localhost:5432/cyber_twin_db"
```

### 4. Run the FastAPI Application
From the repository root:
```bash
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```
Or from inside the `backend/` directory:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Interactive API Documentation (Swagger / OpenAPI)

Once the backend is running, access interactive documentation:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## Core Implemented Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status check |
| `POST` | `/cases` | Register a new forensic investigation case |
| `GET` | `/cases` | List all investigation cases |
| `GET` | `/cases/{case_id}` | Retrieve details of a specific case |
| `POST` | `/cases/{case_id}/evidence` | Ingest digital evidence with SHA-256 calculation |
| `GET` | `/cases/{case_id}/evidence` | List all evidence artifacts for a case |
| `GET` | `/cases/{case_id}/events` | List normalized chronological incident events |
| `POST` | `/cases/{case_id}/events` | Record a normalized event under a case |
| `GET` | `/cases/{case_id}/findings` | List evidence-linked findings for a case |
| `POST` | `/cases/{case_id}/findings` | Register a verified forensic finding |

---

## Running the Automated Test Suite

Run the full pytest suite from the repository root:
```bash
python -m pytest backend/tests -v
```
All tests execute against an isolated in-memory database to ensure zero external dependency requirements during continuous integration and testing.
