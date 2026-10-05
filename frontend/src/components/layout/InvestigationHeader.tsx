import React from 'react';
import { ShieldAlert, User, Calendar, Clock, Terminal, CheckCircle2 } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Badge } from '../common/Badge';

export const InvestigationHeader: React.FC = () => {
  const { activeCase, loading } = useInvestigation();

  if (!activeCase && !loading) return null;

  return (
    <div
      style={{
        background: '#0a101f',
        borderBottom: '1px solid #1e293b',
        padding: '1.25rem 2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#00f2fe',
              background: 'rgba(0, 242, 254, 0.1)',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(0, 242, 254, 0.3)'
            }}
          >
            {activeCase?.case_id || 'LOADING...'}
          </span>
          <Badge variant={activeCase?.severity || 'info'} pulse={activeCase?.severity === 'critical'}>
            {activeCase?.severity}
          </Badge>
          <Badge variant={activeCase?.status || 'open'}>
            {activeCase?.status}
          </Badge>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>•</span>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>
            {activeCase?.incident_type}
          </span>
        </div>

        <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          {activeCase?.title}
        </h1>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem', maxWidth: '900px' }}>
          {activeCase?.description}
        </p>
      </div>

      {/* Forensic Metadata Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          background: 'rgba(13, 20, 36, 0.7)',
          padding: '0.75rem 1.25rem',
          borderRadius: '8px',
          border: '1px solid #1e293b'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={16} color="#38bdf8" />
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Lead Investigator
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f1f5f9' }}>
              {activeCase?.investigator}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={16} color="#a855f7" />
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Time Range (UTC)
            </div>
            <div style={{ fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace', color: '#f1f5f9' }}>
              02:14:00 — 02:55:00 UTC
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={16} color="#10b981" />
          <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
              Correlated Artifacts
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981' }}>
              {activeCase?.evidence_count} files / {activeCase?.suspicious_event_count} alerts
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
