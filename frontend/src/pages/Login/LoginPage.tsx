import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const LoginPage: React.FC = () => {
  const { login } = useInvestigation();
  const navigate = useNavigate();

  const [username, setUsername] = useState('investigator');
  const [password, setPassword] = useState('cyber123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/landing');
      } else {
        setError(result.error || 'Invalid credentials. Access Denied.');
      }
    } catch (err) {
      setError('Authentication subsystem unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDemoCredentials = () => {
    setUsername('investigator');
    setPassword('cyber123');
    setError(null);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        backgroundColor: '#080c14',
        overflow: 'hidden'
      }}
    >
      {/* Background Decorative Cyber Grids */}
      <div
        className="bg-grid"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.8,
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 242, 254, 0.08) 0%, transparent 70%)',
          top: '10%',
          left: '20%',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
          bottom: '10%',
          right: '20%',
          pointerEvents: 'none'
        }}
      />

      {/* Main Authentication Container Card */}
      <div
        className="cyber-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#0d1424',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          padding: '2.5rem 2rem',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 242, 254, 0.1)',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Brand & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(14, 165, 233, 0.2) 100%)',
              border: '1px solid #00f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: '0 0 20px rgba(0, 242, 254, 0.35)'
            }}
          >
            <Shield size={28} color="#00f2fe" />
          </div>

          <h1
            style={{
              fontSize: '1.65rem',
              fontWeight: 800,
              letterSpacing: '0.05em',
              background: 'linear-gradient(90deg, #ffffff 0%, #00f2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.35rem'
            }}
          >
            CYBER TWIN
          </h1>

          <p
            style={{
              fontSize: '0.825rem',
              color: '#94a3b8',
              lineHeight: 1.4,
              maxWidth: '340px',
              margin: '0 auto'
            }}
          >
            Interactive Cyber Incident Reconstruction & Digital Forensics System
          </p>

          <div style={{ marginTop: '0.75rem' }}>
            <Badge variant="cyan" size="sm">
              <Terminal size={12} /> SECURE INVESTIGATOR ACCESS
            </Badge>
          </div>
        </div>

        {/* Demo Account Callout Banner */}
        <div
          onClick={handleApplyDemoCredentials}
          style={{
            background: 'rgba(0, 242, 254, 0.06)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            cursor: 'pointer',
            transition: 'border-color 0.2s, background 0.2s'
          }}
          title="Click to auto-fill demo credentials"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle2 size={14} color="#00f2fe" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00f2fe', textTransform: 'uppercase' }}>
                Demo Credentials
              </span>
            </div>
            <span style={{ fontSize: '0.68rem', color: '#38bdf8', textDecoration: 'underline' }}>
              Click to Apply
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#cbd5e1', fontFamily: 'JetBrains Mono, monospace' }}>
            User: <strong style={{ color: '#f8fafc' }}>investigator</strong> • Pass: <strong style={{ color: '#f8fafc' }}>cyber123</strong>
          </div>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.65rem'
            }}
          >
            <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div style={{ fontSize: '0.8rem', color: '#fca5a5', lineHeight: 1.4 }}>
              {error}
            </div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Username Input */}
          <div>
            <label
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#94a3b8',
                display: 'block',
                marginBottom: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Investigator ID
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  color: '#64748b',
                  pointerEvents: 'none',
                  display: 'flex'
                }}
              >
                <User size={16} />
              </div>
              <input
                type="text"
                required
                disabled={loading}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="investigator"
                style={{
                  width: '100%',
                  background: '#090f1d',
                  border: '1px solid #2d3b55',
                  borderRadius: '6px',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div>
            <label
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#94a3b8',
                display: 'block',
                marginBottom: '0.4rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              Security Passphrase
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '0.85rem',
                  color: '#64748b',
                  pointerEvents: 'none',
                  display: 'flex'
                }}
              >
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: '#090f1d',
                  border: '1px solid #2d3b55',
                  borderRadius: '6px',
                  padding: '0.65rem 2.6rem 0.65rem 2.4rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            icon={loading ? <Cpu className="animate-spin" size={18} /> : <ArrowRight size={18} />}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              padding: '0.75rem'
            }}
          >
            {loading ? 'Authenticating Investigator...' : 'Authenticate & Enter Workspace'}
          </Button>
        </form>

        {/* Footer info */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(30, 41, 59, 0.6)',
            textAlign: 'center',
            fontSize: '0.72rem',
            color: '#64748b'
          }}
        >
          Session managed locally. Chain of custody & audit trail enabled.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
