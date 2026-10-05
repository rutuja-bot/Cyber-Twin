import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  PlayCircle,
  Network,
  GitCommit,
  FileCheck2,
  Lock,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', paddingBottom: '3rem' }}>
      {/* Hero Section */}
      <section
        style={{
          padding: '4rem 1rem 2rem 1rem',
          textAlign: 'center',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div style={{ marginBottom: '1.25rem' }}>
          <Badge variant="cyan" pulse size="md">
            Interactive Digital Forensic Digital Twin
          </Badge>
        </div>

        <h1
          style={{
            fontSize: '3.2rem',
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            maxWidth: '920px',
            background: 'linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Reconstruct, Correlate & Replay Cyber Incidents in Real Time
        </h1>

        <p
          style={{
            fontSize: '1.15rem',
            color: '#94a3b8',
            maxWidth: '740px',
            marginTop: '1.25rem',
            lineHeight: 1.6
          }}
        >
          Solve fragmented cybersecurity evidence. Cyber Twin correlates disparate authentication,
          Sysmon, packet capture, and disk artifacts into a unified digital twin model with step-by-step
          chronological playback and cryptographic chain-of-custody verification.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '2.25rem', justifyContent: 'center' }}>
          <Button
            size="lg"
            variant="primary"
            icon={<ArrowRight size={18} />}
            onClick={() => navigate('/investigation')}
          >
            Start Investigation
          </Button>

          <Button
            size="lg"
            variant="outline"
            icon={<PlayCircle size={18} />}
            onClick={() => navigate('/replay')}
          >
            View Demo Replay
          </Button>

          <Button
            size="lg"
            variant="secondary"
            icon={<Layers size={18} />}
            onClick={() => navigate('/cases')}
          >
            Browse Case Vault
          </Button>
        </div>

        {/* Live Architecture Flow Strip */}
        <div
          style={{
            marginTop: '3.5rem',
            background: '#0d1424',
            border: '1px solid #1e293b',
            borderRadius: '10px',
            padding: '1.25rem 2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            maxWidth: '1000px',
            width: '100%',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.4)'
          }}
        >
          {['Evidence Ingestion', 'Parsing & Normalization', 'Evidence Mapping', 'Event Correlation', 'Reconstructed Cyber Twin', 'Interactive Replay'].map((step, idx, arr) => (
            <React.Fragment key={step}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: idx === arr.length - 2 ? '#00f2fe' : 'rgba(30, 41, 59, 0.8)',
                    color: idx === arr.length - 2 ? '#080c14' : '#cbd5e1',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'JetBrains Mono, monospace'
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: idx === arr.length - 2 ? '#00f2fe' : '#94a3b8' }}>
                  {step}
                </span>
              </div>
              {idx < arr.length - 1 && <span style={{ color: '#334155' }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* Core Investigation Views Grid */}
      <section>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc' }}>
            Four Coordinated Forensic Investigation Perspectives
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginTop: '0.35rem' }}>
            Seamlessly navigate from high-level attack topology down to bit-level raw log evidence
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {/* Card 1 */}
          <div
            className="cyber-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/graph')}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(0, 242, 254, 0.1)', border: '1px solid #00f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#00f2fe' }}>
              <Network size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Relationship Graph
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
              Topological node-link representation revealing compromised accounts, lateral movement vectors,
              and external command-and-control infrastructure.
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#00f2fe', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Explore Graph →
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="cyber-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/timeline')}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#38bdf8' }}>
              <GitCommit size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Chronological Timeline
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
              Precision millisecond-accurate timeline synchronizing disparate system events into a single
              unified attack lifecycle aligned with MITRE ATT&CK.
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Inspect Timeline →
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="cyber-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/replay')}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#a855f7' }}>
              <PlayCircle size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Interactive Replay
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
              Step-by-step forensic VCR controls allowing investigators to scrub back and forth through
              the incident to observe attack progression across network assets.
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#a855f7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Launch Replay →
            </div>
          </div>

          {/* Card 4 */}
          <div
            className="cyber-card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/evidence')}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#10b981' }}>
              <FileCheck2 size={22} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Evidence Chain of Custody
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.4rem', lineHeight: 1.5 }}>
              SHA-256 cryptographic verification ensuring evidence integrity with bidirectional links
              between reconstructed events and raw forensic artifacts.
            </p>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              Verify Artifacts →
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
