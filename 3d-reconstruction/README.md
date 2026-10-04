# 3D Reconstruction — Supporting Visualization Layer

## Overview
This directory houses 3D modeling assets, scene templates, and export utilities for Cyber Twin.

> **CRITICAL ARCHITECTURAL PRINCIPLE**:  
> The 3D component is an **OPTIONAL / SUPPORTING VISUALIZATION LAYER** of the Cyber Twin.  
> It is **NOT** the core investigation engine and **NOT** the primary reconstruction mechanism.  
> Cyber Twin is a **cyber incident and digital forensics investigation system**, not a physical crime scene reconstruction tool.

The 3D layer does **not** replace:
- Log analysis
- Evidence processing
- Evidence mapping
- Event correlation
- Timeline reconstruction
- Relationship graph exploration
- Investigation replay

---

## Role of 3D in Cyber Twin

The 3D visualization layer provides spatial and visual representation for selected reconstructed cyber infrastructure entities and contextual incident telemetry where useful:

- **Cyber Infrastructure**: Visualizing servers, racks, workstations, endpoints, and network nodes.
- **Evidence & Event Markers**: Placing visual indicators corresponding to specific cyber events on affected machines.
- **Entity Linkages**: Displaying visual cues and connections between compromised systems along an attack path.
- **Spatial / Location Context**: Representing logical/topological floor or rack placements if such physical or asset-management location data exists in the collected evidence.

### Data Flow

The 3D visualization layer is strictly a downstream consumer of data that has already been processed and reconstructed:

```text
Forensic Engine
      ↓
Evidence Mapping
      ↓
Incident Reconstruction
      ↓
Backend API
      ↓
Frontend (Three.js)
      ↓
[Optional 3D Visualization]
```

The 3D layer **never** independently performs forensic analysis or event correlation.

---

## Round 2 MVP Scope

### In Scope for Prototype MVP
- **Basic 3D Visualization**: Lightweight rendering of key infrastructure components in the web frontend via Three.js.
- **Cyber Entity Representation**: Generic representations for servers, workstations, routers, and compromised hosts.
- **Evidence / Event Markers**: Visual pins or indicators tagged with stable `event_id` and `evidence_id` keys.
- **Visual Relationships**: Simple directional links between selected compromised entities.
- **Element-to-Evidence Linkage**: Interactive selection of 3D nodes to highlight corresponding log entries and timeline events.
- **Blender Preparation**: Preparing simple, lightweight glTF/GLB models for web consumption.
- **Modular Extensibility**: Clean separation so additional spatial visualization can be introduced without impacting core investigation engines.

### Out of Scope for Round 2
- Full photogrammetry or 3D scanning.
- Physical crime-scene or bloodstain/ballistics reconstruction.
- CCTV-to-3D automated reconstruction.
- Physics simulations or highly detailed architectural rendering.
- Autonomous 3D generation from raw crime scene photographs.
- Independent forensic correlation logic inside the 3D module.
- Duplicate timeline, replay, or evidence mapping engines.
- Standalone 3D backend microservice.

---

## Directory Organization
- `blender/`: Blender scripts and asset-pipeline workflows for exporting lightweight models.
- `models/`: Exported 3D model files (glTF, GLB) for cyber infrastructure entities and markers.
- `assets/`: Textures, materials, and environment maps for 3D rendering.
