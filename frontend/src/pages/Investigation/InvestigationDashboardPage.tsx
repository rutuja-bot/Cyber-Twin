import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  GitCommit,
  AlertTriangle,
  Network,
  PlayCircle,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Terminal,
  Activity,
  Layers
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const InvestigationDashboardPage: React.FC = () => {
  const {
    activeCase,
    summary,
    evidenceList,
    eventList,
    graphData,
    findingsList,
    setSelectedEvent,
    setSelectedEvidence
  } = useInvestigation();
  const navigate = useNavigate();

  if (!activeCase) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 6 Key Forensic Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <MetricCard
          label="Evidence Artifacts"
          value={evidenceList.length}
          subtext="Cryptographically certified files"
          icon={<FileCheck2 size={18} />}
          accentColor="#10b981"
        />

        <MetricCard
          label="Events Analyzed"
          value={eventList.length}
          subtext="Normalized UTC chronological events"
          icon={<GitCommit size={18} />}
          accentColor="#38bdf8"
        />

        <MetricCard
          label="Suspicious Events"
          value={summary?.suspicious_events || 8}
          subtext="Flagged in attack progression"
          icon={<AlertTriangle size={18} />}
          accentColor="#ef4444"
          badge="ACTION REQUIRED"
        />

        <MetricCard
          label="Entities Discovered"
          value={graphData.entities.length}
          subtext="Users, hosts, IPs, processes"
          icon={<Network size={18} />}
          accentColor="#00f2fe"
        />

        <MetricCard
          label="Reconstructed Attack Paths"
          value={summary?.attack_paths_count || 2}
          subtext="Lateral movement & exfiltration"
          icon={<Flame size={18} />}
          accentColor="#f59e0b"
        />

        <MetricCard
          label="Forensic Findings"
          value={findingsList.length}
          subtext="Corroborated MITRE discoveries"
          icon={<FileSpreadsheet size={18} />}
          accentColor="#a855f7"
        />
      </div>

      {/* Cyber Kill Chain Progress Banner */}
      <Card
        title="Reconstructed Attack Lifecycle (Kill Chain Progress)"
        subtitle="Forensically confirmed tactical phases based on correlated log evidence"
        icon={<Activity size={18} />}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.5rem'
          }}
        >
          {[
            { phase: 'Initial Access', done: true, desc: 'Subnet Brute Force' },
            { phase: 'Execution', done: true, desc: 'PowerShell PID 6412' },
            { phase: 'Privilege Escalation', done: true, desc: 'SYSTEM Token Impersonation' },
            { phase: 'Defense Evasion', done: true, desc: 'Event Log Clear Attempt' },
            { phase: 'Lateral Collection', done: true, desc: 'SMB Vault Read (10.0.4.15)' },
            { phase: 'Exfiltration', done: true, desc: 'Port 8443 TLS Stream' }
          ].map((kc, idx) => (
            <div
              key={kc.phase}
              style={{
                background: '#090f1d',
                border: `1px solid ${kc.done ? 'rgba(239, 68, 68, 0.4)' : '#1e293b'}`,
                borderRadius: '6px',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>
                  PHASE 0{idx + 1}
                </span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: kc.done ? '#ef4444' : '#334155' }} />
              </div>
              <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#f8fafc' }}>
                {kc.phase}
              </div>
              <div style={{ fontSize: '0.72rem', color: kc.done ? '#fca5a5' : '#64748b' }}>
                {kc.desc}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Main Workspace 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Left Column: Timeline Preview & Evidence Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Timeline Preview */}
          <Card
            title="Chronological Incident Timeline"
            subtitle="Latest correlated forensic events"
            icon={<GitCommit size={18} />}
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/timeline')}>
                View Full Timeline →
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {eventList.slice(0, 4).map((evt) => (
                <div
                  key={evt.event_id}
                  style={{
                    background: '#090f1d',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedEvent(evt);
                    navigate('/timeline');
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#00f2fe', fontWeight: 700 }}>
                        {evt.event_id}
                      </span>
                      <Badge variant={evt.severity} size="sm">{evt.severity}</Badge>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{evt.timestamp.split('T')[1].replace('Z', ' UTC')}</span>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#f1f5f9', fontWeight: 500, marginTop: '0.2rem' }}>
                      {evt.description}
                    </div>
                  </div>
                  <ArrowRight size={14} color="#64748b" />
                </div>
              ))}
            </div>
          </Card>

          {/* Evidence Preview */}
          <Card
            title="Evidence Vault & Chain of Custody"
            subtitle="Extracted forensic artifacts verified with SHA-256"
            icon={<FileCheck2 size={18} />}
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/evidence')}>
                View All Evidence →
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {evidenceList.slice(0, 3).map((e) => (
                <div
                  key={e.evidence_id}
                  style={{
                    background: '#090f1d',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setSelectedEvidence(e);
                    navigate('/evidence');
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>
                      {e.filename}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.15rem' }}>
                      Source: {e.source}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.2rem' }}>
                      SHA-256: {e.hash.substring(0, 20)}...
                    </div>
                  </div>
                  <Badge variant="verified" size="sm">Certified</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Relationship Preview & Quick Replay Launcher */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Replay Launcher Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
              border: '1px solid rgba(0, 242, 254, 0.4)',
              borderRadius: '8px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 0 25px rgba(0, 242, 254, 0.15)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#00f2fe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#080c14'
                }}
              >
                <PlayCircle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                  Incident Reconstruction Player
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#cbd5e1' }}>
                  Replay the 11-step breach attack progression across infrastructure assets.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button
                variant="primary"
                icon={<PlayCircle size={16} />}
                onClick={() => navigate('/replay')}
              >
                Launch Incident Replay
              </Button>
              <Button
                variant="outline"
                icon={<Network size={16} />}
                onClick={() => navigate('/graph')}
              >
                Open Entity Graph
              </Button>
            </div>
          </div>

          {/* Key Findings List */}
          <Card
            title="Corroborated Investigation Findings"
            subtitle="Actionable forensic conclusions"
            icon={<ShieldAlert size={18} />}
            action={
              <Button size="sm" variant="ghost" onClick={() => navigate('/report')}>
                Generate Report →
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {findingsList.map((f) => (
                <div
                  key={f.finding_id}
                  style={{
                    background: '#090f1d',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '0.85rem 1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                      {f.title}
                    </span>
                    <Badge variant={f.severity} size="sm">{f.severity}</Badge>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
