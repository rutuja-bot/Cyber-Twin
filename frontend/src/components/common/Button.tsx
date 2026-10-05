import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  style,
  disabled,
  ...props
}) => {
  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.15s ease-in-out',
      borderRadius: '6px',
      fontFamily: 'inherit',
      border: 'none',
      outline: 'none',
      whiteSpace: 'nowrap'
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: '0.35rem 0.75rem', fontSize: '0.8rem' },
      md: { padding: '0.55rem 1.1rem', fontSize: '0.875rem' },
      lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' }
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'linear-gradient(135deg, #00f2fe 0%, #0284c7 100%)',
        color: '#080c14',
        boxShadow: '0 0 15px rgba(0, 242, 254, 0.3)'
      },
      secondary: {
        background: '#1e293b',
        color: '#f8fafc',
        border: '1px solid #334155'
      },
      outline: {
        background: 'transparent',
        color: '#00f2fe',
        border: '1px solid rgba(0, 242, 254, 0.5)'
      },
      danger: {
        background: 'rgba(239, 68, 68, 0.15)',
        color: '#fca5a5',
        border: '1px solid #ef4444'
      },
      ghost: {
        background: 'transparent',
        color: '#94a3b8'
      }
    };

    return { ...base, ...sizeStyles[size], ...variantStyles[variant], ...style };
  };

  return (
    <button style={getStyles()} disabled={disabled} {...props}>
      {icon && <span style={{ display: 'inline-flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
};
