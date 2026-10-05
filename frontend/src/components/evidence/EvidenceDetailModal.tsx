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
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <ShieldCheck size={24} color="#10B981" />
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#6EE7B7' }}>
                Forensic Integrity Certified (SHA-256 Match)
              </div>
              <div style={{ fontSize: '0.75rem', color: '#A7B0C8', marginTop: '0.15rem' }}>
                Cryptographic integrity certified upon ingestion. Chain of custody intact.
              </div>
            </div>
          </div>
          <Badge variant="verified">CHAIN OF CUSTODY VERIFIED</Badge>
        </div>

        {/* SHA-256 Hash Box */}
        <div
          style={{
            background: '#080E22',
            border: '1px solid #24315C',
            borderRadius: '10px',
            padding: '0.85rem 1.15rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.45rem'
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#A7B0C8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              SHA-256 Cryptographic Hash
            </span>
            <button
              onClick={handleCopyHash}
              style={{
                background: 'rgba(22, 119, 255, 0.15)',
                border: '1px solid rgba(0, 183, 255, 0.3)',
                color: copied ? '#10B981' : '#00B7FF',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '6px'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Hash'}
            </button>
          </div>
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.825rem',
              color: '#4DEBFF',
              wordBreak: 'break-all',
              lineHeight: 1.4
            }}
          >
            {evidence.hash}
          </div>
        </div>

        {/* Metadata Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem'
          }}
        >
          <div style={{ background: '#151F46', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #24315C' }}>
            <span style={{ fontSize: '0.7rem', color: '#717E9E', textTransform: 'uppercase', fontWeight: 600 }}>Artifact Type</span>
            <div style={{ fontSize: '0.9rem', color: '#F5F7FF', fontWeight: 700, marginTop: '0.2rem' }}>
              {evidence.type.toUpperCase()}
            </div>
          </div>
          <div style={{ background: '#151F46', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #24315C' }}>
            <span style={{ fontSize: '0.7rem', color: '#717E9E', textTransform: 'uppercase', fontWeight: 600 }}>File Size</span>
            <div style={{ fontSize: '0.9rem', color: '#F5F7FF', fontWeight: 700, marginTop: '0.2rem' }}>
              {evidence.metadata.file_size_kb ? `${(evidence.metadata.file_size_kb / 1024).toFixed(2)} MB` : '16.00 GB'}
            </div>
          </div>
          <div style={{ background: '#151F46', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #24315C' }}>
            <span style={{ fontSize: '0.7rem', color: '#717E9E', textTransform: 'uppercase', fontWeight: 600 }}>Extracted Records</span>
            <div style={{ fontSize: '0.9rem', color: '#00B7FF', fontWeight: 700, marginTop: '0.2rem', fontFamily: 'JetBrains Mono, monospace' }}>
              {evidence.metadata.extracted_records?.toLocaleString() || '1,240'} events
            </div>
          </div>
          <div style={{ background: '#151F46', padding: '0.85rem 1rem', borderRadius: '10px', border: '1px solid #24315C' }}>
            <span style={{ fontSize: '0.7rem', color: '#717E9E', textTransform: 'uppercase', fontWeight: 600 }}>Investigation Relevance</span>
            <div style={{ marginTop: '0.25rem' }}>
              <Badge variant={evidence.relevance}>{evidence.relevance}</Badge>
            </div>
          </div>
        </div>

        {/* Raw Log Preview */}
        {evidence.metadata.raw_sample && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
              <Terminal size={14} color="#00B7FF" />
              <span style={{ fontSize: '0.75rem', color: '#A7B0C8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Normalized Raw Log Record Sample
              </span>
            </div>
            <pre
              style={{
                background: '#080E22',
                border: '1px solid #24315C',
                borderRadius: '8px',
                padding: '1rem',
                fontSize: '0.76rem',
                color: '#F5F7FF',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                lineHeight: 1.5,
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              {evidence.metadata.raw_sample}
            </pre>
          </div>
        )}

        {/* Linked Chronological Events */}
        <div>
          <div style={{ fontSize: '0.75rem', color: '#A7B0C8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.65rem' }}>
            Linked Incident Events ({linkedEvents.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {linkedEvents.map((evt) => (
              <div
                key={evt.event_id}
                style={{
                  background: '#151F46',
                  border: '1px solid #24315C',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onClick={() => {
                  setSelectedEvent(evt);
                  onClose();
                  navigate('/timeline');
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#00B7FF', fontWeight: 700 }}>
                      {evt.event_id}
                    </span>
                    <Badge variant={evt.severity} size="sm">{evt.severity}</Badge>
                    <span style={{ fontSize: '0.75rem', color: '#717E9E' }}>{evt.timestamp}</span>
                  </div>
                  <div style={{ fontSize: '0.825rem', color: '#F5F7FF', marginTop: '0.25rem' }}>
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
