import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Activity, Radio, FolderGit2, LogOut } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Badge } from '../common/Badge';

export const Navbar: React.FC = () => {
  const { cases, activeCase, setActiveCaseId, logout } = useInvestigation();
  const navigate = useNavigate();

  return (
    <header
      className="no-print"
      style={{
        height: '64px',
        backgroundColor: '#090e1a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link
          to="/landing"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            textDecoration: 'none',
            color: '#f8fafc'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(14, 165, 233, 0.2) 100%)',
              border: '1px solid #00f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(0, 242, 254, 0.3)'
            }}
          >
            <Shield size={20} color="#00f2fe" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  background: 'linear-gradient(90deg, #ffffff 0%, #00f2fe 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                CYBER TWIN
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                  background: 'rgba(0, 242, 254, 0.15)',
                  border: '1px solid rgba(0, 242, 254, 0.4)',
                  color: '#00f2fe',
                  fontWeight: 700
                }}
              >
                v1.0 MVP
              </span>
            </div>
            <p style={{ fontSize: '0.68rem', color: '#64748b', margin: 0 }}>
              Digital Forensics & Incident Reconstruction
            </p>
          </div>
        </Link>
      </div>

      {/* Case Switcher & System Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Case Selector Dropdown */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#0d1424',
            padding: '0.35rem 0.75rem',
            borderRadius: '6px',
            border: '1px solid #2d3b55'
          }}
        >
          <FolderGit2 size={16} color="#00f2fe" />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Active Case:</span>
          <select
            value={activeCase?.case_id || ''}
            onChange={(e) => {
              setActiveCaseId(e.target.value);
              navigate('/investigation');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00f2fe',
              fontWeight: 700,
              fontSize: '0.8rem',
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {cases.map((c) => (
              <option key={c.case_id} value={c.case_id} style={{ background: '#0d1424', color: '#f8fafc' }}>
                {c.case_id} — {c.title.substring(0, 30)}...
              </option>
            ))}
          </select>
        </div>

        {/* Live Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Badge variant="cyan" pulse size="sm">
            <Radio size={12} />
            PIPELINE ONLINE
          </Badge>
        </div>

        {/* Investigator Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            borderLeft: '1px solid #1e293b',
            paddingLeft: '1rem'
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#1e293b',
              border: '1px solid #38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#38bdf8'
            }}
          >
            P3
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f1f5f9' }}>Person 3</div>
            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>Frontend Lead</div>
          </div>
        </div>

        {/* Quick Sign Out Action */}
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.35rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.15s ease'
          }}
          title="Sign Out of Session"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
