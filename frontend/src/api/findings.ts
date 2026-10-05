import { Finding } from '../types';
import { MOCK_FINDINGS } from '../mock/investigationData';
import { apiRequest } from './client';

export async function getFindingsByCase(caseId: string): Promise<Finding[]> {
  return apiRequest(`/cases/${caseId}/findings`, {}, () =>
    MOCK_FINDINGS.filter((f) => f.case_id === caseId || caseId === 'CASE-2026-0882')
  );
}

export async function getFindingById(findingId: string): Promise<Finding | undefined> {
  return apiRequest(`/findings/${findingId}`, {}, () =>
    MOCK_FINDINGS.find((f) => f.finding_id === findingId)
  );
}
