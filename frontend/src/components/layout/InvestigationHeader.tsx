import React from 'react';
import { User, Clock, Terminal } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Badge } from '../common/Badge';

export const InvestigationHeader: React.FC = () => {
  const { activeCase, loading } = useInvestigation();

  if (!activeCase && !loading) return null;

  return (
    <div
      style={{
        background: 'rgba(10, 16, 36, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #24315C',
        padding: '0.85rem 2rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#00B7FF',
              background: '#151F46',
              padding: '0.15rem 0.5rem',
              borderRadius: '6px',
              border: '1px solid rgba(0, 183, 255, 0.35)',
              boxShadow: '0 0 10px rgba(0, 183, 255, 0.15)'
            }}
          >
            {activeCase?.case_id || 'LOADING...'}
          </span>
          <Badge variant={activeCase?.severity || 'info'}>
            {activeCase?.severity}
          </Badge>
          <Badge variant={activeCase?.status || 'open'}>
            {activeCase?.status}
          </Badge>
          <span style={{ fontSize: '0.75rem', color: '#24315C' }}>•</span>
          <span style={{ fontSize: '0.78rem', color: '#A7B0C8', fontWeight: 500 }}>
            {activeCase?.incident_type}
          </span>
        </div>

        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#F5F7FF' }}>
          {activeCase?.title}
        </h1>
      </div>

      {/* Forensic Metadata Strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          background: '#101936',
          padding: '0.55rem 1rem',
          borderRadius: '8px',
          border: '1px solid #24315C',
          boxShadow: '0 2px 10px rgba(5, 8, 22, 0.5)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <User size={14} color="#00B7FF" />
          <div style={{ fontSize: '0.75rem' }}>
            <span style={{ color: '#717E9E' }}>Lead: </span>
            <span style={{ color: '#F5F7FF', fontWeight: 600 }}>{activeCase?.investigator}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Clock size={14} color="#00B7FF" />
          <div style={{ fontSize: '0.75rem' }}>
            <span style={{ color: '#717E9E' }}>Window: </span>
            <span style={{ color: '#F5F7FF', fontFamily: 'JetBrains Mono, monospace' }}>
              {activeCase?.date_range
                ? `${activeCase.date_range.start.includes('T') ? activeCase.date_range.start.split('T')[1]?.substring(0, 8) : activeCase.date_range.start} — ${activeCase.date_range.end.includes('T') ? activeCase.date_range.end.split('T')[1]?.substring(0, 8) : activeCase.date_range.end} UTC`
                : '10:15:00 — 10:55:00 UTC'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Terminal size={14} color="#00B7FF" />
          <div style={{ fontSize: '0.75rem' }}>
            <span style={{ color: '#717E9E' }}>Artifacts: </span>
            <span style={{ color: '#4DEBFF', fontWeight: 600 }}>{activeCase?.evidence_count} files / {activeCase?.suspicious_event_count} alerts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
