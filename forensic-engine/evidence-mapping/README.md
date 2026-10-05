# Forensic Engine — Evidence Mapping

## Overview
Evidence Mapping is the logical module within the forensic engine responsible for establishing relationships between raw/processed evidence, extracted events, and incident entities during forward pipeline processing.

It systematically structures incoming digital evidence into discrete events and maps those events to the specific actors, endpoints, and assets involved in the cyber incident.

---

## Architectural Role in Cyber Twin Pipeline

Evidence Mapping operates directly after timestamp normalization and before multi-entity event correlation:

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
     Graph Timeline Replay 3D
       └──────┼──────┴──────┘
              ↓
       Forensic Findings
              ↓
       Forensic Report
```

> **Note**: Evidence Mapping is a core module of the forensic engine pipeline. It is not an independent microservice, separate database, or secondary processing engine.

---

## Core Responsibility & Forward Pipeline Flow

Evidence Mapping answers the fundamental processing question:

$$\textbf{"Which evidence produced or supports which event, and which entities are involved?"}$$

### Directionality Flow
```text
Evidence  ───►  Event  ───►  Entity  ───►  Relationship
```

### Mapping Structure & Example
```text
Evidence E001 (Windows Security Log 4624)
    ↓
Event EVT001 (Successful Remote Interactive Logon)
    ↓
Entities:
  - User: U001 (admin_service)
  - Device: D001 (WKSTN-FIN-04)
  - IP: IP001 (192.168.10.45)
    ↓
Relationship:
  - R001: (U001) AUTHENTICATED_TO (D001) via (IP001)
```

---

## Stable Identifiers & Provenance Schema

To ensure deterministic mapping and cross-module consistency, Evidence Mapping establishes and propagates stable identifiers:

| Identifier | Description | Example |
| :--- | :--- | :--- |
| `case_id` | Top-level investigation identifier. | `CASE-2026-001` |
| `evidence_id` | Unique ID for the raw/processed evidence artifact. | `EVD-LOG-0042` |
| `event_id` | Identifier for the normalized, discrete cyber event. | `EVT-AUTH-108` |
| `entity_id` | Identifier for a mapped incident entity (User, Device, IP, File, Server). | `ENT-DEV-019` |
| `relationship_id` | Identifier for a directed relationship between entities and events. | `REL-MAP-501` |

---

## Distinction: Evidence Mapping vs. Evidence Linking

| Attribute | Evidence Mapping (`evidence-mapping/`) | Evidence Linking (`evidence-linking/`) |
| :--- | :--- | :--- |
| **Pipeline Stage** | Pre-correlation (forward processing) | Post-reconstruction (presentation & reporting) |
| **Direction** | $\text{Evidence} \rightarrow \text{Events} \rightarrow \text{Entities} \rightarrow \text{Relationships}$ | $\text{Investigation Output} \rightarrow \text{Supporting Evidence}$ |
| **Primary Question** | *"Which evidence produced this event, and what entities are involved?"* | *"What evidence proves and justifies this investigation result?"* |
| **Primary Consumers** | Correlation Engine, Incident Reconstruction | Relationship Graph, Timeline, Replay, Forensic Report |

Evidence Mapping constructs the data relationships during log ingestion, whereas Evidence Linking validates and explains conclusions to the forensic investigator.
