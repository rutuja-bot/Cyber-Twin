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
      case 'red':
        return { borderColor: 'rgba(239, 68, 68, 0.45)', boxShadow: '0 4px 20px rgba(239, 68, 68, 0.15)' };
      case 'cyan':
        return { borderColor: 'rgba(0, 183, 255, 0.45)', boxShadow: '0 4px 20px rgba(0, 183, 255, 0.15)' };
      case 'purple':
        return { borderColor: 'rgba(123, 44, 255, 0.45)', boxShadow: '0 4px 20px rgba(123, 44, 255, 0.15)' };
      default:
        return {};
    }
  };

  return (
    <div
      className={`cyber-card ${className}`}
      style={{
        background: '#101936',
        border: '1px solid #24315C',
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: '0 4px 20px rgba(5, 8, 22, 0.6)',
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
            marginBottom: '0.875rem',
            paddingBottom: '0.625rem',
            borderBottom: '1px solid #24315C'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {icon && <span style={{ color: '#00B7FF', display: 'flex' }}>{icon}</span>}
            <div>
              {title && (
                <h3 style={{ fontSize: '0.925rem', fontWeight: 600, color: '#F5F7FF', letterSpacing: '-0.01em' }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p style={{ fontSize: '0.75rem', color: '#A7B0C8', marginTop: '0.1rem' }}>
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
