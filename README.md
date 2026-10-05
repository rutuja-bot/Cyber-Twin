# Cyber-Twin
**Cyber Twin — Interactive Cyber Incident Reconstruction & Replay for Digital Forensic Investigation**

*She Solves 3.0 (Round 2) — Prototype Submission*
*Team:* **Let Her Code**

---

## 1. Executive Summary & Problem Statement

Digital forensic investigators face critical friction when analyzing enterprise cyber incidents:
- **Fragmented Cybersecurity Data**: Security event data is scattered across isolated log repositories (authentication logs, endpoint activity, server audits, firewall traffic, file systems).
- **Manual Correlation Overhead**: Security Operations Center (SOC) teams spend hours manually stitching timestamps, IP addresses, and process trees across dissimilar log formats.
- **Lack of Interactive Temporal Replay**: Static flat logs fail to convey the dynamic, spatial, and chronological progression of an intrusion campaign.

**Cyber Twin** transforms fragmented digital forensic logs into an interactive, spatial, and temporal digital twin of the cyber environment. Investigators can observe the attack unfolding step-by-step, inspect correlated entities, trace evidence chains of custody, and verify forensic conclusions with cryptographic certainty.

---

## 2. Core Solution Pillars (Round 1 PPT Alignment)

1. **Incident Reconstruction**:
   - Ingestion and parsing of heterogeneous enterprise logs (`auth.log`, `endpoint.log`, `server.log`, `file_access.log`, `firewall.log`).
   - Normalization into standardized v1 Event JSON schema with UTC ISO-8601 timestamps.
   - Deterministic correlation into a STIX 2.1-compliant multi-entity knowledge graph.

2. **Interactive Investigation**:
   - **Chronological Timeline**: Millisecond-accurate event progression mapped to MITRE ATT&CK tactics and techniques.
   - **Topological Relationship Graph**: Cytoscape.js interactive network graph mapping users, workstations, servers, files, and IPs.
   - **Bidirectional Timeline ↔ Graph Synchronization**: Selecting any timeline event isolates active nodes and edges in the graph; inspecting graph nodes filters timeline activity.
   - **3D Cyber Environment**: Three.js spatial infrastructure stage representing enterprise hosts, internal servers, network perimeter, and exfiltration corridors.
   - **Temporal Attack Replay**: VCR-style playback engine with variable speed (0.5x–4x), step controls, scrubber, and dynamic state-change descriptions.

3. **Evidence-Linked Analysis**:
   - **Deterministic Evidence Traceability**: Every event, node, edge, and finding maintains explicit linkage to raw source evidence artifacts (`EVD-001` to `EVD-005`).
   - **Cryptographic Chain of Custody**: SHA-256 integrity hash verification prevents evidence tampering.
   - **Corroborated Findings**: Automated detection of attack phases with confidence scoring and MITRE ATT&CK tactic/technique attribution.
   - **Audit-Ready Reporting**: Exportable forensic findings report with executive summaries and tactical remediation guidance.

---

## Prototype Screenshots

> [!NOTE]
> Prototype screenshots and UI demonstration captures should be placed in `docs/screenshots/`. Actual UI captures of the workbench, 2D Cytoscape graph, and 3D Cyber Twin should be added prior to final hackathon evaluation.

| View | Description | Screenshot Location |
|---|---|---|
| **Investigation Workbench** | Synchronized investigation dashboard with case selector and incident metrics | `docs/screenshots/workbench.png` *(pending capture)* |
| **2D Relationship Graph** | Force-directed entity-relationship network with attack-path isolation | `docs/screenshots/relationship-graph.png` *(pending capture)* |
| **Chronological Timeline** | MITRE ATT&CK classified event progression and tactical badges | `docs/screenshots/timeline.png` *(pending capture)* |
| **3D Cyber Twin Replay** | Three.js spatial enterprise zone visualization and threat replay | `docs/screenshots/3d-cyber-twin.png` *(pending capture)* |

---

## 3. Technology Stack & Implementation Architecture

| Layer | Prototype Implementation | Scalable Production Target |
|---|---|---|
| **Frontend UI & Replay** | React 18, Vite, TypeScript, Tailwind/Cyber CSS, Lucide React | React 18 + Next.js SSR / Electron Desktop App |
| **2D Graph Visualization** | Cytoscape.js (COSE layout, interactive node/edge inspection) | Cytoscape.js + Neo4j Bloom |
| **3D Cyber Environment** | Three.js (Spatial infrastructure representation, packet animations) | Three.js WebGL / WebGPU |
| **Backend REST APIs** | FastAPI, Python 3.12, Pydantic v2, Uvicorn | FastAPI, Docker Container, Kubernetes |
| **Database & Models** | SQLite (SQLAlchemy ORM, in-memory & file storage) | PostgreSQL (Relational) + Neo4j (Graph DB) |
| **Forensic Engine** | Python 3 regex & structured log parsers, STIX 2.1 graph correlation | Apache Kafka / Flink streaming + STIX 2.1 pipeline |
| **Evidence Integrity** | SHA-256 cryptographic hashing & line-level evidence anchors | SHA-256 + Immutable Ledger / WORM storage |

*Note on Physical vs. Digital Forensics:*
The Cyber Twin prototype is strictly focused on **enterprise digital cybersecurity log forensics**. References in early exploratory concepts to physical crime scenes, CCTV, Blender, or OpenCV are part of future multi-modal research roadmap initiatives, while the active prototype implements pure digital log parsing, network topology, and 3D cyber infrastructure replay.

---

## 4. Canonical Demonstration Case (`CASE-001`)

The prototype ships with a verified end-to-end multi-stage intrusion dataset:
- **Case Title**: Unauthorized Access and Exfiltration Incident (`CASE-001`)
- **Evidence Sources (5)**: `auth.log` (`EVD-001`), `endpoint.log` (`EVD-002`), `server.log` (`EVD-003`), `file_access.log` (`EVD-004`), `firewall.log` (`EVD-005`)
- **Normalized Events (6)**:
  1. `EVT-001` (10:15:00): Compromised account login (`employee01` from `192.168.1.20` to `WORKSTATION-01`)
  2. `EVT-002` (10:18:30): Obfuscated PowerShell execution (`powershell.exe -enc SQBFAFgA...`)
  3. `EVT-003` (10:21:05): Lateral SMB session to enterprise server `SRV-CORP-FILE`
  4. `EVT-004` (10:22:45): Unauthorized access to confidential customer records (`customer_data.csv`)
  5. `EVT-005` (10:24:15): Outbound command-and-control connection to external IP `198.51.100.24`
  6. `EVT-006` (10:25:00): High-volume data exfiltration (8.45 MB) to external adversary infrastructure
- **Correlated Entities (7)**: `user:employee01`, `device:WORKSTATION-01`, `ip:192.168.1.20`, `file:powershell.exe`, `server:SRV-CORP-FILE`, `file:\SRV-CORP-FILE\confidential\customer_data.csv`, `ip:198.51.100.24`
- **Directed Graph Edges (15)**: `AUTHENTICATED_TO`, `RESOLVED_IP`, `USES`, `EXECUTED`, `CONNECTED_TO`, `ACCESSED`, `EXFILTRATED_TO`
- **Forensic Findings (3)**:
  - `FND-001`: Compromised Account and Workstation Execution (Confidence 0.95, High)
  - `FND-002`: Lateral Movement and Sensitive Data Collection (Confidence 0.94, High)
  - `FND-003`: External Command-and-Control and Data Exfiltration (Confidence 0.98, Critical)

---

## 5. Repository Structure

```text
Cyber-Twin/
├── frontend/                 # React 18, Vite, Cytoscape.js & Three.js investigation UI
│   ├── src/
│   │   ├── api/              # Live FastAPI client & service abstraction
│   │   ├── components/       # Timeline, Graph, Replay, 3D Twin, Evidence, Report components
│   │   ├── visualization/    # Verification and integration test runners
│   │   ├── mock/             # Certified forensic offline fallback dataset
│   │   └── types/            # Data contracts aligning with architecture specification
├── backend/                  # FastAPI REST backend
│   ├── app/
│   │   ├── models/           # SQLAlchemy ORM models (Case, Evidence, Event, Finding)
│   │   ├── schemas/          # Pydantic v2 validation contracts
│   │   ├── routes/           # REST endpoints (/cases, /reconstruction, /evidence, /timeline)
│   │   └── services/         # Forensic loader & SQLite database persistence
│   └── tests/                # Automated backend test suite (36 tests)
├── forensic-engine/          # Digital forensics pipeline
│   ├── ingestion/            # Raw log collectors
│   ├── parsing/              # Regex parsers for auth, endpoint, server, file, firewall logs
│   ├── normalization/        # Event contract schema normalization
│   └── correlation/          # STIX 2.1 knowledge graph correlation engine
├── tests/                    # Forensic pipeline test suite (38 tests)
├── data/
│   ├── raw/                  # Raw log files for CASE-001
│   └── processed/            # Normalized events and incident_reconstruction.json
└── docs/                     # Architectural and integration documentation
```

---

## Deployment

The current prototype is intended to run locally.

**Live deployment:** Not publicly deployed.

---

## Credentials & Setup

Cyber-Twin does not require external credentials or API keys for the local prototype.

All required data fixtures, synthetic evidence logs, and configuration defaults are bundled within the repository. Follow the [Running the Prototype](#6-running-the-prototype) instructions below to run the complete stack locally.

---

## 6. Running the Prototype

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm 9+

### Start the FastAPI Backend
```bash
# In repository root:
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000
```
Backend API docs available at: `http://localhost:8000/docs`

### Start the Frontend Investigation UI
```bash
cd frontend
npm install
npm run dev
```
Open your browser at: `http://localhost:5173`

### Verification Commands
```bash
# Forensic engine tests:
python -m pytest tests -v

# Backend REST tests:
python -m pytest backend/tests -v

# Frontend core integration verification:
node frontend/src/visualization/verifyFrontendIntegration.js
node frontend/src/visualization/verifyCoreIntegration.js

# Frontend production build:
npm --prefix frontend run build
```