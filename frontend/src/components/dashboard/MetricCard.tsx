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
  accentColor = '#3b82f6',
  badge
}) => {
  return (
    <div
      style={{
        background: '#101936',
        border: '1px solid #24315C',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.75rem',
        boxShadow: '0 4px 18px rgba(5, 8, 22, 0.5)',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#A7B0C8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
        <div
          style={{
            color: accentColor,
            background: 'rgba(22, 119, 255, 0.12)',
            border: '1px solid rgba(0, 183, 255, 0.25)',
            borderRadius: '8px',
            padding: '0.35rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '1.65rem',
            fontWeight: 800,
            fontFamily: 'JetBrains Mono, monospace',
            color: '#F5F7FF',
            lineHeight: 1
          }}
        >
          {value}
        </span>
        {badge && (
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '0.15rem 0.45rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(239, 68, 68, 0.18)',
              color: '#FCA5A5',
              border: '1px solid rgba(239, 68, 68, 0.4)'
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {subtext && (
        <p style={{ fontSize: '0.74rem', color: '#717E9E', lineHeight: 1.35 }}>
          {subtext}
        </p>
      )}
    </div>
  );
};
