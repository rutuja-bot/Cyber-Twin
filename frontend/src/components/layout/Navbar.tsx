import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, FolderGit2, LogOut, CheckCircle2 } from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';

export const Navbar: React.FC = () => {
  const { cases, activeCase, setActiveCaseId, logout } = useInvestigation();
  const navigate = useNavigate();

  return (
    <header
      className="no-print"
      style={{
        height: '60px',
        backgroundColor: 'rgba(10, 16, 36, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid #24315C',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <Link
          to="/landing"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            textDecoration: 'none',
            color: '#F5F7FF'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1677FF 0%, #7B2CFF 100%)',
              border: '1px solid rgba(77, 235, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F5F7FF',
              boxShadow: '0 0 14px rgba(22, 119, 255, 0.4)'
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#F5F7FF' }}>
                CYBER <span style={{ color: '#00B7FF' }}>TWIN</span>
              </span>
              <span style={{ fontSize: '0.65rem', color: '#4DEBFF', padding: '0.1rem 0.4rem', background: '#151F46', border: '1px solid #24315C', borderRadius: '4px', fontWeight: 600 }}>
                PLATFORM
              </span>
            </div>
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
            gap: '0.4rem',
            background: '#101936',
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #24315C',
            boxShadow: '0 2px 8px rgba(5, 8, 22, 0.4)'
          }}
        >
          <FolderGit2 size={14} color="#00B7FF" />
          <span style={{ fontSize: '0.72rem', color: '#A7B0C8', fontWeight: 500 }}>Case:</span>
          <select
            value={activeCase?.case_id || ''}
            onChange={(e) => {
              setActiveCaseId(e.target.value);
              navigate('/investigation');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#00B7FF',
              fontWeight: 600,
              fontSize: '0.78rem',
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {cases.map((c) => (
              <option key={c.case_id} value={c.case_id} style={{ background: '#101936', color: '#F5F7FF' }}>
                {c.case_id} — {c.title.substring(0, 32)}...
              </option>
            ))}
          </select>
        </div>

        {/* Live Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
          <span>Engine Live</span>
        </div>

        {/* Investigator Tag */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            borderLeft: '1px solid #24315C',
            paddingLeft: '1rem'
          }}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1677FF 0%, #7B2CFF 100%)',
              border: '1px solid rgba(77, 235, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#F5F7FF',
              boxShadow: '0 0 10px rgba(123, 44, 255, 0.35)'
            }}
          >
            P3
          </div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#F5F7FF' }}>Person 3</div>
            <div style={{ fontSize: '0.65rem', color: '#A7B0C8' }}>Investigator</div>
          </div>
        </div>

        {/* Sign Out Action */}
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          style={{
            background: '#151F46',
            border: '1px solid #24315C',
            color: '#A7B0C8',
            padding: '0.35rem 0.65rem',
            borderRadius: '6px',
            fontSize: '0.72rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            transition: 'all 0.15s ease'
          }}
          title="Sign Out"
        >
          <LogOut size={13} color="#A7B0C8" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
