import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
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
      setError('Authentication service unavailable. Please retry.');
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
        padding: '1.5rem',
        backgroundColor: '#050816',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background ambient lighting */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22, 119, 255, 0.15) 0%, transparent 70%)',
          top: '20%',
          left: '30%',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123, 44, 255, 0.12) 0%, transparent 70%)',
          bottom: '15%',
          right: '25%',
          pointerEvents: 'none'
        }}
      />

      {/* Main Authentication Container Card */}
      <div
        className="cyber-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(16, 25, 54, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid #24315C',
          borderRadius: '16px',
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 50px rgba(5, 8, 22, 0.8), 0 0 35px rgba(22, 119, 255, 0.12)',
          zIndex: 1
        }}
      >
        {/* Brand & Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1677FF 0%, #7B2CFF 100%)',
              border: '1px solid rgba(77, 235, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              color: '#F5F7FF',
              boxShadow: '0 0 24px rgba(22, 119, 255, 0.45)'
            }}
          >
            <Shield size={26} />
          </div>

          <h1
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: '#F5F7FF',
              marginBottom: '0.35rem',
              letterSpacing: '-0.02em'
            }}
          >
            Cyber <span style={{ color: '#00B7FF' }}>Twin</span> Platform
          </h1>

          <p
            style={{
              fontSize: '0.8rem',
              color: '#A7B0C8',
              lineHeight: 1.45
            }}
          >
            Interactive Cyber Incident Reconstruction & Digital Forensics System
          </p>
        </div>

        {/* Demo Account Callout Banner */}
        <div
          onClick={handleApplyDemoCredentials}
          style={{
            background: 'rgba(21, 31, 70, 0.7)',
            border: '1px solid #24315C',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Click to fill credentials"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00B7FF', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Demo Account
            </span>
            <span style={{ fontSize: '0.68rem', color: '#717E9E' }}>
              Click to Auto-fill
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#A7B0C8', fontFamily: 'JetBrains Mono, monospace' }}>
            User: <span style={{ color: '#F5F7FF', fontWeight: 600 }}>investigator</span> | Pass: <span style={{ color: '#F5F7FF', fontWeight: 600 }}>cyber123</span>
          </div>
        </div>

        {/* Error Alert Message */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}
          >
            <AlertCircle size={16} color="#FCA5A5" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            <div style={{ fontSize: '0.78rem', color: '#FCA5A5', lineHeight: 1.35 }}>
              {error}
            </div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
          {/* Username Input */}
          <div>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#A7B0C8',
                display: 'block',
                marginBottom: '0.35rem'
              }}
            >
              Investigator Username
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
                  color: '#717E9E',
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
                  background: '#080E22',
                  border: '1px solid #24315C',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                  color: '#F5F7FF',
                  fontSize: '0.84rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
              />
            </div>
          </div>

          {/* Password Input with Show/Hide Toggle */}
          <div>
            <label
              style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#A7B0C8',
                display: 'block',
                marginBottom: '0.35rem'
              }}
            >
              Password
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
                  color: '#717E9E',
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
                  background: '#080E22',
                  border: '1px solid #24315C',
                  borderRadius: '8px',
                  padding: '0.65rem 2.6rem 0.65rem 2.4rem',
                  color: '#F5F7FF',
                  fontSize: '0.84rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
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
                  color: '#717E9E',
                  cursor: 'pointer',
                  padding: '0.2rem',
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
            style={{
              width: '100%',
              marginTop: '0.5rem',
              boxShadow: '0 4px 20px rgba(22, 119, 255, 0.4)'
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Investigation Suite'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
