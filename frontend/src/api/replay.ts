import { ReplayEvent } from '../types';
import { MOCK_REPLAY_EVENTS } from '../mock/investigationData';
import { apiRequest } from './client';

const CANONICAL_REPLAY_METADATA: Record<string, {
  event_type: string;
  actor: string;
  source_device: string;
  source_ip: string;
  destination_ip?: string;
  active_entities: string[];
  playback_action: 'highlight_node' | 'draw_edge' | 'spawn_alert' | 'data_burst';
  severity: 'critical' | 'high' | 'medium' | 'low';
}> = {
  'EVT-001': {
    event_type: 'suspicious_login',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    active_entities: ['user:employee01', 'device:WORKSTATION-01', 'ip:192.168.1.20'],
    playback_action: 'draw_edge',
    severity: 'high'
  },
  'EVT-002': {
    event_type: 'suspicious_process_spawn',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    active_entities: ['user:employee01', 'device:WORKSTATION-01', 'file:powershell.exe'],
    playback_action: 'highlight_node',
    severity: 'critical'
  },
  'EVT-003': {
    event_type: 'internal_server_connection',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    active_entities: ['device:WORKSTATION-01', 'server:SRV-CORP-FILE'],
    playback_action: 'draw_edge',
    severity: 'high'
  },
  'EVT-004': {
    event_type: 'sensitive_file_access',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    active_entities: ['user:employee01', 'file:\\SRV-CORP-FILE\\confidential\\customer_data.csv'],
    playback_action: 'spawn_alert',
    severity: 'critical'
  },
  'EVT-005': {
    event_type: 'suspicious_network_connection',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    destination_ip: '198.51.100.24',
    active_entities: ['device:WORKSTATION-01', 'ip:198.51.100.24'],
    playback_action: 'draw_edge',
    severity: 'high'
  },
  'EVT-006': {
    event_type: 'outbound_data_transfer',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    destination_ip: '198.51.100.24',
    active_entities: ['device:WORKSTATION-01', 'ip:198.51.100.24'],
    playback_action: 'data_burst',
    severity: 'critical'
  }
};

function mapTimelineToReplayEvent(tlItem: any, index: number, caseId: string): ReplayEvent {
  const eventId = tlItem.event_id || `EVT-00${index + 1}`;
  const canonical = CANONICAL_REPLAY_METADATA[eventId];
  const stage = (tlItem.stage || 'execution').toLowerCase();

  let playbackAction: 'highlight_node' | 'draw_edge' | 'spawn_alert' | 'data_burst' = 'highlight_node';
  if (canonical?.playback_action) {
    playbackAction = canonical.playback_action;
  } else if (stage.includes('lateral') || stage.includes('access') || stage.includes('connection')) {
    playbackAction = 'draw_edge';
  } else if (stage.includes('exfil') || stage.includes('transfer')) {
    playbackAction = 'data_burst';
  } else if (stage.includes('privilege') || stage.includes('collection')) {
    playbackAction = 'spawn_alert';
  }

  return {
    event_id: eventId,
    case_id: caseId,
    timestamp: tlItem.timestamp || new Date().toISOString(),
    event_type: canonical?.event_type || tlItem.event_type || 'process_execution',
    actor: canonical?.actor || tlItem.actor || 'employee01',
    source_device: canonical?.source_device || tlItem.source_device || 'WORKSTATION-01',
    source_ip: canonical?.source_ip || tlItem.source_ip || '192.168.1.20',
    destination_ip: canonical?.destination_ip || tlItem.destination_ip,
    severity: canonical?.severity || 'high',
    evidence_id: tlItem.evidence_id || 'EVD-001',
    is_suspicious: true,
    description: tlItem.description || `Reconstruction step: ${tlItem.stage}`,
    mitre_technique: tlItem.technique || 'T1059',
    sequence: tlItem.sequence || index + 1,
    playback_action: playbackAction,
    active_entities: canonical?.active_entities || ['user:employee01', 'device:WORKSTATION-01'],
    state_change_description: `Stage: ${tlItem.stage} - ${tlItem.technique || ''}`
  };
}

export async function getReplayEvents(caseId: string): Promise<ReplayEvent[]> {
  const result = await apiRequest<any[]>(
    `/cases/${caseId}/reconstruction/timeline`,
    {},
    () => MOCK_REPLAY_EVENTS.filter((re) => re.case_id === caseId)
  );

  if (Array.isArray(result) && result.length > 0) {
    return result.map((item, idx) => mapTimelineToReplayEvent(item, idx, caseId));
  }

  return MOCK_REPLAY_EVENTS.filter((re) => re.case_id === caseId);
}
