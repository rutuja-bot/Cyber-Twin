import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ArrowRight,
  FolderOpen,
  Calendar,
  User,
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Case, SeverityLevel, CaseStatus } from '../../types';
import { createCase } from '../../api/cases';

export const CaseDashboardPage: React.FC = () => {
  const { cases, activeCase, setActiveCaseId, refreshData } = useInvestigation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('Data Exfiltration / Account Takeover');
  const [newSeverity, setNewSeverity] = useState<SeverityLevel>('high');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.case_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.incident_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || c.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setCreating(true);
    try {
      const created = await createCase({
        title: newTitle,
        incident_type: newType,
        severity: newSeverity,
        description: newDesc
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      await refreshData();
      setActiveCaseId(created.case_id);
      navigate('/investigation');
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Banner / Actions */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid #1e293b',
          paddingBottom: '1.25rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc' }}>
            Case Management Vault
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Active digital forensic dossiers and incident reconstruction workspaces
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Grid / Table Toggle */}
          <div style={{ display: 'flex', background: '#0d1424', padding: '0.25rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#1e293b' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? '#00f2fe' : '#94a3b8',
                padding: '0.35rem 0.55rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex'
              }}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#1e293b' : 'transparent',
                border: 'none',
                color: viewMode === 'table' ? '#00f2fe' : '#94a3b8',
                padding: '0.35rem 0.55rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex'
              }}
              title="Table View"
            >
              <TableIcon size={16} />
            </button>
          </div>

          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            New Investigation
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          background: '#0d1424',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #1e293b'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search by Case ID, title, or incident type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: '#090f1d',
              border: '1px solid #2d3b55',
              color: '#cbd5e1',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="investigating">Investigating</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              background: '#090f1d',
              border: '1px solid #2d3b55',
              color: '#cbd5e1',
              padding: '0.45rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {filteredCases.map((c) => {
            const isActive = activeCase?.case_id === c.case_id;

            return (
              <div
                key={c.case_id}
                className="cyber-card"
                style={{
                  borderColor: isActive ? '#00f2fe' : '#1e293b',
                  boxShadow: isActive ? '0 0 20px rgba(0, 242, 254, 0.2)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#00f2fe'
                      }}
                    >
                      {c.case_id}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Badge variant={c.severity} size="sm">{c.severity}</Badge>
                      <Badge variant={c.status} size="sm">{c.status}</Badge>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.3 }}>
                    {c.title}
                  </h3>

                  <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '0.5rem', lineHeight: 1.5 }}>
                    {c.description}
                  </p>
                </div>

                <div>
                  {/* Case stats row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.5rem',
                      background: '#090f1d',
                      padding: '0.65rem',
                      borderRadius: '6px',
                      border: '1px solid #1e293b',
                      textAlign: 'center',
                      marginBottom: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Evidence</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', fontFamily: 'JetBrains Mono, monospace' }}>
                        {c.evidence_count}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Alerts</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ef4444', fontFamily: 'JetBrains Mono, monospace' }}>
                        {c.suspicious_event_count}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' }}>Entities</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                        {c.entity_count}
                      </div>
                    </div>
                  </div>

                  {/* Investigator and Action */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Lead: <span style={{ color: '#cbd5e1' }}>{c.investigator}</span>
                    </div>

                    <Button
                      size="sm"
                      variant={isActive ? 'primary' : 'secondary'}
                      icon={<ArrowRight size={14} />}
                      onClick={() => {
                        setActiveCaseId(c.case_id);
                        navigate('/investigation');
                      }}
                    >
                      {isActive ? 'Workspace Active' : 'Open Case'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div style={{ background: '#0d1424', border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#090f1d', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Case ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Title & Type</th>
                <th style={{ padding: '0.75rem 1rem' }}>Severity</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Evidence / Alerts</th>
                <th style={{ padding: '0.75rem 1rem' }}>Investigator</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr key={c.case_id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'JetBrains Mono, monospace', color: '#00f2fe', fontWeight: 700 }}>
                    {c.case_id}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.incident_type}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={c.severity} size="sm">{c.severity}</Badge>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <Badge variant={c.status} size="sm">{c.status}</Badge>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'JetBrains Mono, monospace' }}>
                    {c.evidence_count} files / <span style={{ color: '#ef4444' }}>{c.suspicious_event_count} alerts</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                    {c.investigator}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setActiveCaseId(c.case_id);
                        navigate('/investigation');
                      }}
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Investigation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initialize New Cyber Incident Investigation"
        subtitle="Provision a dedicated Cyber Twin correlation workspace"
      >
        <form onSubmit={handleCreateCase} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              Incident Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Unauthorized Lateral Movement & Kerberoasting"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                width: '100%',
                background: '#090f1d',
                border: '1px solid #2d3b55',
                borderRadius: '6px',
                padding: '0.6rem 0.85rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Incident Classification
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                style={{
                  width: '100%',
                  background: '#090f1d',
                  border: '1px solid #2d3b55',
                  borderRadius: '6px',
                  padding: '0.6rem 0.85rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              >
                <option value="Data Exfiltration / Account Takeover">Data Exfiltration / Account Takeover</option>
                <option value="Ransomware Staging & Lateral Movement">Ransomware Staging & Lateral Movement</option>
                <option value="Cloud Credential Compromise">Cloud Credential Compromise</option>
                <option value="Supply Chain / Malicious Dependency">Supply Chain / Malicious Dependency</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                Initial Severity
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as SeverityLevel)}
                style={{
                  width: '100%',
                  background: '#090f1d',
                  border: '1px solid #2d3b55',
                  borderRadius: '6px',
                  padding: '0.6rem 0.85rem',
                  color: '#f8fafc',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              >
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
              Incident Scope & Background
            </label>
            <textarea
              rows={4}
              placeholder="Describe suspected vector, affected assets, and initial alerts..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{
                width: '100%',
                background: '#090f1d',
                border: '1px solid #2d3b55',
                borderRadius: '6px',
                padding: '0.6rem 0.85rem',
                color: '#f8fafc',
                fontSize: '0.875rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={creating}>
              {creating ? 'Initializing...' : 'Create Case & Launch'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
