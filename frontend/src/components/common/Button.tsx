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
      gap: '0.45rem',
      fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s ease',
      borderRadius: '8px',
      fontFamily: 'inherit',
      border: '1px solid transparent',
      outline: 'none',
      whiteSpace: 'nowrap'
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: '0.35rem 0.75rem', fontSize: '0.78rem' },
      md: { padding: '0.5rem 1.1rem', fontSize: '0.84rem' },
      lg: { padding: '0.7rem 1.4rem', fontSize: '0.92rem' }
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: 'linear-gradient(135deg, #1677FF 0%, #7B2CFF 100%)',
        color: '#F5F7FF',
        borderColor: 'rgba(77, 235, 255, 0.3)',
        boxShadow: disabled ? 'none' : '0 4px 16px rgba(22, 119, 255, 0.35)'
      },
      secondary: {
        background: '#151F46',
        color: '#F5F7FF',
        borderColor: '#24315C',
        boxShadow: '0 2px 8px rgba(10, 16, 36, 0.4)'
      },
      outline: {
        background: 'rgba(16, 25, 54, 0.6)',
        color: '#00B7FF',
        borderColor: 'rgba(0, 183, 255, 0.4)'
      },
      danger: {
        background: 'rgba(239, 68, 68, 0.2)',
        color: '#FCA5A5',
        borderColor: 'rgba(239, 68, 68, 0.4)'
      },
      ghost: {
        background: 'transparent',
        color: '#A7B0C8',
        borderColor: 'transparent'
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
