import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  accentColor?: string;
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  accentColor = '#00f2fe',
  badge
}) => {
  return (
    <div
      style={{
        background: '#0d1424',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.15s ease, border-color 0.15s ease'
      }}
    >
      {/* Accent glow line top */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, ${accentColor} 0%, transparent 100%)`
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            background: 'rgba(30, 41, 59, 0.5)',
            border: `1px solid rgba(255, 255, 255, 0.08)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
        <span
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: '#f8fafc',
            lineHeight: 1
          }}
        >
          {value}
        </span>
        {badge && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', lineHeight: 1.3 }}>
          {subtext}
        </p>
      )}
    </div>
  );
};
