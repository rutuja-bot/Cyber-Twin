import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ArrowRight,
  Table as TableIcon,
  LayoutGrid
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { SeverityLevel } from '../../types';
import { createCase } from '../../api/cases';

export const CaseDashboardPage: React.FC = () => {
  const { cases, activeCase, setActiveCaseId, refreshData } = useInvestigation();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid #24315C',
          paddingBottom: '1.25rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F5F7FF', letterSpacing: '-0.02em' }}>
            Incident Cases
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#A7B0C8', marginTop: '0.2rem' }}>
            Active forensic investigation workspaces and evidence dossiers
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* View Toggle */}
          <div style={{ display: 'flex', background: '#101936', padding: '0.2rem', borderRadius: '8px', border: '1px solid #24315C' }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                background: viewMode === 'table' ? '#151F46' : 'transparent',
                border: 'none',
                color: viewMode === 'table' ? '#00B7FF' : '#717E9E',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                boxShadow: viewMode === 'table' ? '0 0 10px rgba(0, 183, 255, 0.2)' : 'none'
              }}
              title="Table View"
            >
              <TableIcon size={15} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? '#151F46' : 'transparent',
                border: 'none',
                color: viewMode === 'grid' ? '#00B7FF' : '#717E9E',
                padding: '0.35rem 0.6rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                boxShadow: viewMode === 'grid' ? '0 0 10px rgba(0, 183, 255, 0.2)' : 'none'
              }}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={15} />}
            onClick={() => setIsModalOpen(true)}
            style={{ boxShadow: '0 4px 16px rgba(22, 119, 255, 0.35)' }}
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
          gap: '0.85rem',
          alignItems: 'center',
          background: '#101936',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          border: '1px solid #24315C',
          boxShadow: '0 4px 20px rgba(5, 8, 22, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="#00B7FF" />
          <input
            type="text"
            placeholder="Filter by Case ID, title, or incident type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F5F7FF',
              fontSize: '0.84rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: '#080E22',
              border: '1px solid #24315C',
              color: '#F5F7FF',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
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
              background: '#080E22',
              border: '1px solid #24315C',
              color: '#F5F7FF',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
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

      {/* Table View (Default) */}
      {viewMode === 'table' ? (
        <div style={{ background: '#101936', border: '1px solid #24315C', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(5, 8, 22, 0.4)' }}>
          <table className="forensic-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Case ID</th>
                <th>Case Name & Type</th>
                <th style={{ width: '100px' }}>Severity</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ width: '140px' }}>Last Activity</th>
                <th style={{ width: '130px' }}>Investigator</th>
                <th style={{ width: '90px' }}>Evidence</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => {
                const isActive = activeCase?.case_id === c.case_id;

                return (
                  <tr key={c.case_id} style={{ background: isActive ? 'rgba(22, 119, 255, 0.12)' : undefined }}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00B7FF', fontWeight: 600 }}>
                      {c.case_id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#F5F7FF' }}>{c.title}</div>
                      <div style={{ fontSize: '0.72rem', color: '#717E9E' }}>{c.incident_type}</div>
                    </td>
                    <td>
                      <Badge variant={c.severity} size="sm">{c.severity}</Badge>
                    </td>
                    <td>
                      <Badge variant={c.status} size="sm">{c.status}</Badge>
                    </td>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#A7B0C8' }}>
                      {c.last_activity.replace('T', ' ').replace('Z', '')}
                    </td>
                    <td style={{ color: '#F5F7FF' }}>
                      {c.investigator}
                    </td>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#4DEBFF' }}>
                      {c.evidence_count} items
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant={isActive ? 'primary' : 'outline'}
                        onClick={() => {
                          setActiveCaseId(c.case_id);
                          navigate('/investigation');
                        }}
                      >
                        {isActive ? 'Active' : 'Open'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredCases.map((c) => {
            const isActive = activeCase?.case_id === c.case_id;

            return (
              <div
                key={c.case_id}
                className="cyber-card"
                style={{
                  background: '#101936',
                  borderColor: isActive ? '#00B7FF' : '#24315C',
                  boxShadow: isActive ? '0 4px 24px rgba(0, 183, 255, 0.18)' : '0 4px 20px rgba(5, 8, 22, 0.5)',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '1.25rem'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.78rem', fontWeight: 700, color: '#00B7FF' }}>
                      {c.case_id}
                    </span>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <Badge variant={c.severity} size="sm">{c.severity}</Badge>
                      <Badge variant={c.status} size="sm">{c.status}</Badge>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '0.975rem', fontWeight: 700, color: '#F5F7FF', lineHeight: 1.35 }}>
                    {c.title}
                  </h3>

                  <p style={{ fontSize: '0.78rem', color: '#A7B0C8', marginTop: '0.45rem', lineHeight: 1.45 }}>
                    {c.description}
                  </p>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#717E9E', marginBottom: '0.85rem' }}>
                    <span>Lead: <strong style={{ color: '#F5F7FF' }}>{c.investigator}</strong></span>
                    <span style={{ color: '#4DEBFF' }}>{c.evidence_count} evidence items</span>
                  </div>

                  <Button
                    size="sm"
                    variant={isActive ? 'primary' : 'outline'}
                    style={{ width: '100%' }}
                    onClick={() => {
                      setActiveCaseId(c.case_id);
                      navigate('/investigation');
                    }}
                  >
                    {isActive ? 'Workspace Active' : 'Open Investigation'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Case Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Forensic Case"
        subtitle="Initialize new incident workspace"
      >
        <form onSubmit={handleCreateCase} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              Case Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Lateral Movement & Kerberoasting"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                width: '100%',
                background: '#090d16',
                border: '1px solid #283548',
                borderRadius: '4px',
                padding: '0.5rem 0.75rem',
                color: '#f9fafb',
                fontSize: '0.8125rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Incident Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid #283548',
                  borderRadius: '4px',
                  padding: '0.5rem 0.75rem',
                  color: '#f9fafb',
                  fontSize: '0.8125rem',
                  outline: 'none'
                }}
              >
                <option value="Data Exfiltration / Account Takeover">Data Exfiltration / Account Takeover</option>
                <option value="Ransomware Staging & Lateral Movement">Ransomware Staging & Lateral Movement</option>
                <option value="Cloud Credential Compromise">Cloud Credential Compromise</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Severity
              </label>
              <select
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as SeverityLevel)}
                style={{
                  width: '100%',
                  background: '#090d16',
                  border: '1px solid #283548',
                  borderRadius: '4px',
                  padding: '0.5rem 0.75rem',
                  color: '#f9fafb',
                  fontSize: '0.8125rem',
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
            <label style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Initial details, scope, or alert reference..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              style={{
                width: '100%',
                background: '#090d16',
                border: '1px solid #283548',
                borderRadius: '4px',
                padding: '0.5rem 0.75rem',
                color: '#f9fafb',
                fontSize: '0.8125rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create Case'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
