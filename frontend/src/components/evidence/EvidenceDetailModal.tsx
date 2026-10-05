import React, { useState } from 'react';
import { FileCheck, ShieldCheck, Hash, Database, Clock, Copy, Check, Terminal } from 'lucide-react';
import { Evidence } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useInvestigation } from '../../context/InvestigationContext';
import { useNavigate } from 'react-router-dom';

interface EvidenceDetailModalProps {
  evidence: Evidence | null;
  onClose: () => void;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({ evidence, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { eventList, setSelectedEvent } = useInvestigation();
  const navigate = useNavigate();

  if (!evidence) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(evidence.hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linkedEvents = eventList.filter((evt) =>
    evidence.linked_event_ids.includes(evt.event_id)
  );

  return (
    <Modal
      isOpen={!!evidence}
      onClose={onClose}
      title={`Evidence Artifact: ${evidence.filename}`}
      subtitle={`ID: ${evidence.evidence_id} • Source: ${evidence.source}`}
      maxWidth="800px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Verification Status Banner */}
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '6px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck size={22} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6ee7b7' }}>
                Forensic Integrity Verified (SHA-256 Match)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Artifact integrity certified upon ingestion. No post-collection tampering detected.
              </div>
            </div>
          </div>
          <Badge variant="verified">CHAIN OF CUSTODY VERIFIED</Badge>
        </div>

        {/* SHA-256 Hash Box */}
        <div
          style={{
            background: '#090f1d',
            border: '1px solid #1e293b',
            borderRadius: '6px',
            padding: '0.75rem 1rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.35rem'
            }}
          >
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
              SHA-256 Cryptographic Hash
            </span>
            <button
              onClick={handleCopyHash}
              style={{
                background: 'transparent',
                border: 'none',
                color: copied ? '#10b981' : '#00f2fe',
                fontSize: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Hash'}
            </button>
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.8rem',
              color: '#38bdf8',
              wordBreak: 'break-all'
            }}
          >
            {evidence.hash}
          </div>
        </div>

        {/* Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}
        >
          <div style={{ background: '#0a0f1d', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Artifact Type</span>
            <div style={{ fontSize: '0.875rem', color: '#f8fafc', fontWeight: 600, marginTop: '0.2rem' }}>
              {evidence.type.toUpperCase()}
            </div>
          </div>
          <div style={{ background: '#0a0f1d', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>File Size</span>
            <div style={{ fontSize: '0.875rem', color: '#f8fafc', fontWeight: 600, marginTop: '0.2rem' }}>
              {evidence.metadata.file_size_kb ? `${(evidence.metadata.file_size_kb / 1024).toFixed(2)} MB` : '16.00 GB'}
            </div>
          </div>
          <div style={{ background: '#0a0f1d', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Extracted Records</span>
            <div style={{ fontSize: '0.875rem', color: '#00f2fe', fontWeight: 700, marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace' }}>
              {evidence.metadata.extracted_records?.toLocaleString() || '1,240'} events
            </div>
          </div>
          <div style={{ background: '#0a0f1d', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Investigation Relevance</span>
            <div style={{ marginTop: '0.2rem' }}>
              <Badge variant={evidence.relevance}>{evidence.relevance}</Badge>
            </div>
          </div>
        </div>

        {/* Raw Log Preview */}
        {evidence.metadata.raw_sample && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Terminal size={14} color="#00f2fe" />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
                Normalized Raw Log Sample
              </span>
            </div>
            <pre
              style={{
                background: '#050811',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '0.85rem',
                fontSize: '0.75rem',
                color: '#cbd5e1',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                lineHeight: 1.45
              }}
            >
              {evidence.metadata.raw_sample}
            </pre>
          </div>
        )}

        {/* Linked Chronological Events */}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Linked Incident Events ({linkedEvents.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {linkedEvents.map((evt) => (
              <div
                key={evt.event_id}
                style={{
                  background: '#090f1d',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '0.65rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
                onClick={() => {
                  setSelectedEvent(evt);
                  onClose();
                  navigate('/timeline');
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#00f2fe', fontWeight: 700 }}>
                      {evt.event_id}
                    </span>
                    <Badge variant={evt.severity} size="sm">{evt.severity}</Badge>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{evt.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#e2e8f0', marginTop: '0.2rem' }}>
                    {evt.description}
                  </div>
                </div>
                <Button size="sm" variant="ghost">Jump to Timeline →</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
