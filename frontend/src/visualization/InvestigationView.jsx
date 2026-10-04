import React, { useState, useCallback, useMemo } from 'react';
import { RelationshipGraph } from './RelationshipGraph';
import { IncidentTimeline, formatEventType } from './IncidentTimeline';

/**
 * InvestigationView Component for Cyber Twin
 * 
 * Comprehensive investigator-facing workbench integrating:
 * 1. Case Header with dynamic telemetry (case_id, events, entities, relationships, evidence counts)
 * 2. Synchronized IncidentTimeline (chronological event sequence)
 * 3. Synchronized RelationshipGraph (topological entity and interaction graph)
 * 4. Forensic Evidence & Correlation Inspector (deep evidence traceability into evidence_map)
 * 5. Investigation Status & Footer bar (active focus indicator, quick clear focus)
 * 
 * Synchronization Architecture:
 * - Timeline event selection illuminates corresponding nodes & edges in the graph, dimming unrelated ones.
 * - Graph edge selection with a triggering_event_id focuses that event in the timeline and graph.
 * - Clear Focus action completely restores full graph visibility and unselects the timeline.
 * - 100% generic: zero hardcoded mock event IDs, entity IDs, or case IDs.
 * 
 * Props:
 * - model: CyberTwinDataModel (required)
 * - initialEventId: string | null (optional)
 * - onEventSelect: (event: BackendEvent) => void (optional callback)
 * - onNodeSelect: (nodeData: Object) => void (optional callback)
 * - onEdgeSelect: (edgeData: Object) => void (optional callback)
 * - height: string | number (default: '860px')
 * - width: string | number (default: '100%')
 */
export function InvestigationView({
  model,
  initialEventId = null,
  onEventSelect,
  onNodeSelect,
  onEdgeSelect,
  height = '860px',
  width = '100%'
}) {
  // Master synchronization state
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [selectedGraphItem, setSelectedGraphItem] = useState(null);

  // Dynamically resolve case_id from model or fallback safely to first event
  const caseId = useMemo(() => {
    if (model?.case_id) return model.case_id;
    if (Array.isArray(model?.events) && model.events.length > 0 && model.events[0]?.case_id) {
      return model.events[0].case_id;
    }
    return 'UNSPECIFIED_CASE';
  }, [model]);

  // Dynamic telemetry counts
  const totalEvents = model?.events?.length || 0;
  const totalEntities = model?.entities?.length || 0;
  const totalRelationships = model?.relationships?.length || 0;
  const totalEvidence = model?.evidence_map ? Object.keys(model.evidence_map).length : 0;

  // Selected event object lookup
  const selectedEventObj = useMemo(() => {
    if (!selectedEventId || !model || !Array.isArray(model.events)) return null;
    return model.events.find(e => e.event_id === selectedEventId) || null;
  }, [selectedEventId, model]);

  // Trace evidence record from evidence_map
  const selectedEvidenceRecord = useMemo(() => {
    if (!selectedEventObj?.evidence_id || !model?.evidence_map) return null;
    return model.evidence_map[selectedEventObj.evidence_id] || null;
  }, [selectedEventObj, model]);

  // Incident time range summary
  const timeRangeSummary = useMemo(() => {
    if (!model?.events || model.events.length === 0) return null;
    const timestamps = model.events.map(e => e.timestamp).filter(Boolean).sort();
    if (timestamps.length === 0) return null;
    return {
      start: timestamps[0],
      end: timestamps[timestamps.length - 1]
    };
  }, [model]);

  // Timeline Event Selection Handler
  const handleTimelineEventSelect = useCallback((event) => {
    if (!event) return;
    setSelectedEventId(event.event_id);
    setSelectedGraphItem(null); // Reset ad-hoc graph click to focus on the selected event
    if (typeof onEventSelect === 'function') {
      onEventSelect(event);
    }
  }, [onEventSelect]);

  // Graph Node Click Handler
  const handleGraphNodeSelect = useCallback((nodeData) => {
    setSelectedGraphItem({ type: 'node', data: nodeData });
    if (typeof onNodeSelect === 'function') {
      onNodeSelect(nodeData);
    }
  }, [onNodeSelect]);

  // Graph Edge Click Handler: synchronize with triggering event if available
  const handleGraphEdgeSelect = useCallback((edgeData) => {
    setSelectedGraphItem({ type: 'edge', data: edgeData });
    const triggeringEvtId = edgeData?.triggering_event_id || edgeData?.eventId;
    if (triggeringEvtId && model?.events) {
      const matchedEvt = model.events.find(e => e.event_id === triggeringEvtId);
      if (matchedEvt) {
        setSelectedEventId(matchedEvt.event_id);
        if (typeof onEventSelect === 'function') {
          onEventSelect(matchedEvt);
        }
      }
    }
    if (typeof onEdgeSelect === 'function') {
      onEdgeSelect(edgeData);
    }
  }, [model, onEventSelect, onEdgeSelect]);

  // Clear Focus Action: restores graph and timeline to normal full view
  const handleClearFocus = useCallback(() => {
    setSelectedEventId(null);
    setSelectedGraphItem(null);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width,
      height,
      border: '1px solid #cbd5e1',
      borderRadius: '12px',
      backgroundColor: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.08)'
    }}>
      {/* 1. Header: Case Information & Dynamic Telemetry */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 20px',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderBottom: '1px solid #1e293b'
      }}>
        {/* Left: Workbench Title & Case Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            fontSize: '18px'
          }}>
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <strong style={{ fontSize: '16px', letterSpacing: '-0.01em', color: '#f8fafc' }}>
                Cyber Twin Investigation Workbench
              </strong>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                backgroundColor: '#1e293b',
                color: '#38bdf8',
                borderRadius: '6px',
                fontWeight: 700,
                border: '1px solid #0284c7'
              }}>
                Case: {caseId}
              </span>
            </div>
            {timeRangeSummary && (
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Incident Window: {timeRangeSummary.start} &rarr; {timeRangeSummary.end}
              </div>
            )}
          </div>
        </div>

        {/* Center: Dynamic Telemetry Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 14px',
            backgroundColor: '#1e293b',
            borderRadius: '8px',
            border: '1px solid #334155',
            fontSize: '12px'
          }}>
            <div>
              <span style={{ color: '#94a3b8' }}>Events: </span>
              <strong style={{ color: '#f8fafc' }}>{totalEvents}</strong>
            </div>
            <div style={{ width: '1px', height: '14px', backgroundColor: '#475569' }} />
            <div>
              <span style={{ color: '#94a3b8' }}>Entities: </span>
              <strong style={{ color: '#38bdf8' }}>{totalEntities}</strong>
            </div>
            <div style={{ width: '1px', height: '14px', backgroundColor: '#475569' }} />
            <div>
              <span style={{ color: '#94a3b8' }}>Relationships: </span>
              <strong style={{ color: '#a855f7' }}>{totalRelationships}</strong>
            </div>
            <div style={{ width: '1px', height: '14px', backgroundColor: '#475569' }} />
            <div>
              <span style={{ color: '#94a3b8' }}>Evidence Records: </span>
              <strong style={{ color: '#22c55e' }}>{totalEvidence}</strong>
            </div>
          </div>
        </div>

        {/* Right: Active Investigation State & Clear Focus Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {selectedEventId ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '4px 12px',
              backgroundColor: '#450a0a',
              border: '1px solid #dc2626',
              borderRadius: '8px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                boxShadow: '0 0 8px #ef4444'
              }} />
              <div style={{ fontSize: '12px', color: '#fecaca' }}>
                Focus: <strong>{selectedEventId}</strong>
                {selectedEventObj?.evidence_id && (
                  <span style={{ marginLeft: '6px', color: '#fca5a5', fontSize: '11px' }}>
                    [Evd: {selectedEventObj.evidence_id}]
                  </span>
                )}
              </div>
              <button
                onClick={handleClearFocus}
                title="Restore full graph and timeline overview"
                style={{
                  border: 'none',
                  backgroundColor: '#7f1d1d',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                Clear Focus ✕
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: '#1e293b',
              borderRadius: '6px',
              border: '1px solid #334155'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981'
              }} />
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                Overview Mode (100% visible)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Workbench Split: Timeline (Left) & Relationship Graph (Right) */}
      <div style={{
        display: 'flex',
        flex: '1 1 auto',
        minHeight: 0,
        gap: '10px',
        padding: '10px',
        overflow: 'hidden'
      }}>
        {/* Left Pane: Incident Timeline */}
        <div style={{
          flex: '0 0 42%',
          minWidth: '320px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <IncidentTimeline
            events={model?.events || []}
            selectedEventId={selectedEventId}
            onEventSelect={handleTimelineEventSelect}
            height="100%"
            width="100%"
            title="Chronological Incident Timeline"
          />
        </div>

        {/* Right Pane: Synchronized Relationship Graph */}
        <div style={{
          flex: '1 1 58%',
          minWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <RelationshipGraph
            model={model}
            selectedEventId={selectedEventId}
            onNodeSelect={handleGraphNodeSelect}
            onEdgeSelect={handleGraphEdgeSelect}
            onSelectionClear={handleClearFocus}
            height="100%"
            width="100%"
          />
        </div>
      </div>

      {/* 3. Forensic Evidence & Correlation Inspector Drawer */}
      <div style={{
        borderTop: '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        padding: '10px 16px',
        maxHeight: '180px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '6px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              🔍 Forensic Correlation & Evidence Trace
            </span>
            {selectedEventId ? (
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontWeight: 600,
                border: '1px solid #fecaca'
              }}>
                Target Event: {selectedEventId}
              </span>
            ) : (
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                Select an event or graph element to view forensic evidence links
              </span>
            )}
          </div>
          {selectedEventId && (
            <button
              onClick={handleClearFocus}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reset Inspector
            </button>
          )}
        </div>

        {selectedEventObj ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '8px',
            fontSize: '12px'
          }}>
            {/* Event Summary Box */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 10px'
            }}>
              <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>EVENT CONTEXT</div>
              <div style={{ marginTop: '3px', fontWeight: 600, color: '#0f172a' }}>
                {formatEventType ? formatEventType(selectedEventObj.event_type) : selectedEventObj.event_type}
              </div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>
                Time: {selectedEventObj.timestamp}
              </div>
            </div>

            {/* Evidence Trace Box */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 10px'
            }}>
              <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>EVIDENCE RECORD</div>
              <div style={{ marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ color: '#0284c7' }}>{selectedEventObj.evidence_id || 'NO_EVIDENCE_ID'}</strong>
                {selectedEvidenceRecord ? (
                  <span style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    borderRadius: '3px',
                    fontWeight: 600
                  }}>
                    VERIFIED IN EVIDENCE MAP
                  </span>
                ) : (
                  <span style={{
                    fontSize: '10px',
                    padding: '1px 5px',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    borderRadius: '3px'
                  }}>
                    UNMAPPED
                  </span>
                )}
              </div>
              {selectedEvidenceRecord && (
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                  Linked Events: {(selectedEvidenceRecord.event_ids || selectedEvidenceRecord.related_event_ids || []).length} |
                  Linked Entities: {(selectedEvidenceRecord.entity_ids || selectedEvidenceRecord.related_entity_ids || []).length}
                </div>
              )}
            </div>

            {/* Participating Entities Box */}
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 10px'
            }}>
              <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>CORRELATED ENTITIES</div>
              <div style={{ marginTop: '3px', color: '#0f172a', fontSize: '11px' }}>
                {selectedEventObj.user && <div>👤 User: <strong>{selectedEventObj.user}</strong></div>}
                {selectedEventObj.device && <div>💻 Device: <strong>{selectedEventObj.device}</strong></div>}
                {selectedEventObj.source_ip && <div>🌐 Src IP: <code>{selectedEventObj.source_ip}</code></div>}
                {selectedEventObj.destination_ip && <div>🎯 Dst IP: <code>{selectedEventObj.destination_ip}</code></div>}
                {selectedEventObj.file && <div>📄 File: <code>{selectedEventObj.file}</code></div>}
                {selectedEventObj.server && <div>🖥️ Server: <code>{selectedEventObj.server}</code></div>}
              </div>
            </div>
          </div>
        ) : selectedGraphItem ? (
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px'
          }}>
            <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>
              SELECTED GRAPH ELEMENT ({selectedGraphItem.type.toUpperCase()})
            </div>
            <div style={{ marginTop: '4px', color: '#0f172a' }}>
              {selectedGraphItem.type === 'node' ? (
                <div>
                  <strong>{selectedGraphItem.data.label || selectedGraphItem.data.id}</strong>
                  <span style={{ marginLeft: '8px', color: '#64748b' }}>
                    Type: {selectedGraphItem.data.entity_type}
                  </span>
                  {selectedGraphItem.data.evidence_ids && (
                    <span style={{ marginLeft: '8px', color: '#0284c7' }}>
                      Evidence: {selectedGraphItem.data.evidence_ids.join(', ')}
                    </span>
                  )}
                </div>
              ) : (
                <div>
                  <strong>Relationship: {selectedGraphItem.data.relationship_type}</strong>
                  <span style={{ marginLeft: '8px', color: '#64748b' }}>
                    {selectedGraphItem.data.source} &rarr; {selectedGraphItem.data.target}
                  </span>
                  {(selectedGraphItem.data.eventId || selectedGraphItem.data.triggering_event_id) && (
                    <span style={{ marginLeft: '8px', color: '#dc2626' }}>
                      Event: {selectedGraphItem.data.eventId || selectedGraphItem.data.triggering_event_id}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            border: '1px dashed #cbd5e1',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <span>
              💡 Select any event card in the timeline or click an edge/node in the graph to inspect correlated evidence artifacts.
            </span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              {totalEvents} Total Events Indexed
            </span>
          </div>
        )}
      </div>

      {/* 4. Footer: Status Area */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        backgroundColor: '#f1f5f9',
        borderTop: '1px solid #e2e8f0',
        fontSize: '11px',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: '#10b981'
          }} />
          <span>CYBER TWIN ENGINE ACTIVE &bull; Synchronized Visualization</span>
        </div>
        <div>
          <span>Case: {caseId} &bull; </span>
          <span>
            {selectedEventId
              ? `Focused on Event [${selectedEventId}]`
              : 'All Entities & Relationships Active'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default InvestigationView;
