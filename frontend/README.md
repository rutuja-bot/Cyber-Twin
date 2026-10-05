# Cyber Twin — Frontend & Investigation UI

## Overview
The **Cyber Twin Frontend** is an interactive cyber incident reconstruction and digital forensics replay interface. Built for SOC analysts, incident responders, and forensic investigators, it unifies fragmented security evidence across endpoints, users, networks, and databases into a coherent digital twin investigation model.

---

## Key Features & Investigation Flow
The application provides an end-to-end investigation experience across 9 integrated modules:

1. **Investigator Authentication (`/`)**: Secure investigator access terminal with password visibility toggle, error handling, session persistence, and one-click demo credentials (`investigator` / `cyber123`).
2. **Landing & Overview (`/landing`)**: Project introduction, architectural pipeline overview, and quick-start actions.
3. **Case Management Vault (`/cases`)**: Manage active cases, search and filter by status and severity, and provision new investigation workspaces.
4. **Investigation Hub (`/investigation`)**: High-level command center with key metrics, kill-chain progress, preview cards, and suspicious activity panels.
5. **Evidence Vault & Chain of Custody (`/evidence`)**: Certified evidence artifacts (auth logs, Sysmon, PCAP, disk artifacts, memory dumps) with cryptographic SHA-256 hash validation and raw log inspection.
6. **Chronological Incident Timeline (`/timeline`)**: Millisecond-precision event sequence with severity filtering, event type categorization, and direct links to source evidence records.
7. **Entity & Attack Path Graph (`/graph`)**: Interactive topological node-link visualization mapping accounts, workstations, processes, sensitive files, and external C2 destinations with pan/zoom and node inspection.
8. **Interactive Incident Replay (`/replay`)**: VCR playback engine (Play, Pause, Restart, Scrubber, Speed 0.5x–4x) showing dynamic state transitions across spatial infrastructure assets.
9. **Forensic Findings & Report (`/report`)**: Corroborated findings mapped to MITRE ATT&CK tactics/techniques, remediation recommendations, printable report mode, and Markdown export.

---

## Technology Stack
- **Framework**: React 18 + Vite + TypeScript
- **Routing**: React Router DOM (v6)
- **Styling**: Cyber Forensic Design System (`cyber.css`) with obsidian/cyan/amber/crimson dark palette and responsive grid layouts
- **Icons**: Lucide React
- **Visualization**: Interactive topological SVG network graph + spatial infrastructure Cyber Twin stage

---

## Folder Structure
```text
frontend/
├── public/
│   └── shield.svg               # Application favicon
├── src/
│   ├── api/                     # Backend API client & service abstraction
│   │   ├── client.ts            # Configurable fetch client with fallback
│   │   ├── cases.ts             # Case operations
│   │   ├── evidence.ts          # Evidence retrieval
│   │   ├── timeline.ts          # Normalized event queries
│   │   ├── graph.ts             # Entity & relationship queries
│   │   ├── replay.ts            # Replay sequence queries
│   │   └── findings.ts          # Forensic findings & conclusions
│   ├── components/
│   │   ├── common/              # Badge, Button, Card, Modal
│   │   ├── layout/              # Navbar, Sidebar, InvestigationHeader
│   │   ├── dashboard/           # MetricCard
│   │   ├── evidence/            # EvidenceDetailModal
│   │   ├── timeline/            # TimelineItem
│   │   ├── graph/               # NetworkGraph, NodeInspector
│   │   ├── replay/              # ReplayControls, CyberTwinStage
│   │   └── findings/            # ReportView
│   ├── context/
│   │   └── InvestigationContext.tsx # Cross-view shared state synchronization
│   ├── mock/
│   │   └── investigationData.ts # Complete realistic forensic mock dataset
│   ├── pages/
│   │   ├── Landing/             # LandingPage
│   │   ├── Dashboard/           # CaseDashboardPage
│   │   ├── Investigation/       # InvestigationDashboardPage
│   │   ├── Evidence/            # EvidencePage
│   │   ├── Timeline/            # TimelinePage
│   │   ├── Graph/               # GraphPage
│   │   ├── Replay/              # ReplayPage
│   │   └── Report/              # ReportPage
│   ├── styles/
│   │   └── cyber.css            # Cyber forensic design system
│   ├── types/
│   │   └── index.ts             # Shared data contracts (docs/architecture/README.md)
│   ├── App.tsx                  # Root layout & route configuration
│   └── main.tsx                 # DOM entry point
├── .env                         # Local environment variables
├── .env.example                 # Environment template
├── index.html                   # HTML entry template
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript compiler config
└── vite.config.ts               # Vite configuration
```

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended; tested on v24)
- npm (v9+ recommended; tested on v11)

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
The application will be available at: `http://localhost:5173`

### Production Build
```bash
npm run build
```

---

## Environment Variables
Configured in `frontend/.env`:
```env
# URL of the integrated Cyber Twin FastAPI backend server
VITE_API_BASE_URL=http://localhost:8000

# Toggle mock data fallback ('false' connects directly to live backend)
VITE_USE_MOCK_DATA=false
```

---

## Live Case & Backend Integration

### Authoritative Forensic Demo Incident (`CASE-001`)
The integrated prototype loads directly from the live FastAPI forensic reconstruction endpoint (`/cases/CASE-001/reconstruction`), capturing an end-to-end multi-stage cyber incident:
1. **Initial Access (`EVT-001`)**: Valid credential abuse for `employee01` authenticating from `192.168.1.20` to `WORKSTATION-01` (`auth.log`, `EVD-001`).
2. **Execution (`EVT-002`)**: Obfuscated PowerShell execution (`powershell.exe -enc SQBFAFgA...`) spawning on `WORKSTATION-01` (`endpoint.log`, `EVD-002`).
3. **Lateral Movement (`EVT-003`)**: Lateral SMB session established across internal subnet to enterprise file server `SRV-CORP-FILE` (`server.log`, `EVD-003`).
4. **Collection (`EVT-004`)**: Staging and unauthorized read access to confidential customer records `\\SRV-CORP-FILE\confidential\customer_data.csv` (`file_access.log`, `EVD-004`).
5. **Command and Control (`EVT-005`)**: Outbound C2 network flow established from `192.168.1.20:49150` to external suspect IP `198.51.100.24:443` (`firewall.log`, `EVD-005`).
6. **Exfiltration (`EVT-006`)**: High-volume data exfiltration (8.45 MB) transmitted directly to external adversary infrastructure `198.51.100.24:443` (`firewall.log`, `EVD-005`).

### Seamless Core Integration
All UI components consume data through `src/api/*` targeting the live FastAPI backend:
1. Active backend routes: `/cases`, `/cases/CASE-001`, `/cases/CASE-001/evidence`, `/cases/CASE-001/timeline`, `/cases/CASE-001/findings`, `/cases/CASE-001/reconstruction`, `/cases/CASE-001/reconstruction/graph`.
2. Interactive Topology Graph: Rendered via Cytoscape.js with full node inspection, edge inspection, and bidirectional timeline synchronization.
3. 3D Cyber Environment: Spatial infrastructure model powered by Three.js visualizing nodes, server racks, packet flows, and attack paths.
4. Resilient Fallback: If the backend is unreachable, the client gracefully falls back to certified local forensic records without crashing.
