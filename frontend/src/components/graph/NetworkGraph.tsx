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
        backgroundColor: '#070b14',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
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
          opacity: 0.7
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
          background: 'rgba(13, 20, 36, 0.9)',
          padding: '0.35rem',
          borderRadius: '6px',
          border: '1px solid #2d3b55'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.2))}
          style={{ background: '#1e293b', border: 'none', color: '#f8fafc', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.5))}
          style={{ background: '#1e293b', border: 'none', color: '#f8fafc', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={resetView}
          style={{ background: '#1e293b', border: 'none', color: '#f8fafc', padding: '0.4rem', borderRadius: '4px', cursor: 'pointer' }}
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
          background: 'rgba(13, 20, 36, 0.85)',
          padding: '0.5rem 0.85rem',
          borderRadius: '6px',
          border: '1px solid #1e293b',
          fontSize: '0.75rem'
        }}
      >
        <span style={{ color: '#64748b', fontWeight: 600 }}>Topology:</span>
        <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Compromised
        </span>
        <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} /> Target Asset
        </span>
        <span style={{ color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f2fe' }} /> Pivot / Flow
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
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#00f2fe" opacity="0.8" />
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
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" opacity="0.9" />
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

            const strokeColor = rel.is_suspicious ? '#ef4444' : '#00f2fe';
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
                  stroke={isConnectedToSelected ? '#38bdf8' : strokeColor}
                  strokeWidth={isConnectedToSelected ? 3 : 1.8}
                  strokeOpacity={isConnectedToSelected ? 1 : 0.65}
                  strokeDasharray={rel.is_suspicious ? '5,4' : undefined}
                  markerEnd={rel.is_suspicious ? 'url(#arrow-red)' : 'url(#arrow)'}
                />
                {/* Edge label pill */}
                <g transform={`translate(${midX}, ${midY - 8})`}>
                  <rect
                    x={-45}
                    y={-10}
                    width={90}
                    height={18}
                    rx={4}
                    fill="#080c14"
                    stroke={isConnectedToSelected ? '#38bdf8' : '#1e293b'}
                    strokeWidth={1}
                  />
                  <text
                    x={0}
                    y={2}
                    fill={isConnectedToSelected ? '#f8fafc' : '#94a3b8'}
                    fontSize={8.5}
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                    fontWeight={600}
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
              ? '#ef4444'
              : entity.is_external
              ? '#f59e0b'
              : '#00f2fe';

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
                {/* Outer Glow Circle */}
                {isSelected && (
                  <circle
                    r={32}
                    fill="none"
                    stroke="#00f2fe"
                    strokeWidth={2}
                    strokeDasharray="4,3"
                    opacity={0.8}
                  />
                )}

                {/* Main Node Body */}
                <circle
                  r={22}
                  fill="#0d1424"
                  stroke={isSelected ? '#00f2fe' : nodeColor}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={isSelected ? 'drop-shadow(0 0 10px rgba(0, 242, 254, 0.6))' : undefined}
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
                  fill="#f1f5f9"
                  fontSize={10.5}
                  fontWeight={isSelected ? 700 : 600}
                  fontFamily="Inter, sans-serif"
                  textAnchor="middle"
                >
                  {entity.name}
                </text>

                {/* Node Type Subtitle */}
                <text
                  x={0}
                  y={48}
                  fill="#64748b"
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
