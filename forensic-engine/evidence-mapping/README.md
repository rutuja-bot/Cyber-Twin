# Forensic Engine — Evidence Mapping

## Overview
Evidence Mapping is the logical module within the forensic engine that connects processed digital evidence to the entities and events involved in the reconstructed cyber incident.

It establishes and preserves the relational foundation that links raw forensic artifacts and security logs to high-level incident events, affected assets, and attack trajectories.

---

## Architectural Role in Cyber Twin Pipeline

Evidence Mapping bridges normalized evidence artifacts and multi-entity correlation:

```text
Digital Evidence / Security Logs
               ↓
 Evidence Collection / Ingestion
               ↓
      Evidence Processing
               ↓
            Parsing
               ↓
    Timestamp Normalization
               ↓
       Evidence Mapping
               ↓
       Event Correlation
               ↓
    Incident Reconstruction
```

> **Note**: Evidence Mapping is a logical component of the forensic engine, not an independent microservice or standalone database.

---

## Relational Hierarchy & Mapping Model

Evidence Mapping structures evidence chains through the following hierarchy:

```text
Evidence (Logs, PCAP, File Artifacts)
   ↓
Event (Auth, File Access, Network Connection, Process Execution)
   ↓
Entities (User, Device, IP Address, File, Server)
   ↓
Related Events
   ↓
Incident Reconstruction (Cyber Twin)
```

### Key Relationships Supported
- **Authentication**: A login event is explicitly mapped to the specific authentication log evidence that produced it.
- **File System Activity**: A file-access or modification event is mapped back to its source audit log / file system record.
- **Network Traffic**: Suspicious network connections, beacons, and data exfiltration events are linked to source packet captures or firewall/flow logs.
- **Multi-Source Support**: Multiple distinct evidence items can converge to corroborate related events.
- **Entity Association**: Each event connects to involved users, endpoints, IP addresses, files, and server infrastructure.
- **Traceable Reconstruction**: Investigators can trace any reconstructed incident event directly back to its supporting digital evidence.

---

## Traceability & Stable Identifiers

To ensure non-repudiation, auditability, and chain of custody, Evidence Mapping mandates stable identifiers across the pipeline:

| Identifier | Purpose |
| :--- | :--- |
| `case_id` | Identifies the overall forensic investigation case. |
| `evidence_id` | Uniquely identifies a collected raw/processed digital evidence item. |
| `event_id` | Identifies a normalized, discrete cyber event extracted from evidence. |
| `entity_id` | Identifies an actor or system artifact (User, Device, IP, File, Server). |
| `relationship_id` | Defines a directed link between entities, events, and evidence. |

---

## Investigation Workflow Alignment

The purpose of Evidence Mapping extends beyond metadata storage; it establishes the evidence-linked graph required for:

$$\text{RECONSTRUCT} \longrightarrow \text{EXPLORE} \longrightarrow \text{REPLAY} \longrightarrow \text{VERIFY}$$

- **Reconstruct**: Assemble disparate logs into a unified, coherent incident narrative.
- **Explore**: Enable investigators to navigate relationships and attack paths across the Cyber Twin graph.
- **Replay**: Step through the incident chronologically while maintaining context.
- **Verify**: Audit every visual finding and assertion against immutable supporting evidence.
