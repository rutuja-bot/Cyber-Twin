import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  glow?: 'cyan' | 'red' | 'purple' | 'none';
  style?: React.CSSProperties;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  icon,
  glow = 'none',
  style,
  className = ''
}) => {
  const getGlowStyle = () => {
    switch (glow) {
      case 'cyan':
        return { borderColor: 'rgba(0, 242, 254, 0.4)', boxShadow: '0 0 20px rgba(0, 242, 254, 0.15)' };
      case 'red':
        return { borderColor: 'rgba(239, 68, 68, 0.4)', boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)' };
      case 'purple':
        return { borderColor: 'rgba(168, 85, 247, 0.4)', boxShadow: '0 0 20px rgba(168, 85, 247, 0.15)' };
      default:
        return {};
    }
  };

  return (
    <div
      className={`cyber-card ${className}`}
      style={{
        background: '#0d1424',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        ...getGlowStyle(),
        ...style
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid rgba(30, 41, 59, 0.8)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {icon && <span style={{ color: '#00f2fe', display: 'flex' }}>{icon}</span>}
            <div>
              {title && (
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
