import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, ShieldCheck, Database, GitCommit, Layers } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '880px', margin: '3rem auto', display: 'flex', flexDirection: 'column', gap: '2.75rem' }}>
      {/* Product Hero */}
      <section style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.78rem',
            color: '#4DEBFF',
            fontWeight: 600,
            background: 'rgba(22, 119, 255, 0.12)',
            border: '1px solid rgba(0, 183, 255, 0.35)',
            padding: '0.35rem 0.85rem',
            borderRadius: '20px',
            width: 'fit-content',
            boxShadow: '0 0 15px rgba(0, 183, 255, 0.15)'
          }}
        >
          <ShieldCheck size={16} color="#00B7FF" />
          <span>Interactive Cyber Incident Reconstruction & Digital Forensics</span>
        </div>

        <h1
          style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            color: '#F5F7FF',
            letterSpacing: '-0.025em',
            lineHeight: 1.15
          }}
        >
          Cyber <span className="text-gradient">Twin</span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#A7B0C8', lineHeight: 1.6, maxWidth: '720px' }}>
          Interactive incident reconstruction platform correlating fragmented system logs, entity relationships, and chronological timelines into a high-fidelity digital forensic workspace.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <Button
            size="lg"
            variant="primary"
            icon={<ArrowRight size={18} />}
            onClick={() => navigate('/investigation')}
            style={{ boxShadow: '0 4px 20px rgba(22, 119, 255, 0.4)' }}
          >
            Launch Investigation Console
          </Button>

          <Button
            size="lg"
            variant="secondary"
            icon={<Briefcase size={18} />}
            onClick={() => navigate('/cases')}
          >
            Open Case Vault
          </Button>
        </div>
      </section>

      {/* 3-Step Practical Workflow */}
      <section
        style={{
          background: '#101936',
          border: '1px solid #24315C',
          borderRadius: '14px',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          boxShadow: '0 10px 30px rgba(5, 8, 22, 0.5)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#F5F7FF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Forensic Investigation Methodology
          </div>
          <span style={{ fontSize: '0.72rem', color: '#00B7FF', fontFamily: 'JetBrains Mono, monospace' }}>
            NIST SP 800-86 Compliant
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div
            style={{
              background: '#151F46',
              padding: '1.25rem',
              borderRadius: '10px',
              border: '1px solid #24315C',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#00B7FF', fontFamily: 'JetBrains Mono, monospace' }}>01</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F5F7FF' }}>Collect & Verify</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#A7B0C8', lineHeight: 1.5 }}>
              Ingest security event logs, Sysmon, network PCAP, and memory artifacts with certified SHA-256 cryptographic chain of custody.
            </p>
          </div>

          <div
            style={{
              background: '#151F46',
              padding: '1.25rem',
              borderRadius: '10px',
              border: '1px solid #24315C',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#7B2CFF', fontFamily: 'JetBrains Mono, monospace' }}>02</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F5F7FF' }}>Correlate & Graph</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#A7B0C8', lineHeight: 1.5 }}>
              Normalize timestamps into unified UTC, cross-correlate events across hosts and users, and build topological graph models.
            </p>
          </div>

          <div
            style={{
              background: '#151F46',
              padding: '1.25rem',
              borderRadius: '10px',
              border: '1px solid #24315C',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#D62CFF', fontFamily: 'JetBrains Mono, monospace' }}>03</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#F5F7FF' }}>Replay & Report</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#A7B0C8', lineHeight: 1.5 }}>
              Step through time-synchronized attack sequences, replay breach progressions, verify raw evidence records, and generate dossier reports.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
