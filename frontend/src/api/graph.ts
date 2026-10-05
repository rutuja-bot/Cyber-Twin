import { Entity, Relationship } from '../types';
import { MOCK_ENTITIES, MOCK_RELATIONSHIPS } from '../mock/investigationData';
import { apiRequest } from './client';

export interface GraphData {
  entities: Entity[];
  relationships: Relationship[];
}

export async function getGraphData(caseId: string): Promise<GraphData> {
  return apiRequest(`/cases/${caseId}/graph`, {}, () => ({
    entities: MOCK_ENTITIES.filter((e) => e.case_id === caseId || caseId === 'CASE-2026-0882'),
    relationships: MOCK_RELATIONSHIPS.filter((r) => r.case_id === caseId || caseId === 'CASE-2026-0882')
  }));
}
