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
          borderBottom: '1px solid #24315C',
          paddingBottom: '1.25rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F5F7FF', letterSpacing: '-0.02em' }}>
            Chronological Incident Timeline
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#A7B0C8', marginTop: '0.2rem' }}>
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
          <span style={{ fontSize: '0.8rem', color: '#A7B0C8' }}>
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
          background: '#101936',
          padding: '0.9rem 1.15rem',
          borderRadius: '10px',
          border: '1px solid #24315C'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: '220px' }}>
          <Search size={18} color="#A7B0C8" />
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
              color: '#F5F7FF',
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
              background: '#151F46',
              border: '1px solid #24315C',
              color: '#F5F7FF',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
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
              background: '#151F46',
              border: '1px solid #24315C',
              color: '#F5F7FF',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
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
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(340px, 1fr)', gap: '1.5rem', alignItems: 'start' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #24315C', paddingBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', color: '#A7B0C8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Event Inspector
              </span>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#F5F7FF', marginTop: '0.15rem' }}>
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
                <div style={{ fontSize: '0.72rem', color: '#A7B0C8', textTransform: 'uppercase', fontWeight: 600 }}>Description</div>
                <div style={{ fontSize: '0.9rem', color: '#F5F7FF', fontWeight: 500, marginTop: '0.2rem', lineHeight: 1.45 }}>
                  {activeInspectedEvent.description}
                </div>
              </div>

              {/* Forensic Details Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#151F46', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #24315C' }}>
                  <span style={{ color: '#A7B0C8' }}>Normalized Timestamp:</span>
                  <span style={{ color: '#00B7FF', fontFamily: 'JetBrains Mono, monospace' }}>{activeInspectedEvent.timestamp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#151F46', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #24315C' }}>
                  <span style={{ color: '#A7B0C8' }}>Actor / Security Subject:</span>
                  <span style={{ color: '#F5F7FF', fontWeight: 600 }}>{activeInspectedEvent.actor}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#151F46', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #24315C' }}>
                  <span style={{ color: '#A7B0C8' }}>Host Device:</span>
                  <span style={{ color: '#F5F7FF', fontFamily: 'JetBrains Mono, monospace' }}>{activeInspectedEvent.source_device}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#151F46', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #24315C' }}>
                  <span style={{ color: '#A7B0C8' }}>Source IP:</span>
                  <span style={{ color: '#4DEBFF', fontFamily: 'JetBrains Mono, monospace' }}>{activeInspectedEvent.source_ip}</span>
                </div>
                {activeInspectedEvent.destination_ip && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#151F46', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #24315C' }}>
                    <span style={{ color: '#A7B0C8' }}>Target / Dst IP:</span>
                    <span style={{ color: '#FF3CAC', fontFamily: 'JetBrains Mono, monospace' }}>{activeInspectedEvent.destination_ip}</span>
                  </div>
                )}
              </div>

              {/* MITRE Mapping */}
              {activeInspectedEvent.mitre_technique && (
                <div style={{ background: 'rgba(214, 44, 255, 0.08)', border: '1px solid rgba(214, 44, 255, 0.25)', borderRadius: '8px', padding: '0.75rem 0.9rem' }}>
                  <div style={{ fontSize: '0.68rem', color: '#D62CFF', fontWeight: 600, textTransform: 'uppercase' }}>
                    MITRE ATT&CK Mapping
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#FF3CAC', fontWeight: 600, marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    {activeInspectedEvent.mitre_technique}
                  </div>
                </div>
              )}

              {/* Raw Evidence Line */}
              {activeInspectedEvent.evidence_line && (
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#A7B0C8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Source Log Evidence Record
                  </div>
                  <pre
                    style={{
                      background: '#050816',
                      border: '1px solid #24315C',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.74rem',
                      color: '#F5F7FF',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                      lineHeight: 1.45
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
            <div style={{ color: '#A7B0C8', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
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
