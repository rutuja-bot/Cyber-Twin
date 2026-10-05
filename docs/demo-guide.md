# Demonstration Guide

**Project:** Cyber-Twin — Digital Forensics & Incident Reconstruction Platform  
**Target Audience:** Hackathon Judges & Technical Evaluators  
**Demonstration Time:** 5–10 Minutes  
**Scenario:** `CASE-001` (Unauthorized Lateral Movement & Data Exfiltration)  

---

## 1. Quick Launch Setup

Open two PowerShell terminals to start the prototype services:

### Terminal 1: Backend REST API
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* **API Documentation:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) (Swagger UI)
* **Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health) returns `{"status":"ok"}`

### Terminal 2: Frontend Investigation Workbench
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
* **Investigation Workbench:** Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 2. 5–10 Minute Judge Demonstration Script

| Time | Phase | What to SHOW | What to SAY |
|:--- |:--- |:--- |:--- |
| **0:00 - 1:00** | **The Problem** | Show raw log directory (`data/raw/`) containing 5 isolated log files. | *"In real-world investigations, forensic evidence is fragmented across multiple silos—auth logs, endpoint executions, server requests, and firewalls. Manually correlating these logs is slow, tedious, and prone to error."* |
| **1:00 - 2:00** | **Incident Overview** | Open Cyber-Twin workbench. Point out the top telemetry banner for `CASE-001`. | *"Cyber-Twin automatically ingests, normalizes, and correlates these logs. At a glance, the analyst sees 6 normalized events, 7 discovered entities, 15 directed relationships, and 3 critical findings."* |
| **2:00 - 3:00** | **Chronological Timeline** | Scroll through the **Incident Timeline** panel on the left. | *"Every event is normalized to UTC and mapped to its MITRE ATT&CK tactic—from Initial Access via compromised credentials, to PowerShell Execution, Lateral Movement, Collection, C2, and Exfiltration."* |
| **3:00 - 4:00** | **Selection & Synchronization** | Click `EVT-002: suspicious_process_spawn` in the timeline. | *"Selecting an event immediately highlights the involved entities in the 2D topology graph. Notice how WORKSTATION-01 and powershell.exe illuminate, showing exactly where execution occurred."* |
| **4:00 - 5:00** | **2D Topology & Attack Path** | Pan the 2D graph, then toggle **"Attack Path Only"** in the header. | *"Cytoscape.js renders the full entity-relationship network. When the analyst toggles Attack Path Only, background benign devices dim, isolating the adversary's lateral pivot from workstation to corporate file server."* |
| **5:00 - 6:30** | **3D Cyber Twin Spatial View** | Switch to the **3D Cyber Twin** view. Orbit the 3D scene. | *"The 3D Cyber Twin provides spatial network context. Infrastructure is grouped into three enterprise security zones: External Internet in Red, Corporate LAN in Cyan, and Restricted Datacenter in Purple."* |
| **6:30 - 8:00** | **Incident Replay Engine** | Press **Play** on the Replay transport bar. | *"The time-series Replay Engine allows analysts to watch the intrusion unfold chronologically. Notice how the timeline advances and animated threat beams pulse across network zones as data is staged and exfiltrated."* |
| **8:00 - 9:00** | **Evidence Traceability & Findings** | Open the **Evidence Inspector** drawer on `EVT-006` and review the findings panel. | *"Every visual element links directly to verifiable raw evidence records with cryptographic SHA-256 hashes, ensuring complete evidentiary integrity for legal and compliance review."* |
| **9:00 - 10:00** | **Conclusion & Value** | Return to full workbench view. | *"Cyber-Twin turns fragmented forensic evidence into one connected, traceable incident story—accelerating incident triage, eliminating manual correlation, and making complex intrusions understandable."* |

---

## 3. Core Demonstration Highlights

* **Automated & Deterministic:** Converts multi-source logs into a normalized 11-field schema with zero data loss.
* **Bi-Directionally Synchronized:** Clicking any card or node immediately updates all timeline, 2D graph, and 3D views.
* **Cryptographically Verifiable:** High-level investigative findings remain anchored to raw log artifacts via SHA-256 digests.

