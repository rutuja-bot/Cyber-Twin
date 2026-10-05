import React, { useState } from 'react';
import {
  Network,
  Info,
  ShieldAlert,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { RelationshipGraph } from '../../visualization/RelationshipGraph';
import { NetworkGraph } from '../../components/graph/NetworkGraph';
import { NodeInspector } from '../../components/graph/NodeInspector';
import { EvidenceDetailModal } from '../../components/evidence/EvidenceDetailModal';
import { Badge } from '../../components/common/Badge';
import { Entity, Evidence } from '../../types';

const VisualGraph = RelationshipGraph as any;

export const GraphPage: React.FC = () => {
  const {
    graphData,
    evidenceList,
    selectedEntity,
    setSelectedEntity,
    reconstructionModel,
    selectedEvent
  } = useInvestigation();
  const [modalEvidence, setModalEvidence] = useState<Evidence | null>(null);

  const activeEntity = selectedEntity || graphData.entities[0] || null;

  const handleViewEvidence = (evidenceId: string) => {
    const ev = evidenceList.find((e) => e.evidence_id === evidenceId) || evidenceList[0];
    setModalEvidence(ev);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid #24315C',
          paddingBottom: '1.25rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F5F7FF', letterSpacing: '-0.02em' }}>
            Entity & Attack Path Graph
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#A7B0C8', marginTop: '0.2rem' }}>
            Cytoscape-powered topological reconstruction linking identities, hosts, processes, sensitive files, and C2 endpoints
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="neutral">
            {reconstructionModel?.entities?.length || graphData.entities.length} Entities
          </Badge>
          <Badge variant="critical">
            {reconstructionModel?.relationships?.length || graphData.relationships.length} Correlated Links
          </Badge>
        </div>
      </div>

      {/* Main Graph Grid with Side Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(340px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Interactive Graph Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div
            style={{
              background: '#0D1424',
              border: '1px solid #1E2D4A',
              borderRadius: '12px',
              overflow: 'hidden',
              minHeight: '620px'
            }}
          >
            {reconstructionModel ? (
              <VisualGraph
                model={reconstructionModel}
                selectedEventId={selectedEvent?.event_id || null}
                height="620px"
                width="100%"
                onNodeSelect={(nodeData: any) => {
                  const ent: Entity = graphData.entities.find((e) => e.entity_id === nodeData.id) || {
                    entity_id: nodeData.id,
                    case_id: 'CASE-001',
                    name: nodeData.label || nodeData.name || nodeData.id,
                    entity_type: (nodeData.type || 'workstation') as any,
                    is_compromised: true,
                    metadata: {
                      first_seen: nodeData.first_seen || '2026-10-04T10:15:00Z',
                      last_seen: nodeData.last_seen || '2026-10-04T10:55:00Z',
                      risk_score: 90
                    }
                  };
                  setSelectedEntity(ent);
                }}
              />
            ) : (
              <NetworkGraph
                entities={graphData.entities}
                relationships={graphData.relationships}
                selectedEntity={activeEntity}
                onSelectEntity={(entity) => setSelectedEntity(entity)}
              />
            )}
          </div>

          <div
            style={{
              background: '#101936',
              border: '1px solid #24315C',
              borderRadius: '10px',
              padding: '0.85rem 1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.8rem',
              color: '#A7B0C8'
            }}
          >
            <Info size={18} color="#00B7FF" style={{ flexShrink: 0 }} />
            <span>
              <strong style={{ color: '#F5F7FF' }}>Forensic Navigation Tip:</strong> Click and drag anywhere on the canvas to pan across the network topology. Use scroll to zoom. Click any entity circle to inspect its attributes, compromise status, and linked evidence.
            </span>
          </div>
        </div>

        {/* Node Inspector Side Panel */}
        <div>
          {activeEntity ? (
            <NodeInspector
              entity={activeEntity}
              relationships={graphData.relationships}
              allEntities={graphData.entities}
              onClose={() => setSelectedEntity(null)}
              onSelectEntity={(e) => setSelectedEntity(e)}
              onViewEvidence={handleViewEvidence}
            />
          ) : (
            <div
              style={{
                background: '#101936',
                border: '1px solid #24315C',
                borderRadius: '12px',
                padding: '3rem 1.5rem',
                textAlign: 'center',
                color: '#A7B0C8',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
              }}
            >
              <Network size={40} color="#24315C" style={{ margin: '0 auto 0.85rem auto' }} />
              <div style={{ fontSize: '1rem', color: '#F5F7FF', fontWeight: 600 }}>No Entity Selected</div>
              <p style={{ fontSize: '0.8rem', marginTop: '0.35rem', color: '#A7B0C8' }}>Click any node on the graph to inspect its forensic context.</p>
            </div>
          )}
        </div>
      </div>

      {/* Evidence Detail Modal */}
      <EvidenceDetailModal
        evidence={modalEvidence}
        onClose={() => setModalEvidence(null)}
      />
    </div>
  );
};
