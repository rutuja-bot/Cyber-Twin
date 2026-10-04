import React, { useState, useMemo } from 'react';

/**
 * Formats a raw snake_case or kebab-case event_type string into a human-readable title.
 * Generic and does not rely on any specific event names.
 * @param {string} eventType 
 * @returns {string}
 */
export function formatEventType(eventType) {
  if (!eventType || typeof eventType !== 'string') return 'Unknown Event';
  return eventType
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Returns dynamic visual theme cues based on generic event characteristics.
 * Generic keyword heuristic; does not hardcode event IDs.
 * @param {string} eventType 
 * @returns {{ badgeBg: string, badgeColor: string, borderColor: string }}
 */
function getEventVisualCues(eventType) {
  const lower = (eventType || '').toLowerCase();
  if (lower.includes('suspicious') || lower.includes('exfil') || lower.includes('malicious') || lower.includes('attack') || lower.includes('unauthorized')) {
    return {
      badgeBg: '#fee2e2',
      badgeColor: '#991b1b',
      borderColor: '#ef4444',
      dotColor: '#ef4444'
    };
  }
  if (lower.includes('transfer') || lower.includes('connect') || lower.includes('network') || lower.includes('remote')) {
    return {
      badgeBg: '#fef3c7',
      badgeColor: '#92400e',
      borderColor: '#f59e0b',
      dotColor: '#f59e0b'
    };
  }
  if (lower.includes('file') || lower.includes('access') || lower.includes('process') || lower.includes('exec')) {
    return {
      badgeBg: '#ede9fe',
      badgeColor: '#5b21b6',
      borderColor: '#8b5cf6',
      dotColor: '#8b5cf6'
    };
  }
  return {
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
    borderColor: '#3b82f6',
    dotColor: '#3b82f6'
  };
}

/**
 * IncidentTimeline React Component for Cyber Twin
 * 
 * Renders an interactive, chronological forensic timeline of events with:
 * - Chronological event ordering
 * - Dynamic entity badges (User, Device, IP, File, Server)
 * - Evidence ID link badges
 * - Click-to-select with full 11-field Event v1 Inspector
 * - Generic, contract-bound data handling (zero hardcoding)
 * 
 * Props:
 * - events: Array<BackendEvent> (required)
 * - selectedEventId: string | null (optional controlled selection)
 * - onEventSelect: (event: BackendEvent) => void (optional callback)
 * - height: string | number (default: '620px')
 * - width: string | number (default: '100%')
 * - title: string (default: 'Incident Chronological Timeline')
 */
export function IncidentTimeline({
  events = [],
  selectedEventId = null,
  onEventSelect,
  height = '620px',
  width = '100%',
  title = 'Incident Chronological Timeline'
}) {
  // Sort events strictly in chronological order
  const sortedEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];
    return [...events].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return (a.event_id || '').localeCompare(b.event_id || '');
    });
  }, [events]);

  // Internal selection state (fallback if selectedEventId not provided externally)
  const [internalSelectedId, setInternalSelectedId] = useState(null);

  // Active selected ID (controlled prop takes priority over internal state)
  const activeId = selectedEventId !== null && selectedEventId !== undefined
    ? selectedEventId
    : (internalSelectedId || (sortedEvents.length > 0 ? sortedEvents[0].event_id : null));

  // The active event object
  const activeEvent = useMemo(() => {
    return sortedEvents.find(e => e.event_id === activeId) || null;
  }, [sortedEvents, activeId]);

  const handleEventClick = (evt) => {
    setInternalSelectedId(evt.event_id);
    if (typeof onEventSelect === 'function') {
      onEventSelect(evt);
    }
  };

  const caseId = sortedEvents.length > 0 ? sortedEvents[0].case_id : 'NO_CASE';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width,
      height,
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 1. Header Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <strong style={{ fontSize: '15px', color: '#0f172a' }}>{title}</strong>
          <span style={{
            fontSize: '11px',
            padding: '2px 8px',
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            borderRadius: '4px',
            fontWeight: 600
          }}>
            Case: {caseId}
          </span>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            ({sortedEvents.length} chronological events)
          </span>
        </div>

        {sortedEvents.length > 0 && (
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            <span>Start: <code>{sortedEvents[0].timestamp}</code></span>
            <span style={{ margin: '0 6px' }}>&rarr;</span>
            <span>End: <code>{sortedEvents[sortedEvents.length - 1].timestamp}</code></span>
          </div>
        )}
      </div>

      {/* 2. Main Content Split View (Timeline List on Left, Inspector on Right) */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        
        {/* Left Pane: Scrollable Timeline */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          position: 'relative'
        }}>
          {sortedEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
              No forensic events available in this timeline.
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Vertical Timeline Spine Line */}
              <div style={{
                position: 'absolute',
                top: '12px',
                bottom: '12px',
                left: '19px',
                width: '2px',
                backgroundColor: '#cbd5e1',
                zIndex: 0
              }} />

              {/* Event Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 1 }}>
                {sortedEvents.map((evt, index) => {
                  const isSelected = evt.event_id === activeId;
                  const cues = getEventVisualCues(evt.event_type);

                  return (
                    <div
                      key={evt.event_id}
                      onClick={() => handleEventClick(evt)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleEventClick(evt); }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {/* Step Number Dot on Spine */}
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: isSelected ? cues.dotColor : '#ffffff',
                        color: isSelected ? '#ffffff' : '#334155',
                        border: `2.5px solid ${cues.dotColor}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        flexShrink: 0,
                        boxShadow: isSelected ? `0 0 0 4px ${cues.badgeBg}` : '0 1px 3px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s ease'
                      }}>
                        {index + 1}
                      </div>

                      {/* Event Card */}
                      <div style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#ffffff' : '#ffffff',
                        border: isSelected ? `2px solid #2563eb` : '1px solid #e2e8f0',
                        boxShadow: isSelected
                          ? '0 4px 12px rgba(37,99,235,0.12)'
                          : '0 1px 3px rgba(0,0,0,0.04)',
                        transition: 'all 0.2s ease'
                      }}>
                        {/* Top Line: Badges & Timestamp */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: cues.badgeBg,
                              color: cues.badgeColor
                            }}>
                              {formatEventType(evt.event_type)}
                            </span>
                            <span style={eventIdBadgeStyle}>
                              {evt.event_id}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                              {evt.timestamp}
                            </span>
                            <span style={evidenceBadgeStyle} title={`Linked Forensic Evidence: ${evt.evidence_id}`}>
                              {evt.evidence_id}
                            </span>
                          </div>
                        </div>

                        {/* Middle Line: Dynamic Entity Chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                          {evt.user && (
                            <span style={entityChipStyle('#2563eb', '#eff6ff')}>
                              <span style={chipIconStyle}>👤</span> {evt.user}
                            </span>
                          )}
                          {evt.device && (
                            <span style={entityChipStyle('#0d9488', '#f0fdfa')}>
                              <span style={chipIconStyle}>💻</span> {evt.device}
                            </span>
                          )}
                          {(evt.source_ip || evt.destination_ip) && (
                            <span style={entityChipStyle('#d97706', '#fffbeb')}>
                              <span style={chipIconStyle}>🌐</span>
                              {evt.source_ip || '—'}
                              {evt.destination_ip ? ` → ${evt.destination_ip}` : ''}
                            </span>
                          )}
                          {evt.file && (
                            <span style={entityChipStyle('#7c3aed', '#f5f3ff')}>
                              <span style={chipIconStyle}>📄</span> {evt.file}
                            </span>
                          )}
                          {evt.server && (
                            <span style={entityChipStyle('#dc2626', '#fef2f2')}>
                              <span style={chipIconStyle}>🗄️</span> {evt.server}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Selected Event Details Inspector */}
        <div style={{
          width: '360px',
          borderLeft: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto'
        }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>Event Inspector</strong>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Backend Event v1 Contract</div>
            </div>
            {activeEvent && (
              <span style={evidenceBadgeStyle}>
                {activeEvent.evidence_id}
              </span>
            )}
          </div>

          {activeEvent ? (
            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: getEventVisualCues(activeEvent.event_type).badgeBg,
                  color: getEventVisualCues(activeEvent.event_type).badgeColor
                }}>
                  {formatEventType(activeEvent.event_type)}
                </span>
                <h3 style={{ margin: '8px 0 2px 0', fontSize: '16px', color: '#0f172a' }}>
                  {activeEvent.event_id}
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Case ID: {activeEvent.case_id}</span>
              </div>

              {/* 11-Field Contract Table */}
              <div style={{
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                overflow: 'hidden',
                fontSize: '12px'
              }}>
                <InspectorRow label="Timestamp" value={activeEvent.timestamp} isCode />
                <InspectorRow label="Event Type" value={activeEvent.event_type} />
                <InspectorRow label="User" value={activeEvent.user} />
                <InspectorRow label="Device" value={activeEvent.device} />
                <InspectorRow label="Source IP" value={activeEvent.source_ip} isCode />
                <InspectorRow label="Destination IP" value={activeEvent.destination_ip} isCode />
                <InspectorRow label="File" value={activeEvent.file} isCode />
                <InspectorRow label="Server" value={activeEvent.server} />
                <InspectorRow label="Evidence ID" value={activeEvent.evidence_id} isEvidence />
              </div>

              {/* Forensic Traceability Callout */}
              <div style={{
                padding: '12px',
                borderRadius: '6px',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                fontSize: '11px',
                color: '#166534'
              }}>
                <strong>Forensic Traceability:</strong> This event is bound to evidence record{' '}
                <code>{activeEvent.evidence_id}</code>. In a complete investigation, selecting this event updates the Cyber Twin graph and loads supporting artifacts.
              </div>
            </div>
          ) : (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
              Select an event from the chronological timeline to view its forensic properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Inspector Row Helper Component
 */
function InspectorRow({ label, value, isCode = false, isEvidence = false }) {
  const isNull = value === null || value === undefined || value === '';

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '7px 12px',
      borderBottom: '1px solid #f1f5f9',
      backgroundColor: '#ffffff'
    }}>
      <span style={{ color: '#64748b', fontWeight: '500' }}>{label}</span>
      <span style={{ textAlign: 'right', maxWidth: '200px', wordBreak: 'break-all' }}>
        {isNull ? (
          <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>— (null)</span>
        ) : isEvidence ? (
          <span style={evidenceBadgeStyle}>{value}</span>
        ) : isCode ? (
          <code style={{ fontSize: '11px', color: '#0f172a', backgroundColor: '#f1f5f9', padding: '1px 4px', borderRadius: '3px' }}>
            {value}
          </code>
        ) : (
          <strong style={{ color: '#0f172a' }}>{value}</strong>
        )}
      </span>
    </div>
  );
}

const eventIdBadgeStyle = {
  fontSize: '10px',
  padding: '2px 6px',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  borderRadius: '4px',
  border: '1px solid #e2e8f0',
  fontFamily: 'monospace',
  fontWeight: '600'
};

const evidenceBadgeStyle = {
  fontSize: '10px',
  padding: '2px 6px',
  backgroundColor: '#ecfdf5',
  color: '#065f46',
  borderRadius: '4px',
  border: '1px solid #a7f3d0',
  fontWeight: '700',
  fontFamily: 'monospace'
};

function entityChipStyle(color, bg) {
  return {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '12px',
    backgroundColor: bg,
    color: color,
    border: `1px solid ${color}33`,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    fontWeight: '500'
  };
}

const chipIconStyle = {
  fontSize: '10px'
};

export default IncidentTimeline;
