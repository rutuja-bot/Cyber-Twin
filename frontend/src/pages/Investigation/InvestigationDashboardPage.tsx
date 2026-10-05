import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck2,
  GitCommit,
  Network,
  PlayCircle,
  FileSpreadsheet,
  ArrowRight,
  Laptop,
  User,
  ShieldAlert,
  Hash
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
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
    setSelectedEvidence,
    setSelectedEntity
  } = useInvestigation();
  const navigate = useNavigate();

  if (!activeCase) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
            WS-FIN-04
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#A7B0C8', textTransform: 'uppercase', fontWeight: 600 }}>
            Target User Account
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F5F7FF', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.25rem' }}>
            dev_user41
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.7rem', color: '#A7B0C8', textTransform: 'uppercase', fontWeight: 600 }}>
            Correlated Events
          </div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F5F7FF', fontFamily: 'JetBrains Mono, monospace', marginTop: '0.25rem' }}>
            {eventList.length} <span style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600 }}>({summary?.suspicious_events || 8} flagged)</span>
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

      {/* Main Investigation Split */}
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
                        {evt.timestamp.split('T')[1].replace('Z', '')}
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
            title="Attack Path & Relationships"
            subtitle="Identities, endpoints, and exfiltration sinks"
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
          {/* Replay Quick Action */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(22, 119, 255, 0.15) 0%, rgba(123, 44, 255, 0.15) 100%)',
              border: '1px solid rgba(0, 183, 255, 0.35)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 20px rgba(22, 119, 255, 0.2)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#F5F7FF' }}>
                Incident Replay
              </div>
              <div style={{ fontSize: '0.75rem', color: '#A7B0C8', marginTop: '0.15rem' }}>
                Time-synchronized playback of 11 correlated breach steps
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<PlayCircle size={15} />}
              onClick={() => navigate('/replay')}
              style={{ boxShadow: '0 4px 14px rgba(22, 119, 255, 0.4)' }}
            >
              Start Replay
            </Button>
          </div>

          {/* Evidence Preview */}
          <Card
            title="Collected Evidence"
            subtitle="Verified forensic records"
            icon={<FileCheck2 size={16} />}
            action={
              <Button size="sm" variant="outline" onClick={() => navigate('/evidence')}>
                All Evidence
              </Button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {evidenceList.slice(0, 3).map((e) => (
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
                    SHA-256: {e.hash.substring(0, 20)}...
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
