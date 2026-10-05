import React, { useState } from 'react';
import {
  GitCommit,
  ArrowUpDown,
  Filter,
  Search,
  ExternalLink,
  ShieldAlert,
  Clock,
  Laptop,
  User,
  Radio,
  FileCode,
  Terminal,
  Cpu
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { TimelineItem } from '../../components/timeline/TimelineItem';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EvidenceDetailModal } from '../../components/evidence/EvidenceDetailModal';
import { NormalizedEvent, Evidence } from '../../types';

export const TimelinePage: React.FC = () => {
  const { eventList, evidenceList, selectedEvent, setSelectedEvent } = useInvestigation();

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [modalEvidence, setModalEvidence] = useState<Evidence | null>(null);

  const handleViewEvidence = (evidenceId: string) => {
    const ev = evidenceList.find((e) => e.evidence_id === evidenceId) || evidenceList[0];
    setModalEvidence(ev);
  };

  const filteredEvents = eventList
    .filter((evt) => {
      const matchesSearch =
        evt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.source_device.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evt.event_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || evt.severity === severityFilter;
      const matchesType = typeFilter === 'all' || evt.event_type === typeFilter;
      return matchesSearch && matchesSeverity && matchesType;
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

  const activeInspectedEvent = selectedEvent || filteredEvents[0] || null;

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
            Chronological Incident Timeline
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Millisecond-precision correlated sequence of forensic actions across hosts and identities
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowUpDown size={15} />}
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            Sort: {sortOrder === 'asc' ? 'Earliest First (02:14 →)' : 'Latest First (02:54 →)'}
          </Button>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {filteredEvents.length} Events Displayed
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          background: '#0d1424',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #1e293b'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search events by actor, description, host, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              background: '#090f1d',
              border: '1px solid #2d3b55',
              color: '#cbd5e1',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>

          {/* Event Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              background: '#090f1d',
              border: '1px solid #2d3b55',
              color: '#cbd5e1',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Event Types</option>
            <option value="failed_login">Failed Logins</option>
            <option value="successful_auth">Successful Auth</option>
            <option value="privilege_escalation">Privilege Escalation</option>
            <option value="process_execution">Process Execution</option>
            <option value="file_access">File Access</option>
            <option value="data_exfiltration">Data Exfiltration</option>
            <option value="suspicious_command">Suspicious Commands</option>
            <option value="logout">Logouts</option>
          </select>
        </div>
      </div>

      {/* Main 2-Column Layout: Timeline Stream & Event Detail Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Timeline Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredEvents.map((evt) => (
            <TimelineItem
              key={evt.event_id}
              event={evt}
              isSelected={activeInspectedEvent?.event_id === evt.event_id}
              onSelect={(e) => setSelectedEvent(e)}
              onViewEvidence={handleViewEvidence}
            />
          ))}
        </div>

        {/* Right Column: Sticky Event Detail Inspector */}
        <div
          style={{
            position: 'sticky',
            top: '80px',
            background: '#0d1424',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 0 25px rgba(0,0,0,0.4)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                Event Inspector
              </span>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.15rem' }}>
                {activeInspectedEvent?.event_id}
              </h3>
            </div>
            {activeInspectedEvent && (
              <Badge variant={activeInspectedEvent.severity}>{activeInspectedEvent.severity}</Badge>
            )}
          </div>

          {activeInspectedEvent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Description</div>
                <div style={{ fontSize: '0.875rem', color: '#f1f5f9', fontWeight: 500, marginTop: '0.2rem', lineHeight: 1.4 }}>
                  {activeInspectedEvent.description}
                </div>
              </div>

              {/* Forensic Details Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#090f1d', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #1e293b' }}>
                  <span style={{ color: '#94a3b8' }}>Normalized Timestamp:</span>
                  <span style={{ color: '#00f2fe', fontFamily: 'JetBrains Mono, monospace' }}>{activeInspectedEvent.timestamp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#090f1d', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #1e293b' }}>
                  <span style={{ color: '#94a3b8' }}>Actor / Security Subject:</span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{activeInspectedEvent.actor}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#090f1d', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #1e293b' }}>
                  <span style={{ color: '#94a3b8' }}>Host Device:</span>
                  <span style={{ color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>{activeInspectedEvent.source_device}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#090f1d', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #1e293b' }}>
                  <span style={{ color: '#94a3b8' }}>Source IP:</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>{activeInspectedEvent.source_ip}</span>
                </div>
                {activeInspectedEvent.destination_ip && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#090f1d', padding: '0.45rem 0.65rem', borderRadius: '4px', border: '1px solid #1e293b' }}>
                    <span style={{ color: '#94a3b8' }}>Target / Dst IP:</span>
                    <span style={{ color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>{activeInspectedEvent.destination_ip}</span>
                  </div>
                )}
              </div>

              {/* MITRE Mapping */}
              {activeInspectedEvent.mitre_technique && (
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '6px', padding: '0.65rem 0.85rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase' }}>
                    MITRE ATT&CK Mapping
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#fcd34d', fontWeight: 600, marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    {activeInspectedEvent.mitre_technique}
                  </div>
                </div>
              )}

              {/* Raw Evidence Line */}
              {activeInspectedEvent.evidence_line && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Source Log Evidence Record
                  </div>
                  <pre
                    style={{
                      background: '#050811',
                      border: '1px solid #1e293b',
                      borderRadius: '6px',
                      padding: '0.65rem',
                      fontSize: '0.72rem',
                      color: '#cbd5e1',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      lineHeight: 1.4
                    }}
                  >
                    {activeInspectedEvent.evidence_line}
                  </pre>
                </div>
              )}

              {/* Button to view source evidence */}
              <Button
                variant="primary"
                size="sm"
                icon={<ExternalLink size={14} />}
                onClick={() => handleViewEvidence(activeInspectedEvent.evidence_id)}
              >
                Inspect Evidence File ({activeInspectedEvent.evidence_id})
              </Button>
            </div>
          ) : (
            <div style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
              Select an event to inspect forensic details.
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
