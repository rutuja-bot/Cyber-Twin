import { Finding } from '../types';
import { MOCK_FINDINGS } from '../mock/investigationData';
import { apiRequest } from './client';

function mapBackendFinding(bFind: any, caseId: string): Finding {
  const sev = (bFind.severity || 'high').toLowerCase();
  const validSev = ['critical', 'high', 'medium', 'low', 'info'].includes(sev) ? sev : 'high';

  return {
    finding_id: bFind.finding_id,
    case_id: bFind.case_id || caseId,
    title: bFind.title,
    description: bFind.description,
    severity: validSev as any,
    confidence: bFind.confidence !== undefined ? bFind.confidence : 0.95,
    event_ids: bFind.event_ids || [],
    evidence_ids: bFind.evidence_ids || ['EVD-001'],
    mitre_tactics: bFind.mitre_tactics || ['Privilege Escalation', 'Exfiltration'],
    mitre_techniques: bFind.mitre_techniques || ['T1078', 'T1048'],
    affected_entities: bFind.affected_entities || ['WORKSTATION-01', 'employee01'],
    recommendation: bFind.recommendation || 'Isolate compromised host and revoke user credentials immediately.'
  };
}

export async function getFindingsByCase(caseId: string): Promise<Finding[]> {
  const result = await apiRequest<any[]>(`/cases/${caseId}/findings`, {}, () =>
    MOCK_FINDINGS.filter((f) => f.case_id === caseId)
  );

  if (Array.isArray(result) && result.length > 0) {
    return result.map((f) => mapBackendFinding(f, caseId));
  }

  return MOCK_FINDINGS.filter((f) => f.case_id === caseId);
}

export async function getFindingById(findingId: string): Promise<Finding | undefined> {
  const all = await getFindingsByCase('CASE-001');
  return all.find((f) => f.finding_id === findingId) || MOCK_FINDINGS.find((f) => f.finding_id === findingId);
}
