import { Case, InvestigationSummary } from '../types';
import { MOCK_CASES, MOCK_SUMMARY } from '../mock/investigationData';
import { apiRequest } from './client';

export async function getCases(): Promise<Case[]> {
  return apiRequest('/cases', {}, () => MOCK_CASES);
}

export async function getCaseById(caseId: string): Promise<Case | undefined> {
  return apiRequest(`/cases/${caseId}`, {}, () =>
    MOCK_CASES.find((c) => c.case_id === caseId) || MOCK_CASES[0]
  );
}

export async function getCaseSummary(caseId: string): Promise<InvestigationSummary> {
  return apiRequest(`/cases/${caseId}/summary`, {}, () => MOCK_SUMMARY);
}

export async function createCase(newCase: Partial<Case>): Promise<Case> {
  const created: Case = {
    case_id: `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    title: newCase.title || 'Untitled Investigation',
    description: newCase.description || 'Investigation initiated by investigator.',
    incident_type: newCase.incident_type || 'Unclassified Cyber Incident',
    status: 'open',
    severity: newCase.severity || 'medium',
    created_at: new Date().toISOString(),
    last_activity: new Date().toISOString(),
    investigator: newCase.investigator || 'Agent Person 3',
    evidence_count: 0,
    suspicious_event_count: 0,
    entity_count: 0,
    date_range: {
      start: new Date().toISOString(),
      end: new Date().toISOString()
    }
  };

  return apiRequest(
    '/cases',
    {
      method: 'POST',
      body: JSON.stringify(created)
    },
    () => created
  );
}
