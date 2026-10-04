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
  | 'USES'
  | 'CONNECTED_TO'
  | 'ACCESSED';

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
 * Reusable Cyber Twin Data Model exposed to visual components.
 */
export interface CyberTwinDataModel {
  case_id: string;
  events: BackendEvent[];
  entities: VisualizationEntity[];
  relationships: VisualizationRelationship[];
  evidence_map: Record<string, EvidenceTrace>;
  getEntityById?: (id: string) => VisualizationEntity | null;
  getEventsByEntity?: (entityId: string) => BackendEvent[];
  getEventsByEvidence?: (evidenceId: string) => BackendEvent[];
  getRelationshipsByEvent?: (eventId: string) => VisualizationRelationship[];
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
}

/**
 * IncidentTimeline Component Props.
 */
export interface IncidentTimelineProps {
  events: BackendEvent[];
  selectedEventId?: string | null;
  onEventSelect?: (event: BackendEvent) => void;
  height?: string | number;
  width?: string | number;
  title?: string;
}

/**
 * Master Synchronized InvestigationView Component Props.
 */
export interface InvestigationViewProps {
  model: CyberTwinDataModel;
  initialEventId?: string | null;
  onEventSelect?: (event: BackendEvent) => void;
  onNodeSelect?: (nodeData: CytoscapeNodeData) => void;
  onEdgeSelect?: (edgeData: CytoscapeEdgeData) => void;
  height?: string | number;
  width?: string | number;
}
