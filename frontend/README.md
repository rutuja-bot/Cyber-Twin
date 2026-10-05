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
# URL of the Person 1 FastAPI backend server
VITE_API_BASE_URL=http://localhost:8000/api/v1

# Toggle mock data fallback (set to 'false' when backend endpoints are ready)
VITE_USE_MOCK_DATA=true
```

---

## Mock Data & Backend Integration

### Realistic Forensic Demo Incident (`CASE-2026-0882`)
The mock dataset replicates an actual multi-stage breach:
1. **Initial Access**: Internal subnet brute force targeting `dev_user41`.
2. **Execution & Privilege Escalation**: Obfuscated PowerShell (PID 6412) dumping memory and obtaining SYSTEM token privileges.
3. **Lateral Collection**: SMB read of restricted financial database `customer_vault_q3.db` on server `FS-CORP-01`.
4. **Staging & Exfiltration**: Packaging into `svchost_upd.zip` and TLS streaming 42.8 MB to external C2 `198.51.100.42:8443`.
5. **Anti-Forensics**: Attempted clearance of Windows Security Event Log (`wevtutil cl Security`).

### Seamless FastAPI Integration
All UI components consume data exclusively through `src/api/*`. When Person 1 completes the FastAPI backend:
1. Update `VITE_API_BASE_URL` to point to the live backend server.
2. Set `VITE_USE_MOCK_DATA=false`.
3. If the backend is temporarily offline or an endpoint returns a non-200 status, `client.ts` automatically falls back to certified mock forensic records without crashing the UI.
