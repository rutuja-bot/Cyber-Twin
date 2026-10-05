/**
 * Cyber Twin - Digital Forensics Shared Data Contracts
 * Defined according to docs/architecture/README.md
 */

export type CaseStatus = 'open' | 'investigating' | 'closed';
export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type EvidenceType =
  | 'auth_log'
  | 'endpoint_log'
  | 'server_log'
  | 'file_access_log'
  | 'firewall_log'
  | 'pcap'
  | 'sysmon'
  | 'disk_artifact'
  | 'memory_dump'
  | 'photo'
  | 'image'
  | 'video'
  | 'cctv'
  | 'physical'
  | 'document'
  | 'report'
  | string;
export type ProcessingStatus = 'parsed' | 'verified' | 'indexing' | 'pending';
export type EntityType = 'user' | 'workstation' | 'server' | 'ip_address' | 'file_object' | 'process';

export interface Case {
  case_id: string;
  title: string;
  description: string;
  incident_type: string;
  status: CaseStatus;
  severity: SeverityLevel;
  created_at: string;
  last_activity: string;
  investigator: string;
  evidence_count: number;
  suspicious_event_count: number;
  entity_count: number;
  date_range: {
    start: string;
    end: string;
  };
}

export interface Evidence {
  evidence_id: string;
  case_id: string;
  filename: string;
  type: EvidenceType;
  source: string;
  timestamp: string;
  hash: string; // SHA-256 integrity hash
  processing_status: ProcessingStatus;
  relevance: SeverityLevel;
  linked_event_ids: string[];
  location?: string;
  description?: string;
  collector?: string;
  media_path?: string;
  metadata: {
    file_size_kb?: number;
    sensor_id?: string;
    log_format?: string;
    raw_sample?: string;
    sha256_verified?: boolean;
    extracted_records?: number;
    opencv_analysis?: any;
    video_analysis?: any;
    document_analysis?: any;
    physical_evidence_record?: any;
    [key: string]: any;
  };
}

export interface NormalizedEvent {
  event_id: string;
  case_id: string;
  timestamp: string; // ISO 8601 UTC
  event_type:
    | 'login'
    | 'failed_login'
    | 'successful_auth'
    | 'file_access'
    | 'process_execution'
    | 'network_connection'
    | 'privilege_escalation'
    | 'suspicious_command'
    | 'data_exfiltration'
    | 'logout'
    | 'suspicious_login'
    | 'suspicious_process_spawn'
    | 'internal_server_connection'
    | 'sensitive_file_access'
    | 'suspicious_network_connection'
    | 'outbound_data_transfer'
    | string;
  actor: string;
  source_device: string;
  source_ip: string;
  destination_ip?: string;
  target_device?: string;
  file?: string;
  process_name?: string;
  command_line?: string;
  severity: SeverityLevel;
  evidence_id: string;
  evidence_line?: string;
  is_suspicious: boolean;
  description: string;
  mitre_technique?: string;
  mitre_technique_id?: string;
  mitre_technique_name?: string;
  stage?: string;
}

export interface Entity {
  entity_id: string;
  case_id: string;
  entity_type: EntityType;
  name: string;
  is_compromised: boolean;
  is_external?: boolean;
  metadata: {
    role?: string;
    department?: string;
    os?: string;
    ip?: string;
    reputation?: string;
    domain?: string;
    hash?: string;
    [key: string]: any;
  };
}

export interface Relationship {
  relationship_id: string;
  case_id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type:
    | 'AUTHENTICATED_TO'
    | 'CONNECTED_TO'
    | 'DOWNLOADED'
    | 'EXECUTED'
    | 'ACCESSED_FILE'
    | 'SPAWNED_PROCESS'
    | 'EXFILTRATED_TO'
    | 'RESOLVED_IP'
    | 'USES'
    | 'ACCESSED'
    | string;
  label: string;
  evidence_ids: string[];
  timestamp?: string;
  is_suspicious?: boolean;
}

export interface Finding {
  finding_id: string;
  case_id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  confidence: number; // 0.0 - 1.0
  event_ids: string[];
  evidence_ids: string[];
  mitre_tactics: string[];
  mitre_techniques: string[];
  affected_entities: string[];
  recommendation: string;
}

export interface ReplayEvent extends NormalizedEvent {
  sequence: number;
  playback_action: 'highlight_node' | 'draw_edge' | 'spawn_alert' | 'data_burst';
  active_entities: string[]; // entity IDs active in this step
  state_change_description: string;
}

export interface InvestigationSummary {
  case_id: string;
  total_evidence: number;
  total_events: number;
  suspicious_events: number;
  compromised_entities: number;
  attack_paths_count: number;
  investigation_status: CaseStatus;
  first_seen: string;
  last_seen: string;
  attack_vector: string;
  kill_chain_progress: {
    initial_access: boolean;
    execution: boolean;
    persistence: boolean;
    privilege_escalation: boolean;
    lateral_movement: boolean;
    exfiltration: boolean;
  };
}
