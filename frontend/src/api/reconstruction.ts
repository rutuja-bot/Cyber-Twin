/**
 * Cyber Twin Incident Reconstruction API
 * Calls GET /cases/{case_id}/reconstruction, GET /cases/{case_id}/reconstruction/graph,
 * and GET /cases/{case_id}/reconstruction/timeline on the FastAPI backend.
 */

import { apiRequest } from './client';
import { mockEvents, createCyberTwinDataModel } from '../visualization';

export interface BackendReconstructionData {
  case_id: string;
  title: string;
  status: string;
  summary: string;
  total_events: number;
  timeline: Array<{
    timeline_event_id: string;
    event_id: string;
    sequence: number;
    timestamp: string;
    stage: string;
    technique: string;
    description: string;
    evidence_id?: string;
  }>;
  graph: {
    nodes: Array<{
      id: string;
      type: string;
      label: string;
      first_seen: string;
      last_seen: string;
      properties?: Record<string, any>;
    }>;
    edges: Array<{
      relationship_id: string;
      source: string;
      target: string;
      type: string;
      event_id: string;
      evidence_ids: string[];
      timestamp: string;
    }>;
  };
  attack_progression: Array<{
    stage_id: string;
    stage_name: string;
    tactic: string;
    technique_id: string;
    technique_name: string;
    event_ids: string[];
    summary: string;
  }>;
  findings: Array<Record<string, any>>;
  events: Array<Record<string, any>>;
}

export async function getCaseReconstruction(caseId: string): Promise<BackendReconstructionData> {
  return apiRequest<BackendReconstructionData>(
    `/cases/${caseId}/reconstruction`,
    {},
    () => {
      // Mock reconstruction fallback
      const fallbackModel: any = createCyberTwinDataModel(mockEvents);
      return {
        case_id: caseId || 'CASE-001',
        title: 'Unauthorized Access and Exfiltration Incident',
        status: 'reconstructed',
        summary: 'Correlated multi-stage attack from initial access to data exfiltration.',
        total_events: fallbackModel.events?.length || 7,
        timeline: fallbackModel.timeline || [],
        graph: {
          nodes: (fallbackModel.entities || []).map((e: any) => ({
            id: e.id,
            type: e.type,
            label: e.name,
            first_seen: e.first_seen,
            last_seen: e.last_seen,
            properties: e.properties || {}
          })),
          edges: (fallbackModel.relationships || []).map((r: any) => ({
            relationship_id: r.id,
            source: r.source_id,
            target: r.target_id,
            type: r.type,
            event_id: r.event_id,
            evidence_ids: r.evidence_ids || [r.evidence_id],
            timestamp: r.timestamp
          }))
        },
        attack_progression: fallbackModel.attack_progression || [],
        findings: fallbackModel.findings || [],
        events: fallbackModel.events || []
      };
    }
  );
}
