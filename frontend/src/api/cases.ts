import { Case, InvestigationSummary } from '../types';
import { MOCK_CASES, MOCK_SUMMARY } from '../mock/investigationData';
import { apiRequest } from './client';

function mapBackendCase(bCase: any): Case {
  return {
    case_id: bCase.case_id,
    title: bCase.title || 'Unauthorized Access and Exfiltration Incident',
    description: bCase.description || 'Investigation into unauthorized credential access, lateral movement, and data exfiltration.',
    incident_type: bCase.incident_type || 'Data Exfiltration / Account Takeover',
    status: (bCase.status === 'open' || bCase.status === 'investigating' || bCase.status === 'closed')
      ? bCase.status
      : 'investigating',
    severity: bCase.severity || 'critical',
    created_at: bCase.created_at || '2026-10-04T10:00:00Z',
    last_activity: bCase.last_activity || '2026-10-04T10:55:00Z',
    investigator: bCase.investigator || 'Rutuja & Investigation Team',
    evidence_count: bCase.evidence_count !== undefined ? bCase.evidence_count : 5,
    suspicious_event_count: bCase.suspicious_event_count !== undefined ? bCase.suspicious_event_count : 6,
    entity_count: bCase.entity_count !== undefined ? bCase.entity_count : 7,
    date_range: bCase.date_range || {
      start: '2026-10-04T10:15:00Z',
      end: '2026-10-04T10:55:00Z'
    }
  };
}

export async function getCases(): Promise<Case[]> {
  const result = await apiRequest<any[]>('/cases', {}, () => MOCK_CASES);
  if (Array.isArray(result)) {
    return result.map(mapBackendCase);
  }
  return MOCK_CASES;
}

export async function getCaseById(caseId: string): Promise<Case | undefined> {
  const result = await apiRequest<any>(`/cases/${caseId}`, {}, () =>
    MOCK_CASES.find((c) => c.case_id === caseId) || MOCK_CASES[0]
  );
  return result ? mapBackendCase(result) : undefined;
}

export async function getCaseSummary(caseId: string): Promise<InvestigationSummary> {
  // Try to derive summary from /cases/{caseId}/reconstruction
  try {
    const recon = await apiRequest<any>(`/cases/${caseId}/reconstruction`, {}, () => null);
    if (recon && recon.case_id) {
      return {
        case_id: recon.case_id,
        total_evidence: 9,
        total_events: recon.total_events || (recon.events?.length ?? 6),
        suspicious_events: recon.events?.length ?? 6,
        compromised_entities: recon.graph?.nodes?.length ?? 7,
        attack_paths_count: 1,
        investigation_status: 'investigating',
        first_seen: '2026-10-04T10:15:00Z',
        last_seen: '2026-10-04T10:55:00Z',
        attack_vector: 'Credential Abuse & Exfiltration',
        kill_chain_progress: {
          initial_access: true,
          execution: true,
          persistence: true,
          privilege_escalation: true,
          lateral_movement: true,
          exfiltration: true
        }
      };
    }
  } catch (e) {
    // Fall back to mock
  }

  return MOCK_SUMMARY;
}

export async function createCase(newCase: Partial<Case>): Promise<Case> {
  const created: Case = {
    case_id: newCase.case_id || `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: newCase.title || 'Untitled Investigation',
    description: newCase.description || 'Investigation initiated by investigator.',
    incident_type: newCase.incident_type || 'Unclassified Cyber Incident',
    status: 'open',
    severity: newCase.severity || 'medium',
    created_at: new Date().toISOString(),
    last_activity: new Date().toISOString(),
    investigator: newCase.investigator || 'Rutuja & Investigation Team',
    evidence_count: 0,
    suspicious_event_count: 0,
    entity_count: 0,
    date_range: {
      start: new Date().toISOString(),
      end: new Date().toISOString()
    }
  };

  const res = await apiRequest(
    '/cases',
    {
      method: 'POST',
      body: JSON.stringify({
        case_id: created.case_id,
        title: created.title,
        description: created.description,
        status: created.status
      })
    },
    () => created
  );

  return mapBackendCase(res);
}
