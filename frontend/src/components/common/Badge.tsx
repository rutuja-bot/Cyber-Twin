import React from 'react';
import { SeverityLevel, CaseStatus, ProcessingStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: SeverityLevel | CaseStatus | ProcessingStatus | 'default' | 'cyan' | 'purple';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  pulse = false
}) => {
  const getColors = () => {
    switch (variant) {
      case 'critical':
        return { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#fca5a5' };
      case 'high':
        return { bg: 'rgba(244, 63, 94, 0.15)', border: '#f43f5e', text: '#fda4af' };
      case 'medium':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#fcd34d' };
      case 'low':
        return { bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8', text: '#bae6fd' };
      case 'info':
        return { bg: 'rgba(148, 163, 184, 0.15)', border: '#64748b', text: '#cbd5e1' };
      case 'investigating':
      case 'open':
        return { bg: 'rgba(0, 242, 254, 0.15)', border: '#00f2fe', text: '#a5f3fc' };
      case 'closed':
      case 'verified':
      case 'parsed':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#6ee7b7' };
      case 'cyan':
        return { bg: 'rgba(0, 242, 254, 0.15)', border: '#00f2fe', text: '#00f2fe' };
      case 'purple':
        return { bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7', text: '#d8b4fe' };
      default:
        return { bg: 'rgba(30, 41, 59, 0.5)', border: '#334155', text: '#94a3b8' };
    }
  };

  const colors = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.375rem',
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.25rem 0.65rem',
        borderRadius: '9999px',
        fontSize: size === 'sm' ? '0.7rem' : '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        fontFamily: 'JetBrains Mono, monospace',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        lineHeight: 1
      }}
    >
      {pulse && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: colors.border,
            boxShadow: `0 0 8px ${colors.border}`
          }}
        />
      )}
      {children}
    </span>
  );
};
