import { ReplayEvent } from '../types';
import { MOCK_REPLAY_EVENTS } from '../mock/investigationData';
import { apiRequest } from './client';

export async function getReplayEvents(caseId: string): Promise<ReplayEvent[]> {
  return apiRequest(`/cases/${caseId}/replay`, {}, () =>
    MOCK_REPLAY_EVENTS.filter((re) => re.case_id === caseId || caseId === 'CASE-2026-0882')
  );
}
