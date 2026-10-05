import React from 'react';
import { NavLink } from 'react-router-dom';
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
import { useNavigate } from 'react-router-dom';
import { useInvestigation } from '../../context/InvestigationContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export const Sidebar: React.FC = () => {
  const { summary, evidenceList, eventList, findingsList, logout } = useInvestigation();
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { name: 'Landing Overview', path: '/landing', icon: <Home size={18} /> },
    { name: 'Case Management', path: '/cases', icon: <Briefcase size={18} /> },
    { name: 'Investigation Hub', path: '/investigation', icon: <LayoutDashboard size={18} /> },
    { name: 'Evidence Vault', path: '/evidence', icon: <FileCheck2 size={18} />, badge: evidenceList.length },
    { name: 'Chronological Timeline', path: '/timeline', icon: <GitCommit size={18} />, badge: eventList.length },
    { name: 'Relationship Graph', path: '/graph', icon: <Network size={18} /> },
    { name: 'Incident Replay', path: '/replay', icon: <PlayCircle size={18} /> },
    { name: 'Forensic Report', path: '/report', icon: <FileSpreadsheet size={18} />, badge: findingsList.length }
  ];

  return (
    <aside
      className="no-print"
      style={{
        width: '250px',
        backgroundColor: '#070b14',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0
      }}
    >
      <div style={{ padding: '1rem 0.75rem', flex: 1 }}>
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#64748b',
            letterSpacing: '0.08em',
            padding: '0.5rem 0.75rem',
            marginBottom: '0.5rem'
          }}
        >
          Investigation Workspace
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
                padding: '0.625rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#00f2fe' : '#94a3b8',
                backgroundColor: isActive ? 'rgba(0, 242, 254, 0.08)' : 'transparent',
                borderLeft: isActive ? '3px solid #00f2fe' : '3px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'flex', opacity: 0.9 }}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontFamily: 'JetBrains Mono, monospace',
                    background: '#1e293b',
                    color: '#cbd5e1',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    fontWeight: 600
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
              padding: '0.625rem 0.85rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#f87171',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              cursor: 'pointer',
              marginTop: '0.75rem',
              width: '100%',
              textAlign: 'left',
              transition: 'all 0.15s ease'
            }}
          >
            <span style={{ display: 'flex', opacity: 0.9 }}><LogOut size={18} /></span>
            <span>Sign Out Session</span>
          </button>
        </nav>
      </div>

      {/* Cyber Twin Architecture Info Footer */}
      <div
        style={{
          padding: '1rem',
          margin: '0.75rem',
          background: 'rgba(13, 20, 36, 0.8)',
          border: '1px solid #1e293b',
          borderRadius: '8px'
        }}
      >
        <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
          Investigation Model
        </div>
        <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700, marginTop: '0.2rem' }}>
          Correlated Twin
        </div>
        <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '0.35rem', lineHeight: 1.4 }}>
          Ingest → Parse → Normalize → Graph → Replay
        </div>
      </div>
    </aside>
  );
};
