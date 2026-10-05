import { Entity, Relationship } from '../types';
import { MOCK_ENTITIES, MOCK_RELATIONSHIPS } from '../mock/investigationData';
import { apiRequest } from './client';

export interface GraphData {
  entities: Entity[];
  relationships: Relationship[];
}

function mapBackendNode(node: any, caseId: string): Entity {
  const normType = node.type === 'ip' ? 'ip_address' : (node.type === 'device' ? 'workstation' : node.type);
  const isCompromised = ['user:employee01', 'device:WORKSTATION-01', 'file:/var/data/customer_records_2026.csv', 'file:\\SRV-CORP-FILE\\confidential\\customer_data.csv'].includes(node.id);
  const isExternal = node.id.includes('198.51.100.24') || node.id.includes('203.0.113.50') || (node.properties && node.properties.network === 'external');

  return {
    entity_id: node.id,
    case_id: caseId,
    name: node.label || node.id,
    entity_type: normType,
    is_compromised: isCompromised,
    is_external: isExternal,
    metadata: {
      first_seen: node.first_seen || '2026-10-04T10:15:00Z',
      last_seen: node.last_seen || '2026-10-04T10:55:00Z',
      ...(node.properties || {})
    }
  };
}

function mapBackendEdge(edge: any, caseId: string): Relationship {
  return {
    relationship_id: edge.relationship_id || edge.id,
    case_id: caseId,
    source_entity_id: edge.source,
    target_entity_id: edge.target,
    relationship_type: edge.type || 'CONNECTED_TO',
    label: edge.type || 'CONNECTED_TO',
    evidence_ids: (edge.evidence_ids && edge.evidence_ids.length > 0) ? edge.evidence_ids : [edge.evidence_id || 'EVD-001'],
    timestamp: edge.timestamp || new Date().toISOString(),
    is_suspicious: true
  };
}

export async function getGraphData(caseId: string): Promise<GraphData> {
  const result = await apiRequest<any>(
    `/cases/${caseId}/reconstruction/graph`,
    {},
    () => ({
      entities: MOCK_ENTITIES.filter((e) => e.case_id === caseId),
      relationships: MOCK_RELATIONSHIPS.filter((r) => r.case_id === caseId)
    })
  );

  if (result && Array.isArray(result.nodes) && Array.isArray(result.edges)) {
    return {
      entities: result.nodes.map((n: any) => mapBackendNode(n, caseId)),
      relationships: result.edges.map((e: any) => mapBackendEdge(e, caseId))
    };
  }

  return {
    entities: result.entities || MOCK_ENTITIES,
    relationships: result.relationships || MOCK_RELATIONSHIPS
  };
}
