import React from 'react';
import { ReplayEvent } from '../../types';
import {
  Laptop,
  Server,
  Shield,
  Globe,
  Radio,
  FileCode,
  AlertTriangle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CyberTwinStageProps {
  currentEvent: ReplayEvent | null;
  onViewEvidence: (evidenceId: string) => void;
}

export const CyberTwinStage: React.FC<CyberTwinStageProps> = ({ currentEvent, onViewEvidence }) => {
  if (!currentEvent) return null;

  const isEntityActive = (entityId: string) => {
    return currentEvent.active_entities.includes(entityId);
  };

  const getStageNodeStyle = (entityId: string, baseBorder = '#24315C') => {
    const active = isEntityActive(entityId);
    return {
      background: active ? '#151F46' : '#101936',
      border: `2px solid ${active ? '#00B7FF' : baseBorder}`,
      boxShadow: active ? '0 0 24px rgba(0, 183, 255, 0.25)' : 'none',
      transition: 'all 0.2s ease',
      transform: active ? 'scale(1.02)' : 'scale(1)'
    };
  };

  return (
    <div
      style={{
        background: '#0A1024',
        border: '1px solid #24315C',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(5, 8, 22, 0.5)'
      }}
    >
      {/* Background Cyber Grid */}
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.4, pointerEvents: 'none' }} />

      {/* Live Narrative Action Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(22, 119, 255, 0.12) 0%, rgba(123, 44, 255, 0.08) 100%)',
          border: '1px solid #00B7FF',
          borderRadius: '10px',
          padding: '1.1rem 1.35rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          zIndex: 5,
          boxShadow: '0 4px 20px rgba(0, 183, 255, 0.12)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(0, 183, 255, 0.15)',
              border: '1px solid #00B7FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00B7FF',
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              boxShadow: '0 0 10px rgba(0, 183, 255, 0.3)'
            }}
          >
            {currentEvent.sequence}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge variant={currentEvent.severity} size="sm">{currentEvent.severity}</Badge>
              <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#A7B0C8' }}>
                {currentEvent.timestamp}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#00B7FF', fontWeight: 600 }}>
                • {currentEvent.event_type.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#F5F7FF', marginTop: '0.2rem' }}>
              {currentEvent.state_change_description}
            </div>
          </div>
        </div>

        <button
          onClick={() => onViewEvidence(currentEvent.evidence_id)}
          style={{
            background: 'rgba(22, 119, 255, 0.1)',
            border: '1px solid rgba(0, 183, 255, 0.3)',
            color: '#4DEBFF',
            padding: '0.45rem 0.85rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontFamily: 'JetBrains Mono, monospace',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease'
          }}
        >
          View Evidence {currentEvent.evidence_id} <ExternalLink size={14} />
        </button>
      </div>

      {/* Cyber Twin Spatial Infrastructure Stage */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1.25rem',
          zIndex: 5,
          margin: '0.5rem 0'
        }}
      >
        {/* Node 1: Ingress Pivot */}
        <div
          style={{
            ...getStageNodeStyle('ENT-IP-01'),
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#A7B0C8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              Ingress Pivot
            </span>
            <Radio size={16} color={isEntityActive('ENT-IP-01') ? '#FF3CAC' : '#A7B0C8'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={20} color="#FF3CAC" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F5F7FF' }}>192.168.1.105</div>
              <div style={{ fontSize: '0.7rem', color: '#A7B0C8' }}>WS-UNKNOWN-PIVOT</div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#A7B0C8' }}>
            Subnet Probe / Password Trials
          </div>
        </div>

        {/* Node 2: Compromised Host (WS-FIN-04) */}
        <div
          style={{
            ...getStageNodeStyle('ENT-DEV-01', '#FF3CAC'),
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#FF3CAC', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              Compromised Host
            </span>
            <AlertTriangle size={16} color="#FF3CAC" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Laptop size={20} color="#00B7FF" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F5F7FF' }}>WS-FIN-04</div>
              <div style={{ fontSize: '0.7rem', color: '#A7B0C8' }}>192.168.1.44 (VLAN 10)</div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#A7B0C8' }}>
            PowerShell PID 6412 • SYSTEM Token
          </div>
        </div>

        {/* Node 3: Target Internal Server (FS-CORP-01) */}
        <div
          style={{
            ...getStageNodeStyle('ENT-SRV-01', '#00B7FF'),
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#00B7FF', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              Internal Vault Server
            </span>
            <Server size={16} color="#00B7FF" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={20} color="#00B7FF" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F5F7FF' }}>FS-CORP-01</div>
              <div style={{ fontSize: '0.7rem', color: '#A7B0C8' }}>10.0.4.15 (SMB Share)</div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#A7B0C8' }}>
            Target: customer_vault_q3.db
          </div>
        </div>

        {/* Node 4: Exfiltration Destination (External C2) */}
        <div
          style={{
            ...getStageNodeStyle('ENT-IP-02', '#7B2CFF'),
            borderRadius: '10px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#7B2CFF', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              External Malicious C2
            </span>
            <Globe size={16} color="#7B2CFF" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={20} color="#FF3CAC" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F5F7FF' }}>198.51.100.42</div>
              <div style={{ fontSize: '0.7rem', color: '#A7B0C8' }}>Port 8443 (Encrypted Exfil)</div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#A7B0C8' }}>
            42.8 MB Data Burst Sink
          </div>
        </div>
      </div>
    </div>
  );
};
