# 3D Reconstruction — Cyber Environment Visualization

## Overview
This directory houses 3D modeling assets, scene configurations, and export pipelines for the Cyber Twin 3D visualization view.

3D is an integral visualization component of the Cyber Twin that provides a **spatial representation of the reconstructed cyber environment and IT infrastructure**. It is not a physical crime-scene investigation system, nor is it an isolated afterthought; rather, it represents the physical/topological layer of the digital investigation alongside the relationship graph and chronological timeline.

---

## Architectural Role in Cyber Twin

The Cyber Twin investigation system exposes four primary investigation views in the frontend:
1. **Relationship Graph**: Entity and attack path topological exploration.
2. **Chronological Timeline**: Step-by-step incident evolution.
3. **Investigation Replay**: Interactive chronological playback of attack actions.
4. **3D Cyber Environment / Infrastructure View**: Spatial representation of affected hosts, network layout, and incident progression.

### End-to-End Data Flow

The 3D view strictly consumes reconstructed Cyber Twin data:

```text
Digital Evidence
      ↓
Forensic Engine
      ↓
Evidence Mapping
      ↓
Event Correlation
      ↓
Incident Reconstruction
      ↓
Cyber Twin Data
      ↓
Backend API
      ↓
Frontend
      ↓
┌─────────────────┬──────────────────┬─────────────────┐
│  Relationship   │   Chronological  │    3D Cyber     │
│  Graph          │   Timeline       │   Environment   │
└─────────────────┴──────────────────┴─────────────────┘
                           ↓
                   Investigation Replay
```

> **Strict Architectural Boundary**: The 3D view **never** independently performs log parsing, evidence processing, event correlation, forensic analysis, timeline generation, or evidence mapping. It is purely an interactive visualization of the reconstructed cyber incident.

---

## Represented Entities & Spatial Topologies

The 3D Cyber Environment visualizes the assets and entities identified during incident reconstruction:
- **Core Entities**: Users, endpoints, workstations, on-premise/cloud servers, routers, firewalls, and external IP/network nodes.
- **Incident Events & Indicators**: Affected systems visually highlighted with status indicators (compromised, beaconing, lateral movement target).
- **Evidence Markers**: Visual 3D pins placed on affected nodes, linking directly to underlying `evidence_id` and `event_id` records.
- **Attack Paths & Linkages**: Spatial connection lines illustrating malicious actions (e.g., suspicious connections, data exfiltration, privilege escalation).

### Visual Layout Examples

```text
[Server A] ─── (suspicious connection) ───► [Workstation B] ───► [External IP: C2]
```
or
```text
[Compromised User]
       ↓
[Workstation B] (Initial Access / Phishing)
       ↓
[Domain Controller / Server A] (Privilege Escalation / Lateral Movement)
       ↓
[External IP: 198.51.100.24] (Data Exfiltration)
```

---

## Technology Stack & Scope

- **Frontend Visualization**: **Three.js** in the React application renders the interactive 3D canvas, handles camera navigation, node selection, and event marker tooltips.
- **Model Preparation**: **Blender** is used exclusively for authoring and optimizing lightweight, low-poly 3D models (glTF/GLB) representing hardware assets (racks, servers, workstations, routers).

### Out of Scope
To maintain focus on digital forensic investigation capabilities, the following are strictly excluded:
- Photogrammetry or 3D laser scanning.
- Physical crime-scene, ballistics, or bloodstain reconstruction.
- CCTV footage 3D spatial extraction.
- Complex physics simulations.
- Standalone 3D backend microservices.

---

## Subdirectories
- `blender/`: Scripts and asset preparation pipelines for exporting lightweight 3D models.
- `models/`: Production glTF/GLB 3D model assets for cyber infrastructure and evidence markers.
- `assets/`: Textures, materials, and environment settings.
