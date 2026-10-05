import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  GitCommit,
  Network,
  PlayCircle,
  ArrowRight,
  ShieldAlert,
  Layers,
  Cpu
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { InvestigationView } from '../../visualization/InvestigationView';

const LiveInvestigationView = InvestigationView as any;

export const InvestigationDashboardPage: React.FC = () => {
  const {
    activeCase,
    summary,
    evidenceList,
    eventList,
    graphData,
    findingsList,
    reconstructionModel,
    loading,
    setSelectedEvent,
    setSelectedEvidence,
    setSelectedEntity
  } = useInvestigation();
  const navigate = useNavigate();

  if (!activeCase) return null;

  const affectedHost = eventList.find(e => e.source_device && e.source_device !== 'N/A')?.source_device || 'WORKSTATION-01';
  const targetUser = eventList.find(e => e.actor && e.actor !== 'system')?.actor || 'employee01';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Above-the-fold Investigator Summary Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.85rem',
          background: '#101936',
          border: '1px solid #24315C',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          boxShadow: '0 4px 20px rgba(5, 8, 22, 0.4)'
        }}
      >
        <div>
          <div style={{ fontSize: '0.7rem', color: '#A7B0C8', textTransform: 'uppercase', fontWeight: 600 }}>
            Incident Severity
          </div>
          <div style={{ marginTop: '0.35rem' }}>
            <Badge variant={activeCase.severity}>{activeCase.severity}</Badge>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#A7B0C8', textTransform: 'uppercase', fontWeight: 600 }}>
            Investigation Status
          </div>
          <div style={{ marginTop: '0.35rem' }}>
            <Badge variant={activeCase.status}>{activeCase.status}</Badge>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#A7B0C8', textTransform: 'uppercase', fontWeight: 600 }}>
            Affected Host
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#00B7FF', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.25rem' }}>
            {affectedHost}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#A7B0C8', textTransform: 'uppercase', fontWeight: 600 }}>
            Target User Account
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F5F7FF', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.25rem' }}>
            {targetUser}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#A7B0C8', textTransform: 'uppercase', fontWeight: 600 }}>
            Correlated Events
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F5F7FF', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.25rem' }}>
            {eventList.length} <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>({summary?.suspicious_events || eventList.length} flagged)</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#A7B0C8', textTransform: 'uppercase', fontWeight: 600 }}>
            Evidence Artifacts
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10B981', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.25rem' }}>
            {evidenceList.length} files
          </div>
        </div>
      </div>

      {/* Cyber Twin Core Workbench Section */}
      <div
        style={{
          background: '#0D1424',
          border: '1px solid #1E2D4A',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)'
        }}
      >
        <div
          style={{
            padding: '0.85rem 1.25rem',
            background: '#131D36',
            borderBottom: '1px solid #24315C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Cpu size={18} color="#00B7FF" />
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#F5F7FF' }}>
              Interactive Cyber Twin Workbench & Replay Core
            </span>
            <Badge variant="investigating" size="sm">LIVE RECONSTRUCTION</Badge>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button size="sm" variant="outline" onClick={() => navigate('/graph')}>
              2D Graph
            </Button>
            <Button size="sm" variant="primary" icon={<PlayCircle size={14} />} onClick={() => navigate('/replay')}>
              Full Replay
            </Button>
          </div>
        </div>

        {reconstructionModel ? (
          <LiveInvestigationView
            model={reconstructionModel}
            height="720px"
            width="100%"
          />
        ) : (
          <div
            style={{
              height: '400px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#A7B0C8',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00B7FF' }}>
              Initializing Cyber Twin Reconstruction...
            </div>
          </div>
        )}
      </div>

      {/* Main Investigation Split for Detailed Records */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(360px, 1fr)', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left Column: Timeline & Attack Path */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Timeline Section */}
          <Card
            title="Chronological Incident Timeline"
            subtitle="Normalized UTC security events"
            icon={<GitCommit size={16} />}
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/timeline')}>
                Full Timeline
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {eventList.slice(0, 5).map((evt) => (
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
                    navigate('/timeline');
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#00B7FF', fontWeight: 700 }}>
                        {evt.event_id}
                      </span>
                      <Badge variant={evt.severity} size="sm">{evt.severity}</Badge>
                      <span style={{ fontSize: '0.72rem', color: '#717E9E', fontFamily: 'JetBrains Mono, monospace' }}>
                        {evt.timestamp.includes('T') ? evt.timestamp.split('T')[1].replace('Z', '') : evt.timestamp}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: '#F5F7FF', marginTop: '0.25rem', fontWeight: 500 }}>
                      {evt.description}
                    </div>
                  </div>
                  <ArrowRight size={15} color="#00B7FF" />
                </div>
              ))}
            </div>
          </Card>

          {/* Attack Path & Entities Summary */}
          <Card
            title="Correlated Entities"
            subtitle="Identities, endpoints, files, and network nodes"
            icon={<Network size={16} />}
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/graph')}>
                Open Graph
              </Button>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
              {graphData.entities.slice(0, 6).map((ent) => (
                <div
                  key={ent.entity_id}
                  style={{
                    background: '#151F46',
                    border: `1px solid ${ent.is_compromised ? 'rgba(239, 68, 68, 0.5)' : '#24315C'}`,
                    borderRadius: '8px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    setSelectedEntity(ent);
                    navigate('/graph');
                  }}
                >
                  <div style={{ fontSize: '0.65rem', color: '#717E9E', textTransform: 'uppercase', fontWeight: 600 }}>
                    {ent.entity_type}
                  </div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: ent.is_compromised ? '#FCA5A5' : '#F5F7FF', marginTop: '0.2rem' }}>
                    {ent.name}
                  </div>
                  {ent.is_compromised && (
                    <span style={{ fontSize: '0.65rem', color: '#EF4444', fontWeight: 700 }}>Compromised</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Evidence & Findings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Evidence Preview */}
          <Card
            title="Collected Evidence"
            subtitle="Verified forensic records with SHA-256"
            icon={<FileCheck2 size={16} />}
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/evidence')}>
                All Evidence
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {evidenceList.slice(0, 4).map((e) => (
                <div
                  key={e.evidence_id}
                  style={{
                    background: '#151F46',
                    border: '1px solid #24315C',
                    borderRadius: '8px',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => {
                    setSelectedEvidence(e);
                    navigate('/evidence');
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, color: '#F5F7FF', fontSize: '0.825rem' }}>
                      {e.filename}
                    </div>
                    <Badge variant={e.relevance} size="sm">{e.type}</Badge>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#717E9E', marginTop: '0.2rem' }}>
                    {e.source}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#4DEBFF', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.25rem' }}>
                    SHA-256: {e.hash ? e.hash.substring(0, 20) : 'e3b0c44298fc1c14...'}...
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Key Findings */}
          <Card
            title="Forensic Findings"
            subtitle="Corroborated incident conclusions"
            icon={<ShieldAlert size={16} />}
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/report')}>
                Full Report
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {findingsList.map((f) => (
                <div
                  key={f.finding_id}
                  style={{
                    background: '#151F46',
                    border: '1px solid #24315C',
                    borderRadius: '8px',
                    padding: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#F5F7FF' }}>
                      {f.title}
                    </span>
                    <Badge variant={f.severity} size="sm">{f.severity}</Badge>
                  </div>
                  <p style={{ fontSize: '0.76rem', color: '#A7B0C8', lineHeight: 1.4 }}>
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
