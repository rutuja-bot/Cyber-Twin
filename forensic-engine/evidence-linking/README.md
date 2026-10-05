# Forensic Engine — Evidence Linking

## Overview
Evidence Linking is responsible for maintaining provenance and bidirectional traceability from investigator-facing outputs back to their supporting digital evidence.

While **Evidence Mapping** operates forward during the processing pipeline (connecting raw evidence to events and entities), **Evidence Linking** operates from investigation results backward to establish verifiable proof and evidentiary backing.

---

## Architectural Role in Cyber Twin Pipeline

Evidence Linking consumes reconstructed incident data to associate investigator-facing findings with underlying evidence artifacts:

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

> **Important Clarification**: Evidence Linking consumes the reconstructed event, entity, and relationship data to link investigator-facing outputs with their source evidence. It is **not** a second evidence-processing pipeline and does not duplicate parsing or mapping.

---

## Core Responsibility & Directionality

Evidence Linking answers the fundamental forensic question:

$$\textbf{"What evidence supports this investigation result?"}$$

### Directionality Flow
```text
Finding / Graph Node / Timeline Event / Replay Event
                         ↓
                 Supporting Evidence
```

### Traceability Examples
- **Forensic Finding**: `Finding F001` (Unauthorized Privilege Escalation) $\rightarrow$ `EVT004` (Admin group modification) $\rightarrow$ `EVD007` (Security audit event log).
- **Timeline Event**: `Timeline Event EVT004` $\rightarrow$ `EVD007` (Exact log line and timestamp).
- **Graph Relationship**: `Graph Relationship R012` (Workstation B $\xrightarrow{\text{lateral movement}}$ Server A) $\rightarrow$ `EVD007` (Windows Event 4624) + `EVD009` (Zeek network flow log).
- **Replay Event**: `Replay Event RE005` $\rightarrow$ `EVT004` $\rightarrow$ `EVD007`.

---

## Capabilities Enabled
- **Explainability**: Every alert, edge, and attack path in the Cyber Twin is explained through tangible artifacts.
- **Evidence Traceability**: Maintains an unbroken chain of custody from user interface clicks back to raw log bytes.
- **Investigator Verification**: Allows digital forensic investigators to audit conclusions and independently verify event parameters.
- **Forensic Reporting**: Automatically populates generated forensic reports with exact evidentiary references, SHA-256 hashes, and log snippets.
- **Source References**: Provides instant source lookups for legal defensibility.

---

## Distinction: Evidence Mapping vs. Evidence Linking

| Attribute | Evidence Mapping (`evidence-mapping/`) | Evidence Linking (`evidence-linking/`) |
| :--- | :--- | :--- |
| **Pipeline Stage** | Pre-correlation (forward processing) | Post-reconstruction (presentation & reporting) |
| **Direction** | $\text{Evidence} \rightarrow \text{Events} \rightarrow \text{Entities} \rightarrow \text{Relationships}$ | $\text{Investigation Output} \rightarrow \text{Supporting Evidence}$ |
| **Primary Question** | *"Which evidence produced this event, and what entities are involved?"* | *"What evidence proves and justifies this investigation result?"* |
| **Primary Consumers** | Correlation Engine, Graph Ingestion | Relationship Graph, Timeline, Replay, Forensic Report |
