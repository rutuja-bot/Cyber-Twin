import React from 'react';
import { SeverityLevel, CaseStatus, ProcessingStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: SeverityLevel | CaseStatus | ProcessingStatus | 'default' | 'neutral' | 'cyan' | 'purple';
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
        return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.45)', text: '#FCA5A5' };
      case 'high':
        return { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.45)', text: '#FDBA74' };
      case 'medium':
        return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.45)', text: '#FCD34D' };
      case 'low':
        return { bg: 'rgba(0, 183, 255, 0.12)', border: 'rgba(0, 183, 255, 0.4)', text: '#00B7FF' };
      case 'info':
        return { bg: 'rgba(21, 31, 70, 0.8)', border: '#24315C', text: '#A7B0C8' };
      case 'investigating':
      case 'open':
        return { bg: 'rgba(22, 119, 255, 0.15)', border: 'rgba(0, 183, 255, 0.45)', text: '#4DEBFF' };
      case 'closed':
      case 'verified':
      case 'parsed':
        return { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.45)', text: '#6EE7B7' };
      case 'cyan':
        return { bg: 'rgba(0, 183, 255, 0.15)', border: 'rgba(77, 235, 255, 0.45)', text: '#4DEBFF' };
      case 'purple':
        return { bg: 'rgba(123, 44, 255, 0.18)', border: 'rgba(214, 44, 255, 0.45)', text: '#D62CFF' };
      case 'neutral':
      case 'default':
      default:
        return { bg: 'rgba(16, 25, 54, 0.8)', border: '#24315C', text: '#A7B0C8' };
    }
  };

  const colors = getColors();

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'sm' ? '0.18rem 0.5rem' : '0.24rem 0.65rem',
        borderRadius: '6px',
        fontSize: size === 'sm' ? '0.68rem' : '0.72rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontFamily: 'JetBrains Mono, monospace',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        lineHeight: 1.2,
        boxShadow: pulse ? `0 0 10px ${colors.border}` : 'none'
      }}
    >
      {pulse && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: colors.text,
            boxShadow: `0 0 8px ${colors.text}`
          }}
        />
      )}
      {children}
    </span>
  );
};
