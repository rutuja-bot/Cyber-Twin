/**
 * Cyber Twin Visualization Types
 *
 * Defines the contract-bound data structures for the Cyber Twin Visualization Layer.
 * - BackendEvent: Strictly matches the v1 Event API contract agreed with Backend.
 * - VisualizationEntity, VisualizationRelationship: Derived strictly from BackendEvent.
 * - CytoscapeNodeData, CytoscapeEdgeData: Element contracts for Cytoscape.js graph rendering.
 * - IncidentTimelineProps: Prop contract for IncidentTimeline component.
 * - RelationshipGraphProps: Prop contract for RelationshipGraph component with synchronization.
 * - InvestigationViewProps: Prop contract for master synchronized InvestigationView component.
 */

/**
 * Common Backend Event v1 Contract.
 * IMPORTANT: Do NOT alter or add required fields to this structure.
 */
export interface BackendEvent {
  event_id: string;
  case_id: string;
  timestamp: string; // ISO-8601 string
  event_type: string;
  user: string | null;
  device: string | null;
  source_ip: string | null;
  destination_ip: string | null;
  file: string | null;
  server: string | null;
  evidence_id: string;
}

/**
 * Entity Types derived from BackendEvent fields.
 */
export type EntityType = 'user' | 'device' | 'ip' | 'file' | 'server';

/**
 * Derived Entity in the Cyber Twin visualization.
 */
export interface VisualizationEntity {
  id: string; // Namespaced key e.g. "user:employee01", "device:WORKSTATION-01"
  name: string; // Raw value e.g. "employee01"
  type: EntityType;
  first_seen: string;
  last_seen: string;
  event_ids: string[];
  evidence_ids: string[];
}

/**
 * Relationship Types derived from event interactions.
 */
export type RelationshipType =
  | 'AUTHENTICATED_TO'
  | 'RESOLVED_IP'
  | 'USES'
  | 'EXECUTED'
  | 'CONNECTED_TO'
  | 'ACCESSED'
  | 'EXFILTRATED_TO'
  | string;

/**
 * Derived Relationship in the Cyber Twin visualization.
 */
export interface VisualizationRelationship {
  id: string;
  source_id: string;
  target_id: string;
  type: RelationshipType;
  event_id: string;
  evidence_id: string;
  evidence_ids?: string[];
  timestamp: string;
}

/**
 * Evidence traceability entry.
 */
export interface EvidenceTrace {
  evidence_id: string;
  event_ids: string[];
  entity_ids: string[];
  timestamps: string[];
}

/**
 * Canonical Backend Timeline Item Contract.
 */
export interface BackendTimelineItem {
  timeline_event_id: string;
  event_id: string;
  sequence: number;
  timestamp: string;
  stage: string;
  technique: string;
  description: string;
  evidence_id: string | null;
}

/**
 * Canonical Backend Graph Node Contract.
 */
export interface BackendGraphNode {
  id: string;
  type: string;
  label: string;
  first_seen: string;
  last_seen: string;
  properties?: Record<string, any>;
}

/**
 * Canonical Backend Graph Edge Contract.
 */
export interface BackendGraphEdge {
  relationship_id: string;
  source: string;
  target: string;
  type: string;
  event_id: string;
  evidence_ids?: string[];
  timestamp: string;
}

/**
 * Canonical Backend Attack Stage Contract.
 */
export interface BackendAttackStage {
  stage_id: string;
  stage_name: string;
  tactic: string;
  technique_id: string;
  technique_name: string;
  event_ids: string[];
  summary: string;
}

/**
 * Canonical Backend Finding Contract.
 */
export interface BackendFinding {
  finding_id: string;
  case_id: string;
  title: string;
  description: string;
  severity: string;
  confidence: number;
  event_ids: string[];
  evidence_ids: string[];
}

/**
 * Canonical Full Backend Reconstruction Data Contract.
 */
export interface BackendReconstructionData {
  case_id: string;
  title?: string;
  status?: string;
  summary?: string;
  total_events?: number;
  timeline?: BackendTimelineItem[];
  graph?: {
    nodes: BackendGraphNode[];
    edges: BackendGraphEdge[];
  };
  attack_progression?: BackendAttackStage[];
  findings?: BackendFinding[];
  events?: BackendEvent[];
}

/**
 * Reusable Cyber Twin Data Model exposed to visual components.
 */
export interface CyberTwinDataModel {
  case_id: string;
  title?: string;
  status?: string;
  summary?: string;
  total_events?: number;
  events: BackendEvent[];
  timeline?: BackendTimelineItem[];
  attack_progression?: BackendAttackStage[];
  findings?: BackendFinding[];
  entities: VisualizationEntity[];
  relationships: VisualizationRelationship[];
  evidence_map: Record<string, EvidenceTrace>;
  getEntityById?: (id: string) => VisualizationEntity | null;
  getEventsByEntity?: (entityId: string) => BackendEvent[];
  getEventsByEvidence?: (evidenceId: string) => BackendEvent[];
  getRelationshipsByEvent?: (eventId: string) => VisualizationRelationship[];
  getTimelineItemByEvent?: (eventId: string) => BackendTimelineItem | null;
}

/**
 * Cytoscape Node Data Contract.
 */
export interface CytoscapeNodeData {
  id: string;
  label: string;
  entityType: EntityType;
  firstSeen: string;
  lastSeen: string;
  eventIds: string[];
  evidenceIds: string[];
}

/**
 * Cytoscape Edge Data Contract.
 */
export interface CytoscapeEdgeData {
  id: string;
  source: string;
  target: string;
  label: RelationshipType;
  relationshipType: RelationshipType;
  eventId: string;
  evidenceId: string;
  timestamp: string;
}

/**
 * RelationshipGraph Component Props.
 */
export interface RelationshipGraphProps {
  model: CyberTwinDataModel;
  selectedEventId?: string | null;
  onNodeSelect?: (nodeData: CytoscapeNodeData) => void;
  onEdgeSelect?: (edgeData: CytoscapeEdgeData) => void;
  onSelectionClear?: () => void;
  layoutName?: string;
  height?: string | number;
  width?: string | number;
  attackPathOnly?: boolean;
  attackPathNodeIds?: string[] | null;
  attackPathEdgeIds?: string[] | null;
}

/**
 * IncidentTimeline Component Props.
 */
export interface IncidentTimelineProps {
  events?: BackendEvent[];
  timeline?: BackendTimelineItem[] | null;
  selectedEventId?: string | null;
  onEventSelect?: (event: BackendEvent | BackendTimelineItem) => void;
  height?: string | number;
  width?: string | number;
  title?: string;
  attackPathOnly?: boolean;
  attackPathEventIds?: string[] | null;
}

/**
 * Master Synchronized InvestigationView Component Props.
 */
export interface InvestigationViewProps {
  model: CyberTwinDataModel;
  initialEventId?: string | null;
  initialAttackPathOnly?: boolean;
  onEventSelect?: (event: BackendEvent) => void;
  onNodeSelect?: (nodeData: CytoscapeNodeData) => void;
  onEdgeSelect?: (edgeData: CytoscapeEdgeData) => void;
  height?: string | number;
  width?: string | number;
}

/**
 * Incident Replay Engine Types & State Contracts.
 */
export type ReplaySpeed = 0.5 | 1 | 2 | 5;

export interface ReplayState {
  currentIndex: number;
  totalEvents: number;
  isPlaying: boolean;
  speed: ReplaySpeed;
}

/**
 * Attack Path Analysis Contract.
 */
export interface AttackPathAnalysis {
  attackEventIds: string[];
  benignEventIds: string[];
  attackNodeIds: string[];
  benignNodeIds: string[];
  attackEdgeIds: string[];
  benignEdgeIds: string[];
  summary: {
    totalEvents: number;
    attackEventsCount: number;
    benignEventsCount: number;
    totalNodes: number;
    attackNodesCount: number;
    benignNodesCount: number;
    totalEdges: number;
    attackEdgesCount: number;
    benignEdgesCount: number;
  };
}

/**
 * 3D Cyber Twin Infrastructure Contracts.
 */
export interface Zone3D {
  id: string;
  name: string;
  subnet: string;
  color: number;
  center: { x: number; y: number; z: number };
  size: { width: number; depth: number };
}

export interface Node3D {
  id: string;
  name: string;
  type: EntityType;
  zone: string;
  position: { x: number; y: number; z: number };
  spec: {
    geometryType: string;
    dimensions: number[];
    baseColor: number;
    emissiveColor: number;
    label: string;
    elevation?: number;
  };
  eventIds: string[];
  evidenceIds: string[];
}

export interface Link3D {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  eventId: string;
  evidenceId: string;
  timestamp: string;
  startPosition: { x: number; y: number; z: number };
  endPosition: { x: number; y: number; z: number };
}

export interface CyberTwin3DViewProps {
  model: CyberTwinDataModel;
  selectedEventId?: string | null;
  attackPathOnly?: boolean;
  attackPathNodeIds?: string[] | null;
  attackPathEdgeIds?: string[] | null;
  onNodeSelect?: (nodeData: Node3D) => void;
  height?: string | number;
  width?: string | number;
}
