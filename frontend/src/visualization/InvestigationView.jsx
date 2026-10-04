import React, { useState, useCallback } from 'react';
import { RelationshipGraph } from './RelationshipGraph';
import { IncidentTimeline } from './IncidentTimeline';

/**
 * InvestigationView React Component for Cyber Twin
 * 
 * Master synchronized integration view connecting:
 * - IncidentTimeline (Chronological event progression)
 * - RelationshipGraph (Topological entity and interaction graph)
 * 
 * Features:
 * - Bi-directional synchronization: selecting an event in the timeline
 *   illuminates all associated entities and relationships in the graph
 *   while dimming unrelated elements.
 * - Unified state management for `selectedEventId`.
 * - Preserves evidence traceability from event -> graph element -> evidence ID.
 * - Generic, contract-bound architecture (zero hardcoded mock values).
 * 
 * Props:
 * - model: CyberTwinDataModel (required)
 * - initialEventId: string | null (optional)
 * - onEventSelect: (event: BackendEvent) => void (optional callback)
 * - onNodeSelect: (nodeData: Object) => void (optional callback)
 * - onEdgeSelect: (edgeData: Object) => void (optional callback)
 * - height: string | number (default: '780px')
 * - width: string | number (default: '100%')
 */
export function InvestigationView({
  model,
  initialEventId = null,
  onEventSelect,
  onNodeSelect,
  onEdgeSelect,
  height = '780px',
  width = '100%'
}) {
  // Master synchronization state: single source of truth for selected event
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [selectedEventObj, setSelectedEventObj] = useState(() => {
    if (!model || !Array.isArray(model.events)) return null;
    return model.events.find(e => e.event_id === initialEventId) || null;
  });

  // Handler when user clicks an event card in the timeline
  const handleTimelineEventSelect = useCallback((event) => {
    setSelectedEventId(event.event_id);
    setSelectedEventObj(event);
    if (typeof onEventSelect === 'function') {
      onEventSelect(event);
    }
  }, [onEventSelect]);

  // Handler to clear event synchronization
  const handleClearFocus = useCallback(() => {
    setSelectedEventId(null);
    setSelectedEventObj(null);
  }, []);

  const caseId = model?.case_id || 'UNKNOWN_CASE';
  const totalEvents = model?.events?.length || 0;
  const totalEntities = model?.entities?.length || 0;
  const totalRelationships = model?.relationships?.length || 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width,
      height,
      border: '1px solid #cbd5e1',
      borderRadius: '10px',
      backgroundColor: '#f1f5f9',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Master Investigation Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        borderBottom: '1px solid #1e293b',
        zIndex: 20
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px' }}>🛡️</span>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '15px', color: '#f8fafc' }}>Cyber Twin Investigation Workbench</strong>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                backgroundColor: '#1e293b',
                color: '#38bdf8',
                borderRadius: '4px',
                fontWeight: 600,
                border: '1px solid #0284c7'
              }}>
                Case: {caseId}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Synchronized Investigation: {totalEvents} Events | {totalEntities} Entities | {totalRelationships} Relationships
            </div>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {selectedEventId ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              backgroundColor: '#450a0a',
              border: '1px solid #dc2626',
              borderRadius: '6px'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', color: '#fecaca' }}>
                Synchronized on Event: <strong>{selectedEventId}</strong>
                {selectedEventObj ? ` (${selectedEventObj.event_type})` : ''}
              </span>
              <button
                onClick={handleClearFocus}
                title="Restore full graph view"
                style={{
                  border: 'none',
                  backgroundColor: '#7f1d1d',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Clear Focus ✕
              </button>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
              Select an event on the timeline to synchronize the investigation graph
            </div>
          )}
        </div>
      </div>

      {/* Main Split Body: Timeline on Left (42%), Relationship Graph on Right (58%) */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        gap: '8px',
        padding: '8px'
      }}>
        {/* Left Pane: Incident Timeline */}
        <div style={{ flex: '0 0 42%', display: 'flex', minHeight: 0 }}>
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
        <div style={{ flex: '1 1 58%', display: 'flex', minHeight: 0 }}>
          <RelationshipGraph
            model={model}
            selectedEventId={selectedEventId}
            onNodeSelect={onNodeSelect}
            onEdgeSelect={onEdgeSelect}
            onSelectionClear={handleClearFocus}
            height="100%"
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}

export default InvestigationView;
