/**
 * Cyber Twin Visualization Types
 * 
 * Defines the contract-bound data structures for the Cyber Twin Visualization Layer.
 * - BackendEvent: Strictly matches the v1 Event API contract agreed with Backend.
 * - VisualizationEntity, VisualizationRelationship: Derived strictly from BackendEvent.
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
}

