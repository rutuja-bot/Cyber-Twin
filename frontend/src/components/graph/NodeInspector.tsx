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
        return <FileSpreadsheet size={20} color="#3b82f6" />;
    }
  };

  return (
    <div
      style={{
        background: '#101936',
        border: '1px solid #24315C',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: '#0A1024',
              border: `1px solid ${entity.is_compromised ? '#FF3CAC' : '#24315C'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getEntityIcon()}
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#F5F7FF' }}>{entity.name}</div>
            <div style={{ fontSize: '0.72rem', color: '#A7B0C8', fontFamily: 'JetBrains Mono, monospace' }}>
              {entity.entity_id} • {entity.entity_type.toUpperCase()}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#A7B0C8', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Compromise Status */}
      <div>
        {entity.is_compromised ? (
          <Badge variant="critical">
            <ShieldAlert size={12} /> COMPROMISED ENTITY IN ATTACK CHAIN
          </Badge>
        ) : (
          <Badge variant="verified">UNCOMPROMISED INFRASTRUCTURE ASSET</Badge>
        )}
      </div>

      {/* Metadata Attributes */}
      <div>
        <div style={{ fontSize: '0.7rem', color: '#A7B0C8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.05em' }}>
          Forensic Attributes
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {Object.entries(entity.metadata).map(([key, val]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                background: '#151F46',
                padding: '0.45rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid #24315C'
              }}
            >
              <span style={{ color: '#A7B0C8', textTransform: 'capitalize' }}>
                {key.replace(/_/g, ' ')}:
              </span>
              <span style={{ color: '#F5F7FF', fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>
                {String(val)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Graph Edges */}
      <div>
        <div style={{ fontSize: '0.7rem', color: '#A7B0C8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.45rem', letterSpacing: '0.05em' }}>
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
                  background: '#151F46',
                  border: '1px solid #24315C',
                  borderRadius: '8px',
                  padding: '0.55rem 0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00B7FF', fontWeight: 600 }}>
                    <span>{rel.label}</span>
                    <ArrowRight size={12} />
                    <span
                      style={{ color: '#F5F7FF', textDecoration: 'underline', cursor: 'pointer' }}
                      onClick={() => otherEntity && onSelectEntity(otherEntity)}
                    >
                      {otherEntity?.name || otherEntityId}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#A7B0C8', marginTop: '0.15rem' }}>
                    Type: {rel.relationship_type}
                  </div>
                </div>

                {rel.evidence_ids.length > 0 && (
                  <button
                    onClick={() => onViewEvidence(rel.evidence_ids[0])}
                    style={{
                      background: 'rgba(22, 119, 255, 0.1)',
                      border: '1px solid rgba(0, 183, 255, 0.25)',
                      borderRadius: '6px',
                      padding: '0.25rem 0.5rem',
                      color: '#4DEBFF',
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
