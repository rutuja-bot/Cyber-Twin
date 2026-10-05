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

  const getStageNodeStyle = (entityId: string, baseBorder = '#2d3b55') => {
    const active = isEntityActive(entityId);
    return {
      background: active ? '#162238' : '#0d1424',
      border: `2px solid ${active ? '#00f2fe' : baseBorder}`,
      boxShadow: active ? '0 0 25px rgba(0, 242, 254, 0.4)' : 'none',
      transition: 'all 0.3s ease',
      transform: active ? 'scale(1.04)' : 'scale(1)'
    };
  };

  return (
    <div
      style={{
        background: '#070b14',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Cyber Grid */}
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 0.6, pointerEvents: 'none' }} />

      {/* Live Narrative Action Banner */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(13, 20, 36, 0.95) 0%, rgba(9, 15, 29, 0.95) 100%)',
          border: '1px solid #00f2fe',
          borderRadius: '8px',
          padding: '1rem 1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          zIndex: 5,
          boxShadow: '0 0 20px rgba(0, 242, 254, 0.15)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(0, 242, 254, 0.15)',
              border: '1px solid #00f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00f2fe',
              fontWeight: 800,
              fontFamily: 'JetBrains Mono, monospace'
            }}
          >
            {currentEvent.sequence}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Badge variant={currentEvent.severity} size="sm">{currentEvent.severity}</Badge>
              <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#64748b' }}>
                {currentEvent.timestamp}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#00f2fe', fontWeight: 600 }}>
                • {currentEvent.event_type.toUpperCase()}
              </span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.2rem' }}>
              {currentEvent.state_change_description}
            </div>
          </div>
        </div>

        <button
          onClick={() => onViewEvidence(currentEvent.evidence_id)}
          style={{
            background: 'rgba(0, 242, 254, 0.1)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            color: '#00f2fe',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontFamily: 'JetBrains Mono, monospace',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
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
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>
              Ingress Pivot
            </span>
            <Radio size={16} color={isEntityActive('ENT-IP-01') ? '#ef4444' : '#64748b'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={20} color="#ef4444" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>192.168.1.105</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>WS-UNKNOWN-PIVOT</div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Subnet Probe / Password Trials
          </div>
        </div>

        {/* Node 2: Compromised Host (WS-FIN-04) */}
        <div
          style={{
            ...getStageNodeStyle('ENT-DEV-01', '#ef4444'),
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700 }}>
              Compromised Host
            </span>
            <AlertTriangle size={16} color="#ef4444" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Laptop size={20} color="#00f2fe" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>WS-FIN-04</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>192.168.1.44 (VLAN 10)</div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            PowerShell PID 6412 • SYSTEM Token
          </div>
        </div>

        {/* Node 3: Target Internal Server (FS-CORP-01) */}
        <div
          style={{
            ...getStageNodeStyle('ENT-SRV-01', '#10b981'),
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700 }}>
              Internal Vault Server
            </span>
            <Server size={16} color="#10b981" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={20} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>FS-CORP-01</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>10.0.4.15 (SMB Share)</div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            Target: customer_vault_q3.db
          </div>
        </div>

        {/* Node 4: Exfiltration Destination (External C2) */}
        <div
          style={{
            ...getStageNodeStyle('ENT-IP-02', '#f59e0b'),
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.7rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 700 }}>
              External Malicious C2
            </span>
            <Globe size={16} color="#f59e0b" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={20} color="#ef4444" />
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>198.51.100.42</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Port 8443 (Encrypted Exfil)</div>
            </div>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
            42.8 MB Data Burst Sink
          </div>
        </div>
      </div>
    </div>
  );
};
