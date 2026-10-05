import React, { useState, useRef } from 'react';
import { Entity, Relationship } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw, ShieldAlert, Layers } from 'lucide-react';

interface NetworkGraphProps {
  entities: Entity[];
  relationships: Relationship[];
  selectedEntity: Entity | null;
  onSelectEntity: (entity: Entity) => void;
}

interface NodePosition {
  x: number;
  y: number;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  entities,
  relationships,
  selectedEntity,
  onSelectEntity
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Layout coordinate generator based on forensic kill-chain flow
  // Layout from left to right: Source Ingress IP -> Target User -> Workstation -> Process -> Local Files / Servers -> Exfiltration Ext IP
  const nodePositions: Record<string, NodePosition> = {
    'ENT-IP-01': { x: 100, y: 220 },     // Pivot / Attacker IP
    'ENT-USER-01': { x: 260, y: 220 },   // Compromised User
    'ENT-DEV-01': { x: 440, y: 220 },    // WS-FIN-04 Workstation
    'ENT-PROC-01': { x: 620, y: 150 },   // Obfuscated PowerShell
    'ENT-SRV-01': { x: 620, y: 320 },    // Internal File Server
    'ENT-FILE-01': { x: 800, y: 320 },   // customer_vault_q3.db
    'ENT-FILE-02': { x: 800, y: 150 },   // svchost_upd.zip
    'ENT-IP-02': { x: 980, y: 220 }      // External C2 IP
  };

  // Fallback layout for any additional entities
  entities.forEach((entity, index) => {
    if (!nodePositions[entity.entity_id]) {
      const col = (index % 4) + 1;
      const row = Math.floor(index / 4);
      nodePositions[entity.entity_id] = {
        x: 150 + col * 180,
        y: 80 + row * 160
      };
    }
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '560px',
        backgroundColor: '#0A1024',
        border: '1px solid #24315C',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        boxShadow: '0 8px 32px rgba(5, 8, 22, 0.5)'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Cyber Grid */}
      <div
        className="bg-grid"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.4
        }}
      />

      {/* Interactive Controls Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          display: 'flex',
          gap: '0.4rem',
          zIndex: 10,
          background: 'rgba(16, 25, 54, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '0.4rem',
          borderRadius: '8px',
          border: '1px solid #24315C',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
          style={{ background: '#151F46', border: '1px solid #24315C', color: '#F5F7FF', padding: '0.45rem', borderRadius: '6px', cursor: 'pointer' }}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
          style={{ background: '#151F46', border: '1px solid #24315C', color: '#F5F7FF', padding: '0.45rem', borderRadius: '6px', cursor: 'pointer' }}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={resetView}
          style={{ background: '#151F46', border: '1px solid #24315C', color: '#F5F7FF', padding: '0.45rem', borderRadius: '6px', cursor: 'pointer' }}
          title="Reset View"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Kill Chain Phase Legend */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 10,
          background: 'rgba(16, 25, 54, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '0.5rem 0.9rem',
          borderRadius: '8px',
          border: '1px solid #24315C',
          fontSize: '0.75rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
        }}
      >
        <span style={{ color: '#A7B0C8', fontWeight: 600 }}>Topology:</span>
        <span style={{ color: '#FF3CAC', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF3CAC', boxShadow: '0 0 8px rgba(255, 60, 172, 0.5)' }} /> Compromised
        </span>
        <span style={{ color: '#00B7FF', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00B7FF', boxShadow: '0 0 8px rgba(0, 183, 255, 0.5)' }} /> Target Asset
        </span>
        <span style={{ color: '#7B2CFF', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7B2CFF', boxShadow: '0 0 8px rgba(123, 44, 255, 0.5)' }} /> Pivot / Host
        </span>
      </div>

      {/* SVG Canvas */}
      <svg
        width="100%"
        height="100%"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          {/* Arrowhead marker */}
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="28"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#00B7FF" opacity="0.8" />
          </marker>
          <marker
            id="arrow-red"
            viewBox="0 0 10 10"
            refX="28"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#FF3CAC" opacity="0.9" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render Relationships (Edges) */}
          {relationships.map((rel) => {
            const src = nodePositions[rel.source_entity_id] || { x: 200, y: 200 };
            const dst = nodePositions[rel.target_entity_id] || { x: 400, y: 200 };

            const isConnectedToSelected =
              selectedEntity &&
              (rel.source_entity_id === selectedEntity.entity_id ||
                rel.target_entity_id === selectedEntity.entity_id);

            const strokeColor = rel.is_suspicious ? '#FF3CAC' : '#24315C';
            const midX = (src.x + dst.x) / 2;
            const midY = (src.y + dst.y) / 2;

            return (
              <g key={rel.relationship_id}>
                {/* Edge line */}
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke={isConnectedToSelected ? '#00B7FF' : strokeColor}
                  strokeWidth={isConnectedToSelected ? 2.5 : 1.5}
                  strokeOpacity={isConnectedToSelected ? 1 : 0.8}
                  strokeDasharray={rel.is_suspicious ? '5,4' : undefined}
                  markerEnd={rel.is_suspicious ? 'url(#arrow-red)' : 'url(#arrow)'}
                />
                {/* Edge label pill */}
                <g transform={`translate(${midX}, ${midY - 8})`}>
                  <rect
                    x={-46}
                    y={-10}
                    width={92}
                    height={18}
                    rx={5}
                    fill="#101936"
                    stroke={isConnectedToSelected ? '#00B7FF' : '#24315C'}
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={2}
                    fill={isConnectedToSelected ? '#00B7FF' : '#A7B0C8'}
                    fontSize={8.5}
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                    fontWeight={500}
                  >
                    {rel.label.length > 14 ? `${rel.label.substring(0, 13)}…` : rel.label}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Render Entities (Nodes) */}
          {entities.map((entity) => {
            const pos = nodePositions[entity.entity_id] || { x: 300, y: 250 };
            const isSelected = selectedEntity?.entity_id === entity.entity_id;
            const nodeColor = entity.is_compromised
              ? '#FF3CAC'
              : entity.is_external
              ? '#7B2CFF'
              : '#00B7FF';

            return (
              <g
                key={entity.entity_id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectEntity(entity);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Clean selection ring */}
                {isSelected && (
                  <circle
                    r={29}
                    fill="none"
                    stroke="#00B7FF"
                    strokeWidth={2}
                    strokeDasharray="4,3"
                    opacity={0.9}
                  />
                )}

                {/* Main Node Body */}
                <circle
                  r={22}
                  fill="#101936"
                  stroke={isSelected ? '#00B7FF' : '#24315C'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />

                {/* Inner Icon / Badge Dot */}
                <circle
                  r={6}
                  fill={nodeColor}
                  cx={0}
                  cy={0}
                />

                {/* Node Name Label */}
                <text
                  x={0}
                  y={36}
                  fill="#F5F7FF"
                  fontSize={10.5}
                  fontWeight={isSelected ? 700 : 500}
                  fontFamily="Inter, sans-serif"
                  textAnchor="middle"
                >
                  {entity.name}
                </text>

                {/* Node Type Subtitle */}
                <text
                  x={0}
                  y={48}
                  fill="#A7B0C8"
                  fontSize={8}
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                >
                  {entity.entity_type}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
