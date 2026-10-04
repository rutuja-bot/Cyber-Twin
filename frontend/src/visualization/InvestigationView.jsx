import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { RelationshipGraph } from './RelationshipGraph';
import { IncidentTimeline, formatEventType } from './IncidentTimeline';
import { CyberTwin3DView } from './CyberTwin3DView';
import {
  calculateNextIndex,
  calculatePrevIndex,
  getPlaybackIntervalMs,
  formatReplayProgress,
  PLAYBACK_SPEEDS
} from './replayEngine';
import { identifyAttackPath } from './attackPath';

/**
 * InvestigationView Component for Cyber Twin
 * 
 * Comprehensive investigator-facing workbench integrating:
 * 1. Case Header with dynamic telemetry (case_id, events, entities, relationships, evidence counts)
 * 2. Attack Path Only Toggle (isolating adversary progression: Patient Zero -> Pivots -> Target)
 * 3. Incident Replay Control Toolbar (Play, Pause, Step Next/Prev, Speed Multiplier, Scrubber)
 * 4. Synchronized IncidentTimeline (chronological event sequence)
 * 5. Synchronized 2D RelationshipGraph (topological entity and interaction graph)
 * 6. 3D Cyber Twin Infrastructure Layer (Three.js spatial enterprise topology and animated threat beams)
 * 7. Forensic Evidence & Correlation Inspector (deep evidence traceability into evidence_map)
 * 8. Investigation Status & Footer bar (active focus indicator, quick clear focus)
 * 
 * Synchronization Architecture:
 * - Timeline event selection illuminates corresponding nodes & edges in both 2D and 3D graphs.
 * - Graph edge selection with a triggering_event_id focuses that event in the timeline and graphs.
 * - Replay stepping/scrubbing/playing updates the focused event, driving synchronized visual state.
 * - Attack Path toggle isolates attack nodes and edges while strongly dimming non-attack background elements.
 * - Clear Focus action completely restores full graph visibility and unselects the timeline.
 * - 100% generic: zero hardcoded mock event IDs, entity IDs, or case IDs.
 * 
 * Props:
 * - model: CyberTwinDataModel (required)
 * - initialEventId: string | null (optional)
 * - initialAttackPathOnly: boolean (default: false)
 * - onEventSelect: (event: BackendEvent) => void (optional callback)
 * - onNodeSelect: (nodeData: Object) => void (optional callback)
 * - onEdgeSelect: (edgeData: Object) => void (optional callback)
 * - height: string | number (default: '860px')
 * - width: string | number (default: '100%')
 */
export function InvestigationView({
  model,
  initialEventId = null,
  initialAttackPathOnly = false,
  onEventSelect,
  onNodeSelect,
  onEdgeSelect,
  height = '860px',
  width = '100%'
}) {
  // Master synchronization state
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [selectedGraphItem, setSelectedGraphItem] = useState(null);

  // Attack Path Only mode state
  const [attackPathOnly, setAttackPathOnly] = useState(initialAttackPathOnly);

  // View Mode: 'split' (2D + 3D) | '2d' | '3d'
  const [viewMode, setViewMode] = useState('split');

  // Incident Replay Engine state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Attack path telemetry and categorization derived deterministically from model
  const attackPathInfo = useMemo(() => {
    return identifyAttackPath(model);
  }, [model]);

  // Chronologically sorted events array for replay and timeline sequencing
  const sortedEvents = useMemo(() => {
    if (!model?.events || !Array.isArray(model.events)) return [];
    return [...model.events].sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      if (timeA !== timeB) return timeA - timeB;
      return (a.event_id || '').localeCompare(b.event_id || '');
    });
  }, [model]);

  // Current replay index derived from selectedEventId (-1 if no event is currently focused)
  const currentEventIndex = useMemo(() => {
    if (!selectedEventId || sortedEvents.length === 0) return -1;
    return sortedEvents.findIndex(e => e.event_id === selectedEventId);
  }, [selectedEventId, sortedEvents]);

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

  // Replay Step Forward: advance by exactly one event, stopping at the final event
  const handleStepForward = useCallback(() => {
    if (sortedEvents.length === 0) return;
    const curIdx = sortedEvents.findIndex(e => e.event_id === selectedEventId);
    const nextIdx = calculateNextIndex(curIdx, sortedEvents.length);
    if (sortedEvents[nextIdx]) {
      setSelectedEventId(sortedEvents[nextIdx].event_id);
      setSelectedGraphItem(null);
      if (typeof onEventSelect === 'function') {
        onEventSelect(sortedEvents[nextIdx]);
      }
    }
  }, [sortedEvents, selectedEventId, onEventSelect]);

  // Replay Step Backward: move backward by exactly one event, stopping at index 0
  const handleStepBackward = useCallback(() => {
    if (sortedEvents.length === 0) return;
    const curIdx = sortedEvents.findIndex(e => e.event_id === selectedEventId);
    const prevIdx = calculatePrevIndex(curIdx, sortedEvents.length);
    if (sortedEvents[prevIdx]) {
      setSelectedEventId(sortedEvents[prevIdx].event_id);
      setSelectedGraphItem(null);
      if (typeof onEventSelect === 'function') {
        onEventSelect(sortedEvents[prevIdx]);
      }
    }
  }, [sortedEvents, selectedEventId, onEventSelect]);

  // Replay Play/Pause Toggle
  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (sortedEvents.length === 0) return;
      const curIdx = sortedEvents.findIndex(e => e.event_id === selectedEventId);
      // If at end or none selected, start playback from first event
      if (curIdx === -1 || curIdx >= sortedEvents.length - 1) {
        setSelectedEventId(sortedEvents[0].event_id);
        setSelectedGraphItem(null);
        if (typeof onEventSelect === 'function') {
          onEventSelect(sortedEvents[0]);
        }
      }
      setIsPlaying(true);
    }
  }, [isPlaying, sortedEvents, selectedEventId, onEventSelect]);

  // Replay Scrubber Drag Handler
  const handleScrubberChange = useCallback((e) => {
    const targetIdx = parseInt(e.target.value, 10);
    if (!isNaN(targetIdx) && targetIdx >= 0 && targetIdx < sortedEvents.length) {
      const targetEvt = sortedEvents[targetIdx];
      if (targetEvt) {
        setSelectedEventId(targetEvt.event_id);
        setSelectedGraphItem(null);
        if (typeof onEventSelect === 'function') {
          onEventSelect(targetEvt);
        }
      }
    }
  }, [sortedEvents, onEventSelect]);

  // Playback timer effect: advances events dynamically based on playbackSpeed
  useEffect(() => {
    if (!isPlaying || sortedEvents.length === 0) return;

    const intervalMs = getPlaybackIntervalMs(playbackSpeed);
    const timer = setInterval(() => {
      setSelectedEventId(prevId => {
        const curIdx = sortedEvents.findIndex(e => e.event_id === prevId);
        if (curIdx < sortedEvents.length - 1) {
          const nextIdx = curIdx === -1 ? 0 : curIdx + 1;
          const nextEvt = sortedEvents[nextIdx];
          if (typeof onEventSelect === 'function' && nextEvt) {
            onEventSelect(nextEvt);
          }
          return nextEvt ? nextEvt.event_id : prevId;
        } else {
          // Reached the final event: automatically stop playback
          setIsPlaying(false);
          return prevId;
        }
      });
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [isPlaying, playbackSpeed, sortedEvents, onEventSelect]);

  // Clear Focus Action: restores graph and timeline to normal full view and stops playback
  const handleClearFocus = useCallback(() => {
    setIsPlaying(false);
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

        {/* Right: Attack Path Isolation Toggle & Active Investigation State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Attack Path Isolation Toggle Button */}
          <button
            onClick={() => setAttackPathOnly(prev => !prev)}
            role="button"
            aria-label={`Attack Path Only: ${attackPathOnly ? 'ON' : 'OFF'}`}
            title="Isolate primary adversary progression (Patient Zero -> Pivots -> Target)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              backgroundColor: attackPathOnly ? '#991b1b' : '#1e293b',
              color: attackPathOnly ? '#fee2e2' : '#cbd5e1',
              border: attackPathOnly ? '1.5px solid #ef4444' : '1px solid #475569',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: attackPathOnly ? '0 0 10px rgba(239, 68, 68, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{attackPathOnly ? '⚡' : '🛡️'}</span>
            <span>Attack Path Only: <strong>{attackPathOnly ? 'ON' : 'OFF'}</strong></span>
          </button>

          {attackPathOnly && (
            <span style={{
              fontSize: '11px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: '#450a0a',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              fontWeight: 600
            }}>
              ⚡ Attack Path ({attackPathInfo.attackEventIds.length} Events)
            </span>
          )}

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

      {/* 2. Replay Toolbar: Chronological Playback, Stepping, Speed Multiplier & Scrubber */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '8px 20px',
        backgroundColor: '#1e293b',
        borderBottom: '1px solid #334155',
        color: '#f8fafc'
      }}>
        {/* Left: Stepping and Play/Pause Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleStepBackward}
            disabled={currentEventIndex <= 0}
            aria-label="Previous Event"
            title="Step backward to previous event"
            style={{
              padding: '6px 12px',
              backgroundColor: currentEventIndex <= 0 ? '#334155' : '#0f172a',
              color: currentEventIndex <= 0 ? '#64748b' : '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '6px',
              cursor: currentEventIndex <= 0 ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            ⏮ Previous Event
          </button>

          <button
            onClick={handlePlayToggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause automatic replay" : "Start automatic chronological replay"}
            style={{
              padding: '6px 16px',
              backgroundColor: isPlaying ? '#eab308' : '#0284c7',
              color: isPlaying ? '#0f172a' : '#ffffff',
              border: isPlaying ? '1px solid #ca8a04' : '1px solid #0369a1',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isPlaying ? '0 0 10px rgba(234, 179, 8, 0.4)' : '0 0 10px rgba(2, 132, 199, 0.3)'
            }}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          <button
            onClick={handleStepForward}
            disabled={currentEventIndex >= totalEvents - 1 || totalEvents === 0}
            aria-label="Next Event"
            title="Step forward to next event"
            style={{
              padding: '6px 12px',
              backgroundColor: (currentEventIndex >= totalEvents - 1 || totalEvents === 0) ? '#334155' : '#0f172a',
              color: (currentEventIndex >= totalEvents - 1 || totalEvents === 0) ? '#64748b' : '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '6px',
              cursor: (currentEventIndex >= totalEvents - 1 || totalEvents === 0) ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Next Event ⏭
          </button>

          {/* Replay Status Badge */}
          <span style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '4px',
            backgroundColor: isPlaying ? 'rgba(234, 179, 8, 0.2)' : 'rgba(51, 65, 85, 0.6)',
            color: isPlaying ? '#fef08a' : '#94a3b8',
            border: isPlaying ? '1px solid #ca8a04' : '1px solid #475569',
            fontWeight: 600,
            marginLeft: '4px'
          }}>
            {isPlaying ? `REPLAY ACTIVE (${playbackSpeed}x)` : 'REPLAY PAUSED'}
          </span>
        </div>

        {/* Center: Scrubber Range Slider & Progress Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: '1 1 240px',
          maxWidth: '480px'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#38bdf8',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            minWidth: '85px'
          }}>
            {formatReplayProgress(currentEventIndex, totalEvents)}
          </span>

          <input
            type="range"
            min="0"
            max={totalEvents > 0 ? totalEvents - 1 : 0}
            value={currentEventIndex >= 0 ? currentEventIndex : 0}
            onChange={handleScrubberChange}
            aria-label="Incident timeline replay scrubber"
            title="Drag to scrub through incident timeline"
            style={{
              flex: 1,
              accentColor: '#38bdf8',
              cursor: 'pointer',
              height: '6px'
            }}
          />

          {selectedEventObj && (
            <span style={{
              fontSize: '11px',
              color: '#e2e8f0',
              backgroundColor: '#0f172a',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #334155',
              whiteSpace: 'nowrap',
              fontFamily: 'monospace'
            }}>
              {selectedEventObj.event_id}
            </span>
          )}
        </div>

        {/* Right: Replay Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Speed:</span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            borderRadius: '6px',
            border: '1px solid #334155',
            padding: '2px'
          }}>
            {PLAYBACK_SPEEDS.map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                aria-label={`Playback speed ${speed}x`}
                style={{
                  padding: '3px 8px',
                  backgroundColor: playbackSpeed === speed ? '#0284c7' : 'transparent',
                  color: playbackSpeed === speed ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: playbackSpeed === speed ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Far Right: Visualization Mode Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Topology:</span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            borderRadius: '6px',
            border: '1px solid #334155',
            padding: '2px'
          }}>
            <button
              onClick={() => setViewMode('split')}
              aria-label="View Mode: Split 2D + 3D"
              title="Show both 2D Cytoscape Graph and 3D Cyber Twin infrastructure"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: viewMode === 'split' ? '#0284c7' : 'transparent',
                color: viewMode === 'split' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              ◫ Split
            </button>
            <button
              onClick={() => setViewMode('2d')}
              aria-label="View Mode: 2D Graph Only"
              title="Focus exclusively on 2D Cytoscape Relationship Graph"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: viewMode === '2d' ? '#0284c7' : 'transparent',
                color: viewMode === '2d' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              2D Graph
            </button>
            <button
              onClick={() => setViewMode('3d')}
              aria-label="View Mode: 3D Cyber Twin Only"
              title="Focus exclusively on 3D Cyber Twin Infrastructure"
              style={{
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: viewMode === '3d' ? '#0284c7' : 'transparent',
                color: viewMode === '3d' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              3D Cyber Twin
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Workbench Split: Timeline (Left) & Visualizations (Right) */}
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
          flex: '0 0 32%',
          minWidth: '280px',
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
            attackPathOnly={attackPathOnly}
            attackPathEventIds={attackPathInfo.attackEventIds}
            height="100%"
            width="100%"
            title="Chronological Incident Timeline"
          />
        </div>

        {/* Center & Right Visualizations Container */}
        <div style={{
          flex: '1 1 68%',
          minWidth: '320px',
          display: 'flex',
          gap: '10px',
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {/* 2D Relationship Graph Pane */}
          {(viewMode === 'split' || viewMode === '2d') && (
            <div style={{
              flex: viewMode === 'split' ? '1 1 50%' : '1 1 100%',
              minWidth: '260px',
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
                attackPathOnly={attackPathOnly}
                attackPathNodeIds={attackPathInfo.attackNodeIds}
                attackPathEdgeIds={attackPathInfo.attackEdgeIds}
                onNodeSelect={handleGraphNodeSelect}
                onEdgeSelect={handleGraphEdgeSelect}
                onSelectionClear={handleClearFocus}
                height="100%"
                width="100%"
              />
            </div>
          )}

          {/* 3D Cyber Twin Infrastructure Pane */}
          {(viewMode === 'split' || viewMode === '3d') && (
            <div style={{
              flex: viewMode === 'split' ? '1 1 50%' : '1 1 100%',
              minWidth: '260px',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              backgroundColor: '#090d16',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              overflow: 'hidden'
            }}>
              <CyberTwin3DView
                model={model}
                selectedEventId={selectedEventId}
                attackPathOnly={attackPathOnly}
                attackPathNodeIds={attackPathInfo.attackNodeIds}
                attackPathEdgeIds={attackPathInfo.attackEdgeIds}
                onNodeSelect={handleGraphNodeSelect}
                height="100%"
                width="100%"
              />
            </div>
          )}
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
            {attackPathOnly ? `Attack Path Mode (${attackPathInfo.attackEventIds.length} Events) &bull; ` : ''}
            {selectedEventId
              ? `Focused on Event [${selectedEventId}]`
              : (attackPathOnly ? 'Adversary Flow Isolated' : 'All Entities & Relationships Active')}
          </span>
        </div>
      </div>
    </div>
  );
}

export default InvestigationView;
