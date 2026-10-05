# Product Requirements Document (PRD)

**Project:** Cyber-Twin — Digital Forensics & Incident Reconstruction Platform  
**Target Audience:** Technical Judges, Evaluators, and Security Practitioners  
**Status:** Complete Prototype Specification  

---

## 1. Document Purpose

This document outlines the product requirements, system objectives, and functional scope of the Cyber-Twin digital forensics platform. It defines how the completed prototype solves the challenge of fragmented security telemetry by reconstructing complex cyber intrusions into an integrated, evidence-backed visual workbench.

---

## 2. Problem Statement

Modern enterprise investigations suffer from severe data fragmentation. Indicators of compromise (IoCs) and evidentiary artifacts reside in disconnected log silos—including authentication logs, endpoint process executions, web application traffic, internal file share audits, and perimeter network firewalls.

Each log source utilizes disparate formats, field names, and timestamp standards. Consequently, incident response analysts must manually cross-reference millions of raw log entries to reconstruct an attack sequence. This leads to critical investigation delays, missed attack paths, high cognitive fatigue, and difficulty establishing verifiable evidentiary chain of custody.

---

## 3. Proposed Solution

Cyber-Twin delivers an automated, end-to-end digital forensics platform that ingests raw, multi-source evidence and synthesizes it into a unified, chronological, and spatial investigation story.

The platform deterministically ingests and parses heterogeneous logs, normalizes timestamps to UTC, discovers multi-entity relationships, maps observed attacker actions to the MITRE ATT&CK framework, and stores the correlated incident in a FastAPI backend. Investigators interact with the reconstructed incident through a synchronized web workbench featuring a 2D relationship graph, a chronological timeline, an attack-path isolation toggle, a 3D digital twin infrastructure layer, and a time-series incident replay engine.

```text
Raw Forensic Evidence
  → Ingestion & Parsing
  → UTC Normalization
  → MITRE ATT&CK Mapping
  → Multi-Entity Correlation
  → Incident Reconstruction
  → FastAPI Backend
  → Interactive Investigation Workbench (2D / 3D / Timeline / Replay)
```

---

## 4. Target Users

* **Digital Forensics and Incident Response (DFIR) Analysts:** Rapidly reconstruct attack kill chains, identify patient zero, trace lateral movement, and verify affected assets.
* **Security Operations Center (SOC) Tier 2/3 Teams:** Pivot from isolated security alerts to unified entity-relationship topologies.
* **Forensic Investigators & Security Auditors:** Review chronological incident replays backed by cryptographic SHA-256 evidence traceability.

---

## 5. Core Objectives

1. **Automate Evidence Synthesis:** Ingest and parse 5 standard enterprise log formats into a single canonical event representation.
2. **Deterministic Correlation:** Group multi-source events by common entities (users, devices, servers, files, IP addresses) and derive typed, directed relationships.
3. **MITRE ATT&CK Alignment:** Map normalized behaviors to recognized adversarial tactics and techniques.
4. **Synchronized Visual Triage:** Maintain bi-directional selection synchronization across a 2D topology graph, chronological timeline, and 3D digital twin.
5. **Time-Series Incident Replay:** Provide interactive temporal transport controls (Play, Pause, Step, Scrubber) to observe attack progression across network boundaries.

---

## 6. Functional Requirements

### FR-1: Multi-Source Evidence Ingestion & Parsing
* Ingests 5 heterogeneous raw log sources: SSH/PAM authentication (`auth.log`), endpoint process execution (`endpoint.log`), HTTP web server traffic (`server.log`), SMB file audits (`file_access.log`), and iptables firewalls (`firewall.log`).
* Extracts structured fields (hostnames, IP addresses, usernames, process commands, file paths, network ports) using dedicated regular expression parsers.

### FR-2: Timestamp & Schema Normalization
* Standardizes diverse timestamp syntaxes (syslog, slash-formatted, ISO strings) into canonical UTC ISO-8601 strings (`YYYY-MM-DDTHH:MM:SS`).
* Enforces the canonical 11-field **Event v1** contract across all pipeline and API tiers: `event_id`, `case_id`, `timestamp`, `event_type`, `user`, `device`, `source_ip`, `destination_ip`, `file`, `server`, `evidence_id`.

### FR-3: MITRE ATT&CK Mapping & Evidence Traceability
* Evaluates normalized events against heuristic detection rules, mapping actions to MITRE ATT&CK techniques (T1078, T1059.001, T1021.002, T1005, T1071, T1048).
* Preserves explicit cryptographic SHA-256 hashes for all raw evidence files and maintains foreign-key links from events back to source evidence records.

### FR-4: Correlation & Incident Reconstruction
* Correlates events sharing common entities and derives directed canonical relationships (`AUTHENTICATED_TO`, `RESOLVED_IP`, `USES`, `EXECUTED`, `CONNECTED_TO`, `ACCESSED`, `EXFILTRATED_TO`).
* Outputs a unified incident reconstruction containing topology nodes, directed edges, a sequential attack timeline, kill chain stages, and correlated findings.

### FR-5: Backend API & Data Persistence
* Provides REST endpoints via FastAPI for case management, evidence retrieval, event querying, and full graph/timeline reconstruction retrieval.
* Persists relational entities in SQLite/PostgreSQL using SQLAlchemy ORM.

### FR-6: Synchronized Visual Investigation Workbench
* Renders an interactive 2D network topology using Cytoscape.js with force-directed physics layout.
* Displays a chronological timeline with color-coded MITRE ATT&CK tactical stage badges.
* Renders a procedural 3D Three.js digital twin organizing infrastructure into three enterprise security zones (External, Corporate LAN, Restricted Datacenter) with animated threat beams.
* Implements bidirectional synchronization: selecting an item in the timeline focuses corresponding elements in the 2D graph, 3D scene, and evidence inspector.

### FR-7: Attack Path Isolation & Incident Replay
* Provides an **Attack Path Only** toggle that isolates adversary movement while dimming non-attack background entities.
* Provides a time-series replay engine with transport controls (Play, Pause, Step Forward, Step Backward, Scrubber) and variable playback speeds (0.5x, 1x, 2x, 5x).

---

## 7. Non-Functional Requirements

* **Determinism:** Identical input logs must always produce byte-identical normalized event records and reconstruction models.
* **Traceability:** Every finding, timeline stage, and graph edge must reference a specific evidence artifact and SHA-256 hash.
* **Performance:** Client-side 2D graph rendering and 3D WebGL scenes must maintain responsive 60 FPS performance for standard incident datasets.
* **Portability:** Backend executes on standard Python 3.9+ without external binary dependencies; frontend builds and runs via standard Node.js and Vite toolchains.

---

## 8. Main Investigation Use Case (CASE-001)

* **Incident Title:** Unauthorized Lateral Movement and Confidential Data Exfiltration.
* **Scenario:** An adversary compromises an internal employee account, pivots laterally to a file server, stages confidential customer records, and exfiltrates data to external infrastructure.
* **Reconstructed Attack Chain:**
  1. **Initial Access (`EVT-001`):** Compromised account `employee01` logs into `WORKSTATION-01` (`192.168.1.20`) via SSH (corroborated by `auth.log` / `EVD-001`).
  2. **Execution (`EVT-002`):** Reconnaissance execution via `powershell.exe` on workstation (corroborated by `endpoint.log` / `EVD-002`).
  3. **Lateral Movement (`EVT-003`):** SMB administrative share connection from workstation to corporate server `SRV-CORP-FILE` (corroborated by `server.log` / `EVD-003`).
  4. **Collection (`EVT-004`):** Unauthorized read access and staging of `customer_data.csv` (corroborated by `file_access.log` / `EVD-004`).
  5. **Command & Control (`EVT-005`):** Outbound TCP connection established to external IP `198.51.100.24` (corroborated by `firewall.log` / `EVD-005`).
  6. **Exfiltration (`EVT-006`):** Bulk data transfer over port 443 to external adversary IP (corroborated by `firewall.log` / `EVD-005`).
* **Reconstruction Output:** 6 chronological events, 7 discovered entities, 15 directed relationships, and 3 correlated critical findings.

---

## 9. Prototype Scope

The prototype covers the complete deterministic pipeline from raw log ingestion to synchronized 2D/3D visual triage for evaluated enterprise scenarios. It operates on verified simulated logs and delivers an end-to-end investigation workbench.

---

## 10. Out of Scope

* Live agent streaming and continuous kernel-level endpoint collection.
* Multi-tenant role-based user authentication (SSO / OAuth).
* Probabilistic or deep neural network anomaly detection.
* Physical crime scene or photogrammetric building scans.
* Enterprise-scale SIEM replacement or autonomous active defense.

---

## 11. Future Scope

* **Additional Cloud Ingestion:** Native parsers for AWS CloudTrail, Azure Monitor, and Kubernetes audit logs.
* **Dedicated Graph Store:** Integration with native graph databases (e.g., Neo4j) for enterprise-scale Cypher queries.
* **Automated Forensic Reports:** Export module generating court-admissible PDF summaries with digital signatures.
* **Containerized Deployment:** Dockerfile and Docker Compose orchestration for single-command deployment.

---

## 12. Success Criteria

| Objective | Target Criteria | Status |
|---|---|:---:|
| **Log Parsing** | Accurately extracts structured fields across 5 log formats | Met (38 tests) |
| **Normalization** | Standardizes timestamps to UTC ISO-8601 and enforces 11-field schema | Met |
| **Correlation** | Discovers multi-entity topology and directed relationships | Met |
| **API Delivery** | Serves cases, evidence, events, and reconstructions over REST | Met (36 tests) |
| **Visual Workbench** | Delivers synchronized 2D graph, timeline, 3D twin, and incident replay | Met |
| **Traceability** | Links all findings and graph edges to verifiable SHA-256 evidence | Met |
