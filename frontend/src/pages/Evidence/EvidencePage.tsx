import React, { useState } from 'react';
import {
  Search,
  ShieldCheck,
  Hash
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EvidenceDetailModal } from '../../components/evidence/EvidenceDetailModal';
import { Evidence } from '../../types';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
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
            Evidence Vault
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#A7B0C8', marginTop: '0.2rem' }}>
            Chain of custody artifacts with certified cryptographic integrity records
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="verified">
            <ShieldCheck size={14} /> SHA-256 Certified
          </Badge>
          <span style={{ fontSize: '0.78rem', color: '#717E9E' }}>
            {evidenceList.length} artifacts cataloged
          </span>
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
            placeholder="Search by ID, file name, source host, or SHA-256..."
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
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
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
            <option value="all">All Types</option>
            <option value="auth_log">auth_log</option>
            <option value="sysmon">sysmon</option>
            <option value="pcap">pcap</option>
            <option value="disk_artifact">disk_artifact</option>
            <option value="memory_dump">memory_dump</option>
          </select>

          {/* Relevance Filter */}
          <select
            value={relevanceFilter}
            onChange={(e) => setRelevanceFilter(e.target.value)}
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
            <option value="all">All Relevance</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Professional Evidence Table */}
      <div style={{ background: '#101936', border: '1px solid #24315C', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(5, 8, 22, 0.4)' }}>
        <table className="forensic-table">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>Evidence ID</th>
              <th>Source & Filename</th>
              <th style={{ width: '110px' }}>Type</th>
              <th style={{ width: '140px' }}>Timestamp (UTC)</th>
              <th>SHA-256 Hash</th>
              <th style={{ width: '90px' }}>Status</th>
              <th style={{ width: '130px' }}>Linked Events</th>
              <th style={{ width: '90px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvidence.map((e) => (
              <tr key={e.evidence_id}>
                {/* ID */}
                <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00B7FF', fontWeight: 600 }}>
                  {e.evidence_id}
                </td>

                {/* Source & Filename */}
                <td>
                  <div style={{ fontWeight: 600, color: '#F5F7FF' }}>{e.filename}</div>
                  <div style={{ fontSize: '0.72rem', color: '#717E9E' }}>{e.source}</div>
                </td>

                {/* Type */}
                <td>
                  <Badge variant="default" size="sm">{e.type}</Badge>
                </td>

                {/* Timestamp */}
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#A7B0C8' }}>
                  {e.timestamp.replace('T', ' ').replace('Z', '')}
                </td>

                {/* SHA-256 */}
                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#A7B0C8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Hash size={12} color="#00B7FF" />
                    <span>{e.hash.substring(0, 16)}...{e.hash.substring(e.hash.length - 8)}</span>
                  </div>
                </td>

                {/* Status */}
                <td>
                  <Badge variant={e.processing_status} size="sm">{e.processing_status}</Badge>
                </td>

                {/* Linked Events */}
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {e.linked_event_ids.map((evtId) => (
                      <span
                        key={evtId}
                        style={{
                          fontSize: '0.68rem',
                          fontFamily: 'JetBrains Mono, monospace',
                          background: '#151F46',
                          border: '1px solid #24315C',
                          color: '#4DEBFF',
                          padding: '0.08rem 0.35rem',
                          borderRadius: '4px'
                        }}
                      >
                        {evtId}
                      </span>
                    ))}
                  </div>
                </td>

                {/* Action */}
                <td style={{ textAlign: 'right' }}>
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
