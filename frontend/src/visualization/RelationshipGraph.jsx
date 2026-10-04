import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import { buildCytoscapeElements, getCytoscapeStylesheet } from './graphElements';

/**
 * RelationshipGraph React Component for Cyber Twin
 * 
 * Renders an interactive, forensic-grade relationship graph representing
 * entities and their interactions extracted from security events.
 * 
 * Props:
 * - model: CyberTwinDataModel (required)
 * - onNodeSelect: (nodeData: Object) => void (optional callback)
 * - onEdgeSelect: (edgeData: Object) => void (optional callback)
 * - onSelectionClear: () => void (optional callback)
 * - layoutName: string (default: 'cose')
 * - height: string | number (default: '620px')
 * - width: string | number (default: '100%')
 */
export function RelationshipGraph({
  model,
  onNodeSelect,
  onEdgeSelect,
  onSelectionClear,
  layoutName = 'cose',
  height = '620px',
  width = '100%'
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // Inspector state for clicked node or edge
  const [selectedItem, setSelectedItem] = useState(null);

  // Initialize and update Cytoscape instance when model or layout changes
  useEffect(() => {
    if (!containerRef.current || !model) return;

    // Build elements strictly from CyberTwinDataModel
    const elements = buildCytoscapeElements(model);

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: getCytoscapeStylesheet(),
      layout: {
        name: layoutName,
        animate: false,
        randomize: false,
        padding: 40,
        nodeRepulsion: 8000,
        idealEdgeLength: 120,
        edgeElasticity: 100
      },
      minZoom: 0.2,
      maxZoom: 3.0,
      wheelSensitivity: 0.2
    });

    cyRef.current = cy;

    // Node click handler
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const data = node.data();
      const payload = {
        type: 'node',
        id: data.id,
        label: data.label,
        entityType: data.entityType,
        firstSeen: data.firstSeen,
        lastSeen: data.lastSeen,
        eventIds: data.eventIds || [],
        evidenceIds: data.evidenceIds || []
      };
      setSelectedItem(payload);
      if (typeof onNodeSelect === 'function') {
        onNodeSelect(payload);
      }
    });

    // Edge click handler
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target;
      const data = edge.data();
      const payload = {
        type: 'edge',
        id: data.id,
        source: data.source,
        target: data.target,
        relationshipType: data.relationshipType,
        eventId: data.eventId,
        evidenceId: data.evidenceId,
        timestamp: data.timestamp
      };
      setSelectedItem(payload);
      if (typeof onEdgeSelect === 'function') {
        onEdgeSelect(payload);
      }
    });

    // Background click (clear selection)
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedItem(null);
        if (typeof onSelectionClear === 'function') {
          onSelectionClear();
        }
      }
    });

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [model, layoutName, onNodeSelect, onEdgeSelect, onSelectionClear]);

  // Toolbar Actions
  const handleFit = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.fit(undefined, 40);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 1.25,
        renderedPosition: {
          x: cyRef.current.width() / 2,
          y: cyRef.current.height() / 2
        }
      });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.zoom({
        level: cyRef.current.zoom() * 0.8,
        renderedPosition: {
          x: cyRef.current.width() / 2,
          y: cyRef.current.height() / 2
        }
      });
    }
  }, []);

  const handleResetLayout = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.layout({
        name: layoutName,
        animate: true,
        animationDuration: 400,
        padding: 40
      }).run();
    }
  }, [layoutName]);

  const handleClearSelection = useCallback(() => {
    if (cyRef.current) {
      cyRef.current.$(':selected').unselect();
    }
    setSelectedItem(null);
    if (typeof onSelectionClear === 'function') {
      onSelectionClear();
    }
  }, [onSelectionClear]);

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
      {/* 1. Header & Graph Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ fontSize: '14px', color: '#0f172a' }}>Investigation Graph</strong>
          {model?.case_id && (
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              borderRadius: '4px',
              fontWeight: 600
            }}>
              Case: {model.case_id}
            </span>
          )}
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            ({model?.entities?.length || 0} entities, {model?.relationships?.length || 0} relationships)
          </span>
        </div>

        {/* Interaction Controls */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            style={toolbarBtnStyle}
          >
            + Zoom In
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            style={toolbarBtnStyle}
          >
            - Zoom Out
          </button>
          <button
            onClick={handleFit}
            title="Fit Graph to View"
            style={toolbarBtnStyle}
          >
            Fit View
          </button>
          <button
            onClick={handleResetLayout}
            title="Relayout Graph"
            style={toolbarBtnStyle}
          >
            Reset Layout
          </button>
          {selectedItem && (
            <button
              onClick={handleClearSelection}
              title="Clear Selection"
              style={{ ...toolbarBtnStyle, backgroundColor: '#fee2e2', color: '#991b1b', borderColor: '#fca5a5' }}
            >
              Clear Focus
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Graph Area & Side Inspector */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Cytoscape Canvas Container */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            backgroundColor: '#f8fafc'
          }}
        />

        {/* Side Inspector Details Panel (appears upon selection) */}
        {selectedItem && (
          <div style={{
            width: '320px',
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #e2e8f0',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
            boxShadow: '-4px 0 16px rgba(0,0,0,0.04)',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: selectedItem.type === 'node' ? '#e0e7ff' : '#fef3c7',
                color: selectedItem.type === 'node' ? '#3730a3' : '#92400e'
              }}>
                {selectedItem.type === 'node' ? `Entity: ${selectedItem.entityType}` : `Relationship: ${selectedItem.relationshipType}`}
              </span>
              <button
                onClick={handleClearSelection}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {/* Node Inspector */}
            {selectedItem.type === 'node' && (
              <>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#0f172a' }}>{selectedItem.label}</h4>
                  <code style={{ fontSize: '11px', color: '#64748b' }}>{selectedItem.id}</code>
                </div>

                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#334155' }}>
                  <div><strong>First Seen:</strong> {selectedItem.firstSeen}</div>
                  <div><strong>Last Seen:</strong> {selectedItem.lastSeen}</div>
                </div>

                {/* Related Events */}
                <div>
                  <strong style={{ fontSize: '12px', color: '#0f172a' }}>Participating Events ({selectedItem.eventIds.length}):</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {selectedItem.eventIds.map(evtId => (
                      <span key={evtId} style={badgeStyle}>
                        {evtId}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Linked Evidence */}
                <div>
                  <strong style={{ fontSize: '12px', color: '#0f172a' }}>Supporting Evidence ({selectedItem.evidenceIds.length}):</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {selectedItem.evidenceIds.map(evId => (
                      <span key={evId} style={evidenceBadgeStyle}>
                        {evId}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Edge Inspector */}
            {selectedItem.type === 'edge' && (
              <>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#0f172a' }}>{selectedItem.relationshipType}</h4>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    <code>{selectedItem.source}</code>
                    <div style={{ margin: '2px 0', color: '#94a3b8' }}>&darr; connects to</div>
                    <code>{selectedItem.target}</code>
                  </div>
                </div>

                <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px', color: '#334155' }}>
                  <div><strong>Triggering Event:</strong> <span style={badgeStyle}>{selectedItem.eventId}</span></div>
                  <div><strong>Supporting Evidence:</strong> <span style={evidenceBadgeStyle}>{selectedItem.evidenceId}</span></div>
                  <div><strong>Timestamp:</strong> {selectedItem.timestamp}</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Legend */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '8px 16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        fontSize: '11px',
        color: '#475569',
        flexWrap: 'wrap'
      }}>
        <strong style={{ color: '#0f172a' }}>Legend:</strong>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#2563EB', display: 'inline-block' }} /> User
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: '#0D9488', display: 'inline-block' }} /> Device
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, transform: 'rotate(45deg)', backgroundColor: '#D97706', display: 'inline-block' }} /> IP
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '3px', backgroundColor: '#7C3AED', display: 'inline-block' }} /> File
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: '#DC2626', display: 'inline-block' }} /> Server
        </span>
        <span style={{ color: '#cbd5e1' }}>|</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 16, height: 2, backgroundColor: '#2563EB', display: 'inline-block' }} /> USES
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 16, height: 2, backgroundColor: '#D97706', display: 'inline-block' }} /> CONNECTED_TO
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 16, height: 2, borderTop: '2px dashed #7C3AED', display: 'inline-block' }} /> ACCESSED
        </span>
      </div>
    </div>
  );
}

const toolbarBtnStyle = {
  padding: '4px 10px',
  fontSize: '12px',
  fontWeight: '500',
  color: '#334155',
  backgroundColor: '#f1f5f9',
  border: '1px solid #cbd5e1',
  borderRadius: '4px',
  cursor: 'pointer'
};

const badgeStyle = {
  fontSize: '10px',
  padding: '2px 6px',
  backgroundColor: '#f1f5f9',
  color: '#475569',
  borderRadius: '4px',
  border: '1px solid #e2e8f0',
  fontFamily: 'monospace'
};

const evidenceBadgeStyle = {
  fontSize: '10px',
  padding: '2px 6px',
  backgroundColor: '#ecfdf5',
  color: '#065f46',
  borderRadius: '4px',
  border: '1px solid #a7f3d0',
  fontWeight: '600',
  fontFamily: 'monospace'
};

export default RelationshipGraph;

