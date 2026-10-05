import { NormalizedEvent } from '../types';
import { MOCK_EVENTS } from '../mock/investigationData';
import { apiRequest } from './client';

export async function getEventsByCase(caseId: string): Promise<NormalizedEvent[]> {
  return apiRequest(`/cases/${caseId}/events`, {}, () =>
    MOCK_EVENTS.filter((evt) => evt.case_id === caseId || caseId === 'CASE-2026-0882')
  );
}

export async function getEventById(eventId: string): Promise<NormalizedEvent | undefined> {
  return apiRequest(`/events/${eventId}`, {}, () =>
    MOCK_EVENTS.find((evt) => evt.event_id === eventId)
  );
}
