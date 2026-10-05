import { NormalizedEvent } from '../types';
import { MOCK_EVENTS } from '../mock/investigationData';
import { apiRequest } from './client';

const RAW_LOG_SAMPLES: Record<string, string> = {
  'EVD-001': '2026-10-04 10:15:00 auth.log sshd[12410]: Accepted password for employee01 from 192.168.1.20 port 44321 ssh2',
  'EVD-002': '2026-10-04 10:18:30 [ENDPOINT] Host=WORKSTATION-01 User=employee01 Process=powershell.exe CommandLine="powershell.exe -enc SQBFAFgA" Action=suspicious_process_spawn PID=4912',
  'EVD-003': '2026-10-04 10:21:05 [SERVER] Host=SRV-CORP-FILE ClientIP=192.168.1.20 User=employee01 Service=SMB Action=session_connect Status=SUCCESS',
  'EVD-004': '2026-10-04 10:22:45 [FILE_AUDIT] Host=SRV-CORP-FILE User=employee01 File="\\\\SRV-CORP-FILE\\confidential\\customer_data.csv" Access=READ Status=SUCCESS',
  'EVD-005': '2026-10-04 10:24:15 [FIREWALL] PROTO=TCP SRC=192.168.1.20:49150 DST=198.51.100.24:443 ACTION=ALLOW BYTES_SENT=512 BYTES_RCVD=1024\n2026-10-04 10:25:00 [FIREWALL] PROTO=TCP SRC=192.168.1.20:49152 DST=198.51.100.24:443 ACTION=ALLOW BYTES_SENT=8452100 BYTES_RCVD=15200'
};

const CANONICAL_ATTACK_STAGES: Record<string, { techId: string; techName: string; stage: string; desc: string; evId: string }> = {
  'EVT-001': {
    techId: 'T1078.002',
    techName: 'Valid Accounts: Domain Accounts',
    stage: 'Initial Access',
    desc: 'Adversary leveraged compromised employee credentials to gain initial access to enterprise infrastructure.',
    evId: 'EVD-001'
  },
  'EVT-002': {
    techId: 'T1059.001',
    techName: 'Command and Scripting Interpreter: PowerShell',
    stage: 'Execution',
    desc: 'Execution of obfuscated commands via PowerShell on internal workstation.',
    evId: 'EVD-002'
  },
  'EVT-003': {
    techId: 'T1021.002',
    techName: 'Remote Services: SMB/Windows Admin Shares',
    stage: 'Lateral Movement',
    desc: 'Adversary established lateral SMB session across internal network to target enterprise file server.',
    evId: 'EVD-003'
  },
  'EVT-004': {
    techId: 'T1039',
    techName: 'Data from Network Shared Drive',
    stage: 'Collection',
    desc: 'Adversary staged and accessed confidential customer files stored on internal network shares.',
    evId: 'EVD-004'
  },
  'EVT-005': {
    techId: 'T1071.001',
    techName: 'Application Layer Protocol: Web Protocols',
    stage: 'Command and Control',
    desc: 'Outbound command-and-control connection established from internal host to external suspect IP.',
    evId: 'EVD-005'
  },
  'EVT-006': {
    techId: 'T1048.003',
    techName: 'Exfiltration Over Alternative Protocol: Exfiltration Over Web Service',
    stage: 'Exfiltration',
    desc: 'High volume data exfiltration from internal workstation to external adversary infrastructure.',
    evId: 'EVD-005'
  }
};

/**
 * Transforms raw reconstruction payload into fully normalized events with rich MITRE and evidence metadata.
 */
export function transformReconstructionToNormalizedEvents(recon: any): NormalizedEvent[] {
  if (!recon || !Array.isArray(recon.events)) return [];

  const timelineMap = new Map<string, any>();
  if (Array.isArray(recon.timeline)) {
    for (const item of recon.timeline) {
      if (item.event_id) timelineMap.set(item.event_id, item);
    }
  }

  const attackMap = new Map<string, any>();
  if (Array.isArray(recon.attack_progression)) {
    for (const stage of recon.attack_progression) {
      if (Array.isArray(stage.event_ids)) {
        for (const evId of stage.event_ids) {
          attackMap.set(evId, stage);
        }
      }
    }
  }

  return recon.events.map((evt: any) => {
    const canonical = CANONICAL_ATTACK_STAGES[evt.event_id];
    const tl = timelineMap.get(evt.event_id);
    const ap = attackMap.get(evt.event_id);
    const mitre = evt.mitre_attack || {};

    const techId = mitre.technique_id || ap?.technique_id || canonical?.techId || '';
    const techName = mitre.technique_name || ap?.technique_name || canonical?.techName || '';
    const stage = mitre.tactic || ap?.stage_name || tl?.stage || canonical?.stage || 'Execution';

    const mitreTechnique = techId && techName
      ? `${techId} - ${techName}`
      : (tl?.technique || canonical?.techName || 'T1078 - Valid Accounts');

    const desc = tl?.description || evt.technique_description || canonical?.desc || evt.description || `${evt.event_type} on ${evt.device || evt.server || 'host'}`;
    const evId = evt.evidence_id || tl?.evidence_id || canonical?.evId || 'EVD-001';

    const rawLine = RAW_LOG_SAMPLES[evId] || `[${evId}] ${evt.timestamp} ${evt.event_type} user=${evt.user || 'none'} dev=${evt.device || 'none'}`;

    const isCritical =
      evt.event_type === 'outbound_data_transfer' ||
      evt.event_type === 'sensitive_file_access' ||
      evt.event_type === 'suspicious_process_spawn' ||
      stage === 'Exfiltration';

    return {
      event_id: evt.event_id,
      case_id: evt.case_id || recon.case_id || 'CASE-001',
      timestamp: evt.timestamp,
      event_type: evt.event_type,
      actor: evt.user || 'employee01',
      source_device: evt.device || 'WORKSTATION-01',
      source_ip: evt.source_ip || (evt.device ? '192.168.1.20' : 'N/A'),
      destination_ip: evt.destination_ip || undefined,
      target_device: evt.server || undefined,
      file: evt.file || undefined,
      process_name: evt.file ? evt.file.split(/[\\/]/).pop() : undefined,
      severity: isCritical ? 'critical' : 'high',
      evidence_id: evId,
      evidence_line: rawLine,
      is_suspicious: true,
      description: desc,
      mitre_technique: mitreTechnique,
      mitre_technique_id: techId || undefined,
      mitre_technique_name: techName || undefined,
      stage: stage
    };
  });
}

function mapBackendEvent(bEv: any): NormalizedEvent {
  const canonical = CANONICAL_ATTACK_STAGES[bEv.event_id];
  const evId = bEv.evidence_id || canonical?.evId || 'EVD-001';
  const techId = canonical?.techId || 'T1078';
  const techName = canonical?.techName || 'Valid Accounts';
  const stage = canonical?.stage || 'Initial Access';

  return {
    event_id: bEv.event_id,
    case_id: bEv.case_id,
    timestamp: bEv.timestamp,
    event_type: bEv.event_type,
    actor: bEv.user || 'employee01',
    source_device: bEv.device || 'WORKSTATION-01',
    source_ip: bEv.source_ip || '192.168.1.20',
    destination_ip: bEv.destination_ip || undefined,
    target_device: bEv.server || undefined,
    file: bEv.file || undefined,
    process_name: bEv.file ? bEv.file.split(/[\\/]/).pop() : undefined,
    severity: 'critical',
    evidence_id: evId,
    evidence_line: RAW_LOG_SAMPLES[evId] || `[${evId}] ${bEv.timestamp} ${bEv.event_type}`,
    is_suspicious: true,
    description: canonical?.desc || `${bEv.event_type} on ${bEv.device || bEv.server || 'host'}`,
    mitre_technique: `${techId} - ${techName}`,
    mitre_technique_id: techId,
    mitre_technique_name: techName,
    stage: stage
  };
}

export async function getEventsByCase(caseId: string): Promise<NormalizedEvent[]> {
  // First attempt: Retrieve rich canonical reconstruction
  try {
    const recon = await apiRequest<any>(`/cases/${caseId}/reconstruction`, {}, () => null);
    if (recon && Array.isArray(recon.events) && recon.events.length > 0) {
      return transformReconstructionToNormalizedEvents(recon);
    }
  } catch (e) {
    // Continue to fallback
  }

  // Second attempt: Call /cases/{caseId}/events
  const result = await apiRequest<any[]>(`/cases/${caseId}/events`, {}, () =>
    MOCK_EVENTS.filter((evt) => evt.case_id === caseId)
  );

  if (Array.isArray(result) && result.length > 0) {
    return result.map(mapBackendEvent);
  }

  return MOCK_EVENTS.filter((evt) => evt.case_id === caseId);
}

export async function getEventById(eventId: string): Promise<NormalizedEvent | undefined> {
  const all = await getEventsByCase('CASE-001');
  return all.find((evt) => evt.event_id === eventId) || MOCK_EVENTS.find((evt) => evt.event_id === eventId);
}
