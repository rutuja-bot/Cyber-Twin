import React from 'react';
import { X, ShieldAlert, Cpu, HardDrive, User, Globe, FileSpreadsheet, ArrowRight } from 'lucide-react';
import { Entity, Relationship } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface NodeInspectorProps {
  entity: Entity | null;
  relationships: Relationship[];
  allEntities: Entity[];
  onClose: () => void;
  onSelectEntity: (entity: Entity) => void;
  onViewEvidence: (evidenceId: string) => void;
}

export const NodeInspector: React.FC<NodeInspectorProps> = ({
  entity,
  relationships,
  allEntities,
  onClose,
  onSelectEntity,
  onViewEvidence
}) => {
  if (!entity) return null;

  const connectedRels = relationships.filter(
    (r) => r.source_entity_id === entity.entity_id || r.target_entity_id === entity.entity_id
  );

  const getEntityIcon = () => {
    switch (entity.entity_type) {
      case 'user':
        return <User size={20} color="#38bdf8" />;
      case 'workstation':
        return <Cpu size={20} color="#f59e0b" />;
      case 'server':
        return <HardDrive size={20} color="#10b981" />;
      case 'ip_address':
        return <Globe size={20} color={entity.is_external ? '#ef4444' : '#38bdf8'} />;
      default:
        return <FileSpreadsheet size={20} color="#00f2fe" />;
    }
  };

  return (
    <div
      style={{
        background: '#0a0f1d',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 0 25px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: '#0f172a',
              border: `1px solid ${entity.is_compromised ? '#ef4444' : '#2d3b55'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getEntityIcon()}
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>{entity.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
              {entity.entity_id} • {entity.entity_type.toUpperCase()}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Compromise Status */}
      <div>
        {entity.is_compromised ? (
          <Badge variant="critical" pulse>
            <ShieldAlert size={12} /> COMPROMISED ENTITY IN ATTACK CHAIN
          </Badge>
        ) : (
          <Badge variant="verified">UNCOMPROMISED INFRASTRUCTURE ASSET</Badge>
        )}
      </div>

      {/* Metadata Attributes */}
      <div>
        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Forensic Attributes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {Object.entries(entity.metadata).map(([key, val]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                background: '#0d1424',
                padding: '0.35rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid #1e293b'
              }}
            >
              <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>
                {key.replace(/_/g, ' ')}:
              </span>
              <span style={{ color: '#f1f5f9', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>
                {String(val)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Graph Edges */}
      <div>
        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Connected Graph Edges ({connectedRels.length})
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {connectedRels.map((rel) => {
            const isSource = rel.source_entity_id === entity.entity_id;
            const otherEntityId = isSource ? rel.target_entity_id : rel.source_entity_id;
            const otherEntity = allEntities.find((e) => e.entity_id === otherEntityId);

            return (
              <div
                key={rel.relationship_id}
                style={{
                  background: '#0d1424',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00f2fe', fontWeight: 600 }}>
                    <span>{rel.label}</span>
                    <ArrowRight size={12} />
                    <span
                      style={{ color: '#f8fafc', textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={() => otherEntity && onSelectEntity(otherEntity)}
                    >
                      {otherEntity?.name || otherEntityId}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Type: {rel.relationship_type}
                  </div>
                </div>

                {rel.evidence_ids.length > 0 && (
                  <button
                    onClick={() => onViewEvidence(rel.evidence_ids[0])}
                    style={{
                      background: 'rgba(0, 242, 254, 0.1)',
                      border: '1px solid rgba(0, 242, 254, 0.3)',
                      borderRadius: '4px',
                      padding: '0.2rem 0.4rem',
                      color: '#00f2fe',
                      fontSize: '0.68rem',
                      cursor: 'pointer',
                      fontFamily: 'JetBrains Mono, monospace'
                    }}
                  >
                    Evidence
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
