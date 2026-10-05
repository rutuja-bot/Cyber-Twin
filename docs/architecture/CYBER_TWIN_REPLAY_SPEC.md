# Cyber Twin Visualization & Incident Replay Specification

**Document Status**: Specification / Working Draft
**Lead Author**: Person 4 — Cyber Twin Visualization & Replay Lead (Sakshi)
**Target Version**: She Solves 3.0 — Round 2 Architecture & Visualization Standard

---

## 1. Purpose

The purpose of this document is to define the functional, operational, and visual behavior of the **Cyber Twin Visualization and Incident Replay System**.

The Cyber Twin serves as the central visual and analytical abstraction of the project, allowing forensic investigators and evaluators to observe, explore, scrub through, and verify the reconstruction of a cyber incident from raw digital evidence to high-level attack vectors. This specification establishes a shared contract across all sub-disciplines (Backend, Forensics, Frontend, and Visualization) so that visual components reflect forensically sound, evidence-backed states.

---

## 2. Scope

This specification governs:
- The design, behavior, and synchronization of the five primary visual layers:
  1. Interactive Investigation Graph
  2. Chronological Timeline
  3. Attack Path Visualization
  4. Step-by-Step Incident Replay Engine
  5. 3D Digital Cyber Twin Visualization Layer
- The unified state machine driving investigator navigation and time-scrubbing.
- Strict bi-directional traceability between visual abstractions and original forensic evidence.
- Handling of ambiguous, incomplete, or unconfirmed forensic data.
- The minimal viable scope (MVP) for She Solves 3.0 Round 2 evaluation versus post-competition roadmap.

**Out of Scope**:
- Backend implementation code, database DDL/DML, and concrete query implementations.
- Finalized REST or WebSocket wire protocols (marked as TBD until agreed with Person 1).
- Physical crime scene modeling or real-world ballistic/spatial reconstruction unrelated to digital cyber infrastructure.

---

## 3. Cyber Twin Concept

The **Cyber Twin** is an integrated, state-aware digital representation of an enterprise environment undergoing or recovering from a cyber incident. Rather than presenting disconnected log tables, static network diagrams, or isolated alert lists, the Cyber Twin models the cyber incident as an evolving, multi-dimensional system.

```
       +--------------------------------------------------------+
       |                  Digital Evidence                      |
       |  (Raw logs, PCAP, disk artifacts, authentication dumps) |
       +--------------------------------------------------------+
                                   |
                                   v
       +--------------------------------------------------------+
       |               Processed & Normalized Events            |
       |    (Unified timestamp, event schema, normalized taxonomy)|
       +--------------------------------------------------------+
                                   |
                                   v
       +--------------------------------------------------------+
       |                   Evidence Mapping                     |
       |  (Entity extraction, cryptographic hashing, provenance)|
       +--------------------------------------------------------+
                                   |
                                   v
+======================================================================+
|                              CYBER TWIN                              |
|                                                                      |
|  +--------------------+   +---------------------+   +--------------+ |
|  | Interactive Graph  |   | Chronological Time  |   | Attack Path  | |
|  | (Topology/Entities)|   | (Ordered Milestones)|   | (Vector Flow)| |
|  +--------------------+   +---------------------+   +--------------+ |
|                                                                      |
|            +-------------------+     +------------------+            |
|            |  Incident Replay  |     | 3D Visualization |            |
|            |  (State Scrubbing)|     | (Digital Twin)   |            |
|            +-------------------+     +------------------+            |
+======================================================================+
```

The Cyber Twin links:
- **Entities**: Digital assets involved in the incident (Users, Hosts/Workstations, Servers, IP Addresses, Domains, Processes, Files, Credentials).
- **Events**: Atomic, timestamped actions (Authentication, Process Creation, File Modification, Network Connection, Lateral Movement).
- **Relationships**: Semantic connections between entities (e.g., `LOGGED_INTO`, `SPAWNED_PROCESS`, `MODIFIED_FILE`, `CONNECTED_TO`, `EXFILTRATED_DATA`).
- **Timestamps**: Normalized chronological sequence of execution.
- **Attack Paths**: Directed causal chains showing how the adversary moved from initial access to objective execution.
- **Evidence References**: Cryptographic and locational anchors directly pointing to the primary forensic artifact that substantiates each claim.

---

## 4. Visualization Components

The Cyber Twin user interface integrates five cohesive visual panels that remain synchronized at all times.

### 4.1 Interactive Investigation Graph
- **Role**: Provides a dynamic, topological view of all known incident entities and their observed interactions.
- **Nodes**:
  - Represent forensic entities: `User`, `Endpoint`, `Server`, `Internal IP`, `External IP`, `Process`, `File / Hash`.
  - Visual attributes: Distinct iconography, label, and risk/state styling (e.g., Clean/Neutral, Compromised/Attacker-controlled, Suspicious, Victim asset).
- **Edges**:
  - Represent semantic relationships and communications observed between entities.
  - Visual attributes: Directed arrows indicating action flow (e.g., Source IP $\rightarrow$ Target Port, User Account $\rightarrow$ Host Workstation).
  - Suspicious/Malicious Relationships: Distinct visual emphasis (e.g., highlighted alert color, dashed warning vectors, or pulsing activity rings) for high-confidence adversary actions.
- **Selection & Interaction**:
  - **Selecting a Node**: Highlights the entity, isolates its direct 1-hop and 2-hop neighborhood, filters the Chronological Timeline to events involving this entity, and opens the Entity Details side panel.
  - **Selecting an Edge**: Highlights the specific transaction, reveals the underlying event(s) that produced the relationship, and displays the exact forensic evidence reference in the Evidence Inspector.
  - **Evidence Linkage**: Every node and edge displays a direct badge/link to supporting raw evidence.

### 4.2 Chronological Timeline
- **Role**: Serves as the temporal spine of the investigation, ordering events strictly according to normalized forensic timestamps.
- **Ordered Events**: Sequenced sequentially along an interactive horizontal or vertical timeline scrubber.
- **Event Categories**: Color-coded and tagged by taxonomy (e.g., Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Lateral Movement, Exfiltration, Impact).
- **Selection & Synchronization**:
  - Selecting an event moves the global Cyber Twin state to that exact timestamp.
  - Highlights the corresponding source and target nodes and active edge in the Interactive Graph.
  - Automatically loads the exact supporting log record or file artifact in the Evidence Inspector.

### 4.3 Attack Path Visualization
- **Role**: Isolates the causal sequence of adversary behavior from background benign enterprise traffic.
- **Structure**:
  - Displays the directed multi-stage path: **Source Entity (Patient Zero / Ingress)** $\rightarrow$ **Intermediate Entities (Pivots, Relays, Compromised Credentials)** $\rightarrow$ **Target Entity (High-value database, Domain Controller, Exfiltration endpoint)**.
- **Representation**:
  - Emphasizes the critical path visually (e.g., glowing vector route or dedicated progression flow view).
  - Nodes on the attack path show attack phase identifiers (e.g., Step 1: Phish, Step 2: Privilege Escalation, Step 3: Lateral Movement).
- **Evidence References**: Each stage along the path links to the corroborating evidence ID, ensuring the attack chain is verifiable and not speculative.

### 4.4 Incident Replay Engine
- **Role**: Allows the investigator or judging panel to step forward, step backward, or auto-play through the incident as it unfolded over time.
- **Replay Controls**:
  - **Play / Pause**: Initiates automated chronological progression across the event sequence.
  - **Step Forward (Next Event)**: Advances the simulation by exactly one event frame.
  - **Step Backward (Previous Event)**: Reverts the simulation to the preceding event state.
  - **Replay Speed**: Configurable multiplier ($0.5\times$, $1\times$, $2\times$, $5\times$, or step-on-click).
  - **Timeline Scrubber Position**: Visual slider reflecting percentage progress and current timestamp.
- **Replay Dynamic State Changes**:
  - Active event is illuminated.
  - Entities that become compromised dynamically transition state in the graph (e.g., from uncompromised to compromised).
  - Newly traversed network or process edges trigger visual transmission effects.
  - The Evidence Panel updates synchronously to show the artifact backing the active replay frame.

### 4.5 3D Visualization Layer
- **Role**: Acts as a digital cyber environment reconstruction layer.
- **Explicit Boundary**: This is **NOT** a physical blood-splatter or real-world physical crime scene reconstruction tool. It represents the enterprise digital infrastructure in a spatial 3D paradigm.
- **Spatial Representation**:
  - Digital infrastructure nodes (e.g., corporate subnets, workstations, DMZ gateways, server racks, cloud VPCs) are positioned within a 3D isometric or spatial environment.
  - Threat vectors (lateral movement, network ingress, remote command execution, data exfiltration) render as spatial 3D data streams or transmission arcs connecting endpoints.
  - Active incident markers (e.g., 3D threat pins, alert beacons) highlight assets with detected forensic anomalies.
  - Smooth camera transitions focus on active hosts during Incident Replay.

---

## 5. Cyber Twin State

The Cyber Twin UI functions as a deterministic state machine driven by a unified state object. At any point in time during an investigation or replay, the system state includes:

| State Field | Description | Type / Nature |
|---|---|---|
| `selectedCaseId` | Active investigation or case identifier | Identifier string (To be finalized with Backend) |
| `currentTimestamp` | Normalized timestamp of current replay position | ISO-8601 String / Epoch milliseconds |
| `activeEventId` | Current focused event being examined or replayed | Identifier string (To be finalized with Backend) |
| `currentStepIndex` | Zero-based index within the total sequence of incident events | Integer ($0 \le \text{index} < N$) |
| `playbackStatus` | Current operational state of the replay engine | `IDLE` \| `PLAYING` \| `PAUSED` |
| `playbackSpeed` | Execution time multiplier | Float ($0.5$, $1.0$, $2.0$, $5.0$) |
| `visibleEntities` | Set of entity IDs discovered or present at the current timestamp | Set of Entity Identifiers |
| `compromisedEntities`| Entities flagged as compromised up to the current timestamp | Set of Entity Identifiers |
| `activeRelationships`| Graph edges active at or up to the current timestamp | Set of Relationship Identifiers |
| `selectedEntityId` | Currently clicked/inspected entity (if any) | Optional Identifier |
| `selectedEdgeId` | Currently clicked/inspected relationship (if any) | Optional Identifier |
| `selectedEvidenceId`| Forensic artifact currently loaded in the evidence panel | Optional Identifier |
| `activeAttackPath` | Ordered sequence of nodes/edges forming the chosen attack path | Ordered List of Node/Edge Identifiers |
| `filterCriteria` | Active investigator filters (severity, entity type, timeframe) | Filter parameters |

*Note: The exact JavaScript/TypeScript data interfaces and state store implementation will be finalized during UI implementation without modifying backend schemas.*

---

## 6. Data Dependencies

The Cyber Twin visual layers rely on structured data produced by the Forensic Engine (Person 2) and served via FastAPI (Person 1). The required data attributes are summarized below:

| Required Attribute | Role in Cyber Twin Visualization | Status / Contract |
|---|---|---|
| **Case / Investigation ID** | Namespaces the entire incident graph and replay sequence | To be finalized with Backend team (`TBD`) |
| **Event ID** | Unique reference for timeline item, graph trigger, and evidence linkage | To be finalized with Backend/Forensics (`TBD`) |
| **Normalized Timestamp** | Mandatory for chronological timeline ordering and step-by-step replay | To be finalized with Forensic Engine (`TBD`) |
| **Event Category / Type** | Determines icon, color code, and attack taxonomy phase | To be finalized with Forensic Engine (`TBD`) |
| **Source Entity Info** | ID, Name, Type (`User`, `Host`, `IP`, etc.), and initial state | To be finalized with Backend/DB (`TBD`) |
| **Target Entity Info** | ID, Name, Type (`Host`, `Service`, `File`, etc.), and resulting state | To be finalized with Backend/DB (`TBD`) |
| **Relationship / Action** | Edge label (e.g., `AUTHENTICATES`, `MODIFIES`, `EXFILTRATES`) | To be finalized with Forensic Engine (`TBD`) |
| **Confidence / Severity** | Flags suspicious vs benign edges; indicates reconstruction certainty | To be finalized with Forensic Engine (`TBD`) |
| **Evidence Reference(s)** | Pointer to evidence artifact ID, raw file path, log row index, or hash | To be finalized with Forensic Engine (`TBD`) |
| **Raw Artifact Snippet** | Text snippet / hex / log payload for the Evidence Inspector panel | To be finalized with Forensic Engine/Backend (`TBD`) |
| **Attack Path Flag / Sequence** | Identifies whether the event belongs to the primary attack path | To be finalized with Forensic Engine (`TBD`) |
| **Spatial / 3D Layout Hints** | Subnet, Zone (`DMZ`, `Internal`, `Cloud`), or asset coordinate | Visualization default layout (fallback if omitted) |

> **Requirement**: Exact endpoint routes, JSON payload envelopes, and query parameters remain **TBD** until finalized in `docs/api/API_CONTRACTS.md` with Person 1.

---

## 7. Evidence Traceability

A core requirement of digital forensics is the **Chain of Custody** and **Verifiability**. The Cyber Twin visualization strictly forbids disconnected visual assertions. Every high-level visual entity must be traceable back to supporting forensic data.

```
+--------------------------+
|  Interactive Graph Node  |
+--------------------------+
             |
             v (Click / Inspect)
+--------------------------+         +-------------------------------+
|     Correlated Event     | <-----> |   Chronological Timeline Item |
+--------------------------+         +-------------------------------+
             |
             v (Inspect Evidence)
+--------------------------------------------------------------------+
|                        Evidence Inspector                          |
|  - Evidence ID & File Origin (e.g., /data/raw/auth.log)            |
|  - Cryptographic Hash (SHA-256)                                    |
|  - Raw Log Extract / Artifact Hex / Metadata Record                |
|  - Ingestion & Normalization Timestamp                             |
+--------------------------------------------------------------------+
```

### Traceability Pathways
1. **Graph $\rightarrow$ Event $\rightarrow$ Evidence**:
   - Clicking an entity node lists all associated events involving that asset.
   - Clicking an edge opens the specific correlated event.
   - The user clicks **"View Evidence Source"** to view the raw log record, ingestion timestamp, and cryptographic hash in the Evidence Panel.
2. **Timeline $\rightarrow$ Evidence**:
   - Clicking an event in the chronological timeline exposes a collapsible Evidence Drawer showing the exact unnormalized log line or forensic dump entry from which the normalized event was derived.
3. **Attack Path $\rightarrow$ Evidence**:
   - Each hop in the attack path contains an evidence badge indicating the number of corroborating artifacts (e.g., `3 logs`, `1 pcap flow`). Clicking the badge opens the linked evidence modal.

---

## 8. Replay Behavior

When the replay state advances (either via playback timer or manual step navigation):

1. **Timeline**:
   - The scrubber moves to `currentTimestamp`.
   - The event card for `activeEventId` scrolls into view and receives an active highlight border.
   - Elapsed events display an "executed" visual state; future events remain visually muted.
2. **Interactive Graph**:
   - Source and target nodes for the active event pulse or highlight.
   - The active edge illuminates with an animated transmission effect (e.g., traveling particle or directional glow).
   - If the active event marks an asset compromise, the target node's visual badge transitions to "Compromised".
3. **Attack Path**:
   - If the active event belongs to the adversary attack path, the corresponding segment of the attack route lights up.
4. **3D Visualization Layer**:
   - The 3D scene camera focuses on the region or subnet containing the involved entities.
   - A spatial vector or data beam connects the 3D asset representations.
   - Evidence pins above the involved 3D nodes activate with alert indicators.
5. **Evidence Panel**:
   - Synchronously updates to display the primary forensic artifact supporting the newly active event.

---

## 9. User Interactions

The visualization interface accommodates the following primary investigator workflows:

- **Entity Inspection**: Clicking any node in the graph or 3D view pauses replay, displays entity metadata (IP, OS, hostname, role), and filters both timeline and evidence views to that entity.
- **Event Inspection**: Clicking any event card freezes the current replay frame at that event and triggers immediate graph/3D focus on the interacting entities.
- **Evidence Verification**: Selecting any "View Evidence" link opens an uneditable forensic viewer showing raw source lines, file hashes, and parser provenance.
- **Timeline Scrubbing**: Dragging the timeline slider smoothly seeks across time, dynamically recalculating the active graph state and visible connections for that moment.
- **Replay Execution**: Starting, pausing, or changing playback speed ($0.5\times$ to $5\times$) with standard media key controls.
- **Attack Path Isolation**: Toggling the "Show Attack Path Only" switch dims benign background nodes and edges in the graph, leaving only adversary-traversed entities visible.
- **Filter Controls**: Filtering events by severity (Critical, High, Medium, Low), event category (Authentication, File, Network, Process), or free-text entity search.

---

## 10. Missing / Uncertain Data Handling

In forensic investigations, evidence is frequently partial, log retention may have gaps, and event correlations may carry probabilistic confidence. The Cyber Twin must never misrepresent an assumption as a confirmed forensic fact.

| Condition | Visual Representation / UI Rule |
|---|---|
| **Missing Evidence** | If an event is inferred (e.g., an assumed intermediate pivot) but lacks direct log evidence, it must be flagged with an **"Inferred / Unverified"** badge, rendered with a dashed border, and marked in the Evidence Panel as *No direct evidence artifact available*. |
| **Incomplete Timestamps** | Events with partial timestamps (e.g., date known, exact second unknown) are grouped in an "Approximate Window" banner and visually separated from strictly sequenced events. |
| **Uncertain Relationships** | Graph edges with correlation confidence below a defined threshold (`TBD with Forensics`) are styled with dashed lines and lower opacity, displaying a "Low Confidence Correlation" tooltip upon hover. |
| **Conflicting Evidence** | When two log sources report conflicting timestamps or actions for the same entity, the UI displays a **Conflict Alert** icon, directing the investigator to review both sources in the Evidence Inspector. |

---

## 11. MVP Scope (Round 2 Realistic Target)

To guarantee a fully functional, reliable, and impressive demonstration for She Solves 3.0 Round 2, the visualization scope is prioritized as follows:

### Prioritized for Round 2 MVP (Must-Have):
- **Interactive Graph**: Robust 2D node-edge topology rendering (using a proven canvas/SVG graph library) with node/edge selection and entity highlight.
- **Chronological Timeline**: Interactive event list/slider with timestamp ordering, category coloring, and active event indicators.
- **Step-by-Step Replay Engine**: Working Play, Pause, Next Event, Previous Event, and Scrubber controls that synchronize graph, timeline, and evidence.
- **Attack Path Highlighting**: Ability to toggle and highlight the specific sequence of events comprising the primary incident story.
- **Evidence Inspector**: Functional side drawer/panel displaying raw log content, evidence ID, and hash for the currently selected event.
- **3D Visualization Demonstration**: A lightweight, focused 3D canvas (e.g., Three.js) representing key cyber infrastructure assets (subnets, servers, attacker ingress) with animated threat beams and active status pins during replay.

### Deprioritized for Round 2 (Not Blocking):
- Real-time physics simulation of massive graph clusters (>1,000 nodes).
- Automated AI natural-language speech-driven replay narration.
- Complex procedural 3D room/building geometry generation.

---

## 12. Future Scope

Post-Round 2 architectural enhancements include:
- **Immersive 3D/VR Cyber Twin**: Full room-scale digital twin of hybrid enterprise datacenters with real-time telemetry overlays.
- **Automated Multi-Path Branching**: Visualizing parallel lateral movement branches and competing hypotheses of attack progression.
- **Collaborative Investigation**: Multi-user session syncing where multiple forensic analysts can view and control the replay simultaneously.
- **Expanded Forensic Artifact Types**: Visual timeline integration for memory dumps, Volatility plugin outputs, and reverse-engineered binary disassembly traces.
- **AI-Assisted Investigation Assistant**: Generative explanations of active replay frames and predictive threat scoring for unconfirmed nodes.

---

## 13. Integration Dependencies

The Cyber Twin Visualization requires coordination across all four roles:

```
+--------------------------------------------------------------------------+
| Person 2: Forensic Analysis & AI Lead                                    |
| - Delivers normalized event stream, entity taxonomy, & evidence links    |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Person 1: Backend & Integration Lead                                     |
| - Exposes REST/WebSocket endpoints for cases, graph nodes, & timeline    |
| - Manages persistence in PostgreSQL and Neo4j                            |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Person 3: Frontend & Investigation UI Lead                               |
| - Builds application shell, case management dashboard, & layout grid     |
+--------------------------------------------------------------------------+
                                    |
                                    v
+--------------------------------------------------------------------------+
| Person 4: Cyber Twin Visualization & Replay Lead (Sakshi)                |
| - Implements Graph Canvas, Timeline Scrubber, Replay Engine, & 3D Layer  |
| - Connects visual components to state machine and evidence inspector     |
+--------------------------------------------------------------------------+
```

- **Dependency on Person 1 (Backend)**: Needs stable API contracts for fetching incident graph topology and ordered event replay frames (`TBD in docs/api/API_CONTRACTS.md`).
- **Dependency on Person 2 (Forensics)**: Needs clear event taxonomy, normalized timestamps, and consistent evidence ID references in sample incident data.
- **Dependency on Person 3 (Frontend)**: Needs clean UI panel integration and responsive container slots for graph, timeline, replay controls, and 3D canvas.

---

## 14. Acceptance Criteria

The Cyber Twin visualization will be considered functional and accepted for Round 2 when:

1. **Graph Rendering**: Loading a case renders all participating entities as distinct nodes and their recorded interactions as directed edges.
2. **Timeline Sequencing**: All parsed events appear in strict chronological order with clear category indicators.
3. **Synchronized Replay**: Clicking "Play" or "Next" advances the timeline, highlights the active event, animates the corresponding graph edge, updates the 3D cyber asset state, and updates the evidence panel.
4. **Evidence Traceability**: Clicking any event or graph edge displays the original evidence record, its file origin, and its integrity status in the Evidence Panel.
5. **Attack Path Clarity**: Toggling the attack path clearly distinguishes the breach progression from non-malicious background interactions.
6. **Uncertainty Transparency**: Inferred or low-confidence events are visually distinguished from hard evidence without ambiguity.
7. **3D Demonstration**: The 3D layer loads an interactive cyber environment, positions key digital nodes, and reflects incident activity in sync with the 2D graph and replay engine.
