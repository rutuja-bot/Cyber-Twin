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
      case 'suspicious_login':
        return <LogIn size={18} color="#10b981" />;
      case 'privilege_escalation':
        return <KeyRound size={18} color="#ef4444" />;
      case 'process_execution':
      case 'suspicious_process_spawn':
        return <Cpu size={18} color="#f59e0b" />;
      case 'file_access':
      case 'sensitive_file_access':
      case 'suspicious_command':
        return <FileCode size={18} color="#38bdf8" />;
      case 'network_connection':
      case 'internal_server_connection':
      case 'suspicious_network_connection':
        return <Globe size={18} color="#a855f7" />;
      case 'data_exfiltration':
      case 'outbound_data_transfer':
        return <UploadCloud size={18} color="#ef4444" />;
      case 'logout':
        return <LogOut size={18} color="#64748b" />;
      default:
        return <ShieldAlert size={18} color="#3b82f6" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(event)}
      style={{
        display: 'flex',
        gap: '1.25rem',
        padding: '1.1rem 1.25rem',
        borderRadius: '10px',
        background: isSelected ? 'rgba(22, 119, 255, 0.12)' : '#101936',
        border: isSelected ? '1px solid #00B7FF' : '1px solid #24315C',
        boxShadow: isSelected ? '0 4px 18px rgba(0, 183, 255, 0.15)' : 'none',
        cursor: 'pointer',
        transition: 'all 0.15s ease-in-out',
        position: 'relative'
      }}
    >
      {/* Icon node indicator */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: '#0A1024',
          border: `1px solid ${isSelected ? '#00B7FF' : '#24315C'}`,
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
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', fontWeight: 600, color: '#00B7FF' }}>
              {event.event_id}
            </span>
            <Badge variant={event.severity} size="sm">
              {event.severity}
            </Badge>
            <span style={{ fontSize: '0.75rem', color: '#24315C' }}>•</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#A7B0C8' }}>
              {event.timestamp}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {event.stage && (
              <span
                style={{
                  fontSize: '0.7rem',
                  color: '#4DEBFF',
                  background: 'rgba(77, 235, 255, 0.1)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(77, 235, 255, 0.25)',
                  fontWeight: 600
                }}
              >
                {event.stage}
              </span>
            )}
            {(event.mitre_technique || event.mitre_technique_id) && (
              <span
                style={{
                  fontSize: '0.7rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#D62CFF',
                  background: 'rgba(214, 44, 255, 0.1)',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(214, 44, 255, 0.25)',
                  fontWeight: 600
                }}
              >
                {event.mitre_technique_id
                  ? `${event.mitre_technique_id} • ${event.mitre_technique_name || event.mitre_technique}`
                  : event.mitre_technique}
              </span>
            )}
          </div>
        </div>

        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F5F7FF', marginTop: '0.35rem' }}>
          {event.description}
        </div>

        {/* Detailed contextual pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
          <span style={{ color: '#A7B0C8' }}>
            Actor: <strong style={{ color: '#F5F7FF' }}>{event.actor}</strong>
          </span>
          <span style={{ color: '#A7B0C8' }}>
            Host: <strong style={{ color: '#F5F7FF' }}>{event.source_device}</strong>
          </span>
          <span style={{ color: '#A7B0C8' }}>
            Src IP: <code style={{ color: '#4DEBFF' }}>{event.source_ip}</code>
          </span>
          {event.destination_ip && (
            <span style={{ color: '#A7B0C8' }}>
              Dst IP: <code style={{ color: '#FF3CAC' }}>{event.destination_ip}</code>
            </span>
          )}
        </div>

        {/* Supporting Evidence link button */}
        <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onViewEvidence(event.evidence_id);
            }}
            style={{
              background: 'rgba(22, 119, 255, 0.1)',
              border: '1px solid rgba(0, 183, 255, 0.25)',
              borderRadius: '6px',
              padding: '0.25rem 0.55rem',
              color: '#4DEBFF',
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

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onSelect(event);
            }}
            style={{
              background: isSelected ? 'rgba(0, 183, 255, 0.2)' : 'transparent',
              border: isSelected ? '1px solid #00B7FF' : '1px solid transparent',
              borderRadius: '4px',
              padding: '0.2rem 0.4rem',
              fontSize: '0.75rem',
              color: isSelected ? '#00B7FF' : '#A7B0C8',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              cursor: 'pointer'
            }}
          >
            {isSelected ? 'Inspecting' : 'Click to inspect'} <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
