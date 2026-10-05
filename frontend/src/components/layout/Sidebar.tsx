import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Briefcase,
  LayoutDashboard,
  FileCheck2,
  GitCommit,
  Network,
  PlayCircle,
  FileSpreadsheet,
  LogOut
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const { evidenceList, eventList, findingsList, logout } = useInvestigation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { name: 'Overview', path: '/landing', icon: <Home size={16} /> },
    { name: 'Cases', path: '/cases', icon: <Briefcase size={16} /> },
    { name: 'Dashboard', path: '/investigation', icon: <LayoutDashboard size={16} /> },
    { name: 'Evidence', path: '/evidence', icon: <FileCheck2 size={16} />, badge: evidenceList.length },
    { name: 'Timeline', path: '/timeline', icon: <GitCommit size={16} />, badge: eventList.length },
    { name: 'Graph', path: '/graph', icon: <Network size={16} /> },
    { name: 'Replay', path: '/replay', icon: <PlayCircle size={16} /> },
    { name: 'Findings & Report', path: '/report', icon: <FileSpreadsheet size={16} />, badge: findingsList.length }
  ];

  return (
    <aside
      className="no-print"
      style={{
        width: '240px',
        backgroundColor: '#070C1E',
        borderRight: '1px solid #24315C',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}
    >
      <div style={{ padding: '1rem 0.75rem', flex: 1 }}>
        <div
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#717E9E',
            letterSpacing: '0.08em',
            padding: '0.35rem 0.75rem',
            marginBottom: '0.5rem'
          }}
        >
          Investigation Suite
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#F5F7FF' : '#A7B0C8',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(22, 119, 255, 0.16) 0%, rgba(123, 44, 255, 0.08) 100%)'
                  : 'transparent',
                borderLeft: isActive ? '3px solid #00B7FF' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 0 15px rgba(0, 183, 255, 0.08)' : 'none'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'flex', color: '#00B7FF' }}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: '#151F46',
                    color: '#4DEBFF',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                    border: '1px solid #24315C'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: 500,
              color: '#A7B0C8',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              marginTop: '1.25rem',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.12)';
              e.currentTarget.style.color = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#A7B0C8';
            }}
          >
            <span style={{ display: 'flex' }}><LogOut size={16} /></span>
            <span>Sign Out</span>
          </button>
        </nav>
      </div>

      {/* Compact Info Footer */}
      <div
        style={{
          padding: '0.85rem',
          margin: '0.75rem',
          background: 'linear-gradient(135deg, rgba(21, 31, 70, 0.6) 0%, rgba(16, 25, 54, 0.6) 100%)',
          border: '1px solid #24315C',
          borderRadius: '8px',
          fontSize: '0.7rem',
          color: '#A7B0C8'
        }}
      >
        <div style={{ color: '#4DEBFF', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00B7FF', boxShadow: '0 0 6px #00B7FF' }} />
          Forensic Integrity Active
        </div>
        <div style={{ color: '#717E9E', marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace' }}>SHA-256 Validated</div>
      </div>
    </aside>
  );
};
