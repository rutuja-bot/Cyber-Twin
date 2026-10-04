# Cyber Twin — System Architecture & Implementation Blueprint

## Problem Statement
> **"Fragmented Cybersecurity Data and Lack of Integrated Incident Reconstruction for Effective Digital Forensic Investigation System"**

Cybersecurity and forensic evidence is fragmented across logs, users, devices, files, IP addresses, servers, and disparate monitoring tools. Digital forensic investigators need an integrated mechanism to correlate fragmented evidence, reconstruct the incident, understand relationships and attack paths, replay events chronologically, and verify findings directly against supporting evidence.

---

## Core Solution: Cyber Twin

**Cyber Twin** is an interactive cyber incident reconstruction and replay system. The Cyber Twin is **not** an isolated microservice or separate processing daemon; it is the **integrated digital forensic investigation model** produced by the forensic engine pipeline, persisted across relational and graph databases, served via FastAPI, and explored through four integrated investigation views in the React frontend.

---

## Final End-to-End Forensic Pipeline

```text
Digital Evidence / Security Logs
              ↓
          Ingestion
              ↓
           Parsing
              ↓
        Normalization
              ↓
      Evidence Processing
              ↓
       Evidence Mapping
              ↓
       Event Correlation
              ↓
    Incident Reconstruction
              ↓
         Cyber Twin Data
              ↓
      Evidence Linking
              ↓
  Investigation Presentation
       ┌──────┼──────┬──────┐
       ↓      ↓      ↓      ↓
     Graph Timeline Replay  3D
       └──────┼──────┴──────┘
              ↓
       Forensic Findings
              ↓
       Forensic Report
```

---

## Investigation Presentation Views

The React frontend presents the reconstructed Cyber Twin through four coordinated views:
1. **Relationship Graph**: Topological visualization (powered by Neo4j and interactive graph UI) showing entities, credentials, and compromised lateral movement paths.
2. **Chronological Timeline**: Linear and event-clustered timeline displaying normalized events across the incident lifecycle.
3. **Investigation Replay**: Step-by-step interactive playback of attack actions, showing state transitions across infrastructure over time.
4. **3D Cyber Environment / Infrastructure View**: Spatial representation of cyber assets (workstations, servers, routers, external IPs) and visual evidence pins rendered via Three.js.

---

## Shared MVP Data Objects (Integration Contracts)

The following core objects define the integration contract across the ingestion pipeline, database persistence, FastAPI backend, and frontend interface:

### 1. `Case`
Top-level forensic investigation container.
- `case_id`: String (UUID or slug)
- `title`: String
- `description`: String
- `status`: String (`open`, `investigating`, `closed`)
- `created_at`: ISO 8601 Timestamp

### 2. `Evidence`
Collected raw or processed digital evidence artifacts.
- `evidence_id`: String (Unique evidence ID)
- `case_id`: String (Reference to parent Case)
- `type`: String (`auth_log`, `pcap`, `sysmon`, `disk_artifact`, `memory_dump`)
- `source`: String (File name, endpoint host, sensor name)
- `timestamp`: ISO 8601 Timestamp (Ingestion or creation time)
- `hash`: String (SHA-256 integrity hash)
- `metadata`: JSON / Key-Value map

### 3. `Event`
Discrete, normalized cyber event extracted from evidence.
- `event_id`: String (Unique event ID)
- `case_id`: String
- `timestamp`: ISO 8601 Timestamp (Normalized event occurrence time)
- `event_type`: String (`logon`, `file_access`, `network_connection`, `process_spawn`)
- `user`: String (Username or security ID)
- `device`: String (Hostname or device identifier)
- `source_ip`: String (IPv4/IPv6)
- `destination_ip`: String (IPv4/IPv6)
- `file`: String (File path or hash)
- `server`: String (Target service or server name)
- `evidence_id`: String (Source evidence linkage via Evidence Mapping)

### 4. `Entity`
Actor, asset, or technical resource identified in the incident.
- `entity_id`: String
- `case_id`: String
- `entity_type`: String (`user`, `workstation`, `server`, `ip_address`, `file_object`)
- `name`: String
- `metadata`: JSON (OS, role, department, reputation)

### 5. `Relationship`
Directed interaction between entities or events.
- `relationship_id`: String
- `case_id`: String
- `source_entity_id`: String
- `target_entity_id`: String
- `relationship_type`: String (`AUTHENTICATED_TO`, `CONNECTED_TO`, `DOWNLOADED`, `EXECUTED`)
- `evidence_ids`: List[String] (Corroborating evidence IDs)

### 6. `Finding`
Actionable forensic conclusion or alert established during investigation.
- `finding_id`: String
- `case_id`: String
- `title`: String
- `description`: String
- `severity`: String (`low`, `medium`, `high`, `critical`)
- `confidence`: Float (`0.0` - `1.0`)
- `event_ids`: List[String] (Associated reconstructed events)
- `evidence_ids`: List[String] (Direct supporting evidence IDs via Evidence Linking)

### 7. `TimelineEvent`
Ordered sequence item optimized for timeline rendering.
- `timeline_event_id`: String
- `event_id`: String
- `timestamp`: ISO 8601 Timestamp
- `sequence`: Integer
- `description`: String

### 8. `ReplayEvent`
State-change action consumed by the investigation playback engine.
- `replay_event_id`: String
- `event_id`: String
- `sequence`: Integer
- `timestamp`: ISO 8601 Timestamp
- `action`: String (Visual action directive: `highlight_node`, `draw_edge`, `spawn_alert`)

---

## Development Priorities (Round 2 MVP)

### P0 — MUST WORK (Core Baseline Prototype)
1. **Sample cyber incident dataset**: Simulated multi-stage attack logs (phishing $\rightarrow$ credential access $\rightarrow$ lateral movement $\rightarrow$ exfiltration).
2. **Log ingestion**: File reader accepting raw security log files.
3. **Parsing**: Format-specific log extraction.
4. **Timestamp normalization**: Unifying varied log timestamps into UTC ISO 8601.
5. **Evidence mapping**: Associating raw evidence lines to events and entity IDs.
6. **Event correlation**: Linking related actions across hosts, users, and IPs.
7. **Incident reconstruction**: Building the unified Cyber Twin data model.
8. **FastAPI backend**: REST endpoints serving incident cases, events, and graphs.
9. **PostgreSQL persistence**: Storing case, evidence, event, and finding tables.
10. **React investigation dashboard**: Main user interface with case selector and tabs.
11. **Relationship graph**: Visual node-link diagram of entities and attack paths.
12. **Timeline**: Interactive chronological timeline with filtering.
13. **Investigation replay**: Step-by-step playback with play/pause/scrub controls.
14. **Evidence-linked findings**: Clicking any finding or event surfaces the source log evidence.

### P1 — SHOULD WORK
15. **Neo4j persistence**: Native graph storage and Cypher query support.
16. **SHA-256 evidence integrity**: Verification checks during upload and report generation.
17. **Basic forensic report generation**: Exportable PDF/Markdown investigation summary.
18. **Basic 3D Cyber Twin visualization**: Lightweight Three.js scene showing servers/hosts and event pins.

### P2 — OPTIONAL ENHANCEMENTS (Do NOT Block P0)
19. Explainable investigation assistant.
20. Evidence gap detection.
21. Contradiction detection.
22. Alternative hypothesis analysis.
23. Advanced AI analysis.
24. Advanced 3D visualization.

---

## Minimum Successful Demonstration Flow

The prototype demonstration must succeed through this unbroken workflow:

```text
Upload / Load sample logs
          ↓
Process (Ingest → Parse → Normalize → Map → Correlate)
          ↓
Reconstruct incident into Cyber Twin
          ↓
Show Relationship Graph
          ↓
Show Chronological Timeline
          ↓
Replay incident step-by-step
          ↓
Click an Event / Finding
          ↓
Display exact supporting Evidence (Log line, SHA-256, Source metadata)
```
