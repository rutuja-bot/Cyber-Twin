import React from 'react';
import {
  AlertTriangle,
  LogIn,
  KeyRound,
  FileCode,
  Globe,
  UploadCloud,
  LogOut,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Cpu
} from 'lucide-react';
import { NormalizedEvent } from '../../types';
import { Badge } from '../common/Badge';

interface TimelineItemProps {
  event: NormalizedEvent;
  isSelected: boolean;
  onSelect: (event: NormalizedEvent) => void;
  onViewEvidence: (evidenceId: string) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  event,
  isSelected,
  onSelect,
  onViewEvidence
}) => {
  const getEventIcon = () => {
    switch (event.event_type) {
      case 'failed_login':
        return <AlertTriangle size={18} color="#ef4444" />;
      case 'successful_auth':
      case 'login':
        return <LogIn size={18} color="#10b981" />;
      case 'privilege_escalation':
        return <KeyRound size={18} color="#ef4444" />;
      case 'process_execution':
        return <Cpu size={18} color="#f59e0b" />;
      case 'file_access':
      case 'suspicious_command':
        return <FileCode size={18} color="#38bdf8" />;
      case 'network_connection':
        return <Globe size={18} color="#a855f7" />;
      case 'data_exfiltration':
        return <UploadCloud size={18} color="#ef4444" />;
      case 'logout':
        return <LogOut size={18} color="#64748b" />;
      default:
        return <ShieldAlert size={18} color="#00f2fe" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(event)}
      style={{
        display: 'flex',
        gap: '1.25rem',
        padding: '1rem 1.25rem',
        borderRadius: '8px',
        background: isSelected ? 'rgba(0, 242, 254, 0.08)' : '#0d1424',
        border: isSelected ? '1px solid #00f2fe' : '1px solid #1e293b',
        boxShadow: isSelected ? '0 0 20px rgba(0, 242, 254, 0.15)' : 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out',
        position: 'relative'
      }}
    >
      {/* Icon node indicator */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          background: '#090f1d',
          border: `1px solid ${isSelected ? '#00f2fe' : '#2d3b55'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}
      >
        {getEventIcon()}
      </div>

      {/* Main Event Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 700, color: '#00f2fe' }}>
              {event.event_id}
            </span>
            <Badge variant={event.severity} size="sm">
              {event.severity}
            </Badge>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>•</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#94a3b8' }}>
              {event.timestamp}
            </span>
          </div>

          {event.mitre_technique && (
            <span
              style={{
                fontSize: '0.7rem',
                fontFamily: 'JetBrains Mono, monospace',
                color: '#f59e0b',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid rgba(245, 158, 11, 0.25)'
              }}
            >
              {event.mitre_technique}
            </span>
          )}
        </div>

        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f1f5f9', marginTop: '0.35rem' }}>
          {event.description}
        </div>

        {/* Detailed contextual pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
          <span style={{ color: '#94a3b8' }}>
            Actor: <strong style={{ color: '#f8fafc' }}>{event.actor}</strong>
          </span>
          <span style={{ color: '#94a3b8' }}>
            Host: <strong style={{ color: '#f8fafc' }}>{event.source_device}</strong>
          </span>
          <span style={{ color: '#94a3b8' }}>
            Src IP: <code style={{ color: '#38bdf8' }}>{event.source_ip}</code>
          </span>
          {event.destination_ip && (
            <span style={{ color: '#94a3b8' }}>
              Dst IP: <code style={{ color: '#ef4444' }}>{event.destination_ip}</code>
            </span>
          )}
        </div>

        {/* Supporting Evidence link button */}
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewEvidence(event.evidence_id);
            }}
            style={{
              background: 'rgba(0, 242, 254, 0.08)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              borderRadius: '4px',
              padding: '0.2rem 0.5rem',
              color: '#00f2fe',
              fontSize: '0.72rem',
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            Evidence: {event.evidence_id} <ExternalLink size={12} />
          </button>

          <span style={{ fontSize: '0.75rem', color: isSelected ? '#00f2fe' : '#64748b', display: 'flex', alignItems: 'center' }}>
            {isSelected ? 'Inspecting' : 'Click to inspect'} <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </div>
  );
};
