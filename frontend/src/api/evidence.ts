import { Evidence } from '../types';
import { MOCK_EVIDENCE } from '../mock/investigationData';
import { apiRequest } from './client';

export async function getEvidenceByCase(caseId: string): Promise<Evidence[]> {
  return apiRequest(`/cases/${caseId}/evidence`, {}, () =>
    MOCK_EVIDENCE.filter((e) => e.case_id === caseId || caseId === 'CASE-2026-0882')
  );
}

export async function getEvidenceById(evidenceId: string): Promise<Evidence | undefined> {
  return apiRequest(`/evidence/${evidenceId}`, {}, () =>
    MOCK_EVIDENCE.find((e) => e.evidence_id === evidenceId)
  );
}
