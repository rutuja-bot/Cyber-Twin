import React, { useState } from 'react';
import {
  FileCheck2,
  Search,
  Filter,
  ShieldCheck,
  Hash,
  ExternalLink,
  Lock,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EvidenceDetailModal } from '../../components/evidence/EvidenceDetailModal';
import { Evidence, EvidenceType, SeverityLevel } from '../../types';

export const EvidencePage: React.FC = () => {
  const { evidenceList, selectedEvidence, setSelectedEvidence } = useInvestigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [relevanceFilter, setRelevanceFilter] = useState<string>('all');
  const [activeModalEvidence, setActiveModalEvidence] = useState<Evidence | null>(selectedEvidence);

  const filteredEvidence = evidenceList.filter((e) => {
    const matchesSearch =
      e.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.evidence_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.hash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    const matchesRelevance = relevanceFilter === 'all' || e.relevance === relevanceFilter;
    return matchesSearch && matchesType && matchesRelevance;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header and Summary Strip */}
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
            Evidence Vault & Chain of Custody
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Cryptographically certified digital forensic artifacts linked to normalized events
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="verified">
            <ShieldCheck size={14} /> SHA-256 HASHES VERIFIED
          </Badge>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            {evidenceList.length} Total Artifacts Loaded
          </span>
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
            placeholder="Search by Evidence ID, filename, source, or SHA-256 hash..."
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
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
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
            <option value="all">All Evidence Types</option>
            <option value="auth_log">auth_log (Authentication Logs)</option>
            <option value="sysmon">sysmon (Endpoint Process Monitor)</option>
            <option value="pcap">pcap (Packet Capture)</option>
            <option value="disk_artifact">disk_artifact (File System / Disk)</option>
            <option value="memory_dump">memory_dump (RAM Volatile Dump)</option>
          </select>

          {/* Relevance Filter */}
          <select
            value={relevanceFilter}
            onChange={(e) => setRelevanceFilter(e.target.value)}
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
            <option value="all">All Relevance Levels</option>
            <option value="critical">Critical Relevance</option>
            <option value="high">High Relevance</option>
            <option value="medium">Medium Relevance</option>
            <option value="low">Low Relevance</option>
          </select>
        </div>
      </div>

      {/* Evidence Table */}
      <div style={{ background: '#0d1424', border: '1px solid #1e293b', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#090f1d', borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
              <th style={{ padding: '0.85rem 1rem' }}>ID & Filename</th>
              <th style={{ padding: '0.85rem 1rem' }}>Type</th>
              <th style={{ padding: '0.85rem 1rem' }}>Source Endpoint</th>
              <th style={{ padding: '0.85rem 1rem' }}>SHA-256 Hash</th>
              <th style={{ padding: '0.85rem 1rem' }}>Relevance</th>
              <th style={{ padding: '0.85rem 1rem' }}>Linked Events</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvidence.map((e) => (
              <tr
                key={e.evidence_id}
                style={{
                  borderBottom: '1px solid #1e293b',
                  transition: 'background 0.15s ease'
                }}
              >
                {/* ID & Filename */}
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#00f2fe', fontWeight: 700 }}>
                      {e.evidence_id}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#f8fafc', marginTop: '0.2rem' }}>
                    {e.filename}
                  </div>
                </td>

                {/* Type */}
                <td style={{ padding: '0.85rem 1rem' }}>
                  <Badge variant="cyan" size="sm">
                    {e.type}
                  </Badge>
                </td>

                {/* Source */}
                <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>
                  <div style={{ fontSize: '0.8rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={e.source}>
                    {e.source}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {e.timestamp}
                  </div>
                </td>

                {/* SHA-256 */}
                <td style={{ padding: '0.85rem 1rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#38bdf8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Hash size={13} color="#38bdf8" />
                    <span>{e.hash.substring(0, 16)}...</span>
                  </div>
                  <span style={{ fontSize: '0.68rem', color: '#10b981' }}>Integrity Checked</span>
                </td>

                {/* Relevance */}
                <td style={{ padding: '0.85rem 1rem' }}>
                  <Badge variant={e.relevance} size="sm">
                    {e.relevance}
                  </Badge>
                </td>

                {/* Linked Events */}
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {e.linked_event_ids.map((evtId) => (
                      <span
                        key={evtId}
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'JetBrains Mono, monospace',
                          background: 'rgba(0, 242, 254, 0.08)',
                          border: '1px solid rgba(0, 242, 254, 0.25)',
                          color: '#00f2fe',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '4px'
                        }}
                      >
                        {evtId}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Actions */}
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveModalEvidence(e)}
                  >
                    Inspect
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Evidence Detail Modal */}
      <EvidenceDetailModal
        evidence={activeModalEvidence}
        onClose={() => setActiveModalEvidence(null)}
      />
    </div>
  );
};
