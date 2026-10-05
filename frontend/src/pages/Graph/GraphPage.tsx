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
import { NetworkGraph } from '../../components/graph/NetworkGraph';
import { NodeInspector } from '../../components/graph/NodeInspector';
import { EvidenceDetailModal } from '../../components/evidence/EvidenceDetailModal';
import { Badge } from '../../components/common/Badge';
import { Entity, Evidence } from '../../types';

export const GraphPage: React.FC = () => {
  const { graphData, evidenceList, selectedEntity, setSelectedEntity } = useInvestigation();
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
          borderBottom: '1px solid #1e293b',
          paddingBottom: '1.25rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>
            Entity & Attack Path Graph
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Topological reconstruction linking identities, hosts, processes, sensitive files, and C2 endpoints
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="cyan">
            {graphData.entities.length} Entities
          </Badge>
          <Badge variant="critical">
            {graphData.relationships.length} Correlated Links
          </Badge>
        </div>
      </div>

      {/* Main Graph Grid with Side Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Interactive Graph Canvas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <NetworkGraph
            entities={graphData.entities}
            relationships={graphData.relationships}
            selectedEntity={activeEntity}
            onSelectEntity={(entity) => setSelectedEntity(entity)}
          />

          <div
            style={{
              background: '#0d1424',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.78rem',
              color: '#94a3b8'
            }}
          >
            <Info size={16} color="#00f2fe" style={{ flexShrink: 0 }} />
            <span>
              <strong>Forensic Navigation Tip:</strong> Click and drag anywhere on the canvas to pan across the network topology. Use the controls at the bottom right to zoom. Click any entity circle to inspect its attributes, compromise status, and linked evidence.
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
                background: '#0d1424',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                color: '#64748b'
              }}
            >
              <Network size={36} color="#334155" style={{ margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontSize: '0.9rem', color: '#cbd5e1', fontWeight: 600 }}>No Entity Selected</div>
              <p style={{ fontSize: '0.78rem', marginTop: '0.25rem' }}>Click any node on the graph to inspect its forensic context.</p>
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
