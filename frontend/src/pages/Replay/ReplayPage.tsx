import React, { useState, useEffect } from 'react';
import {
  PlayCircle,
  FileCheck2,
  GitCommit,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  Info,
  Box
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { ReplayControls } from '../../components/replay/ReplayControls';
import { CyberTwin3DView } from '../../visualization/CyberTwin3DView';
import { CyberTwinStage } from '../../components/replay/CyberTwinStage';
import { Investigation3DScene } from '../../components/replay/Investigation3DScene';
import { EvidenceDetailModal } from '../../components/evidence/EvidenceDetailModal';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Evidence } from '../../types';

const LiveCyberTwin3DView = CyberTwin3DView as any;

export const ReplayPage: React.FC = () => {
  const { replayEvents, evidenceList, reconstructionModel, activeCase } = useInvestigation();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [modalEvidence, setModalEvidence] = useState<Evidence | null>(null);
  const [viewMode, setViewMode] = useState<'topology' | 'scene'>('topology');

  // Playback timer loop
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (isPlaying) {
      const intervalMs = Math.max(2200 / speed, 300);
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= replayEvents.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, speed, replayEvents.length]);

  const currentEvent = replayEvents[currentIndex] || replayEvents[0] || null;

  const handleViewEvidence = (evidenceId: string) => {
    const ev = evidenceList.find((e) => e.evidence_id === evidenceId) || evidenceList[0];
    setModalEvidence(ev);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#F5F7FF', letterSpacing: '-0.02em' }}>
            Interactive Incident Replay & 3D Cyber Twin
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#A7B0C8', marginTop: '0.2rem' }}>
            Time-synchronized playback engine reconstructing the step-by-step breach sequence across 3D infrastructure
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant={isPlaying ? 'investigating' : 'neutral'}>
            {isPlaying ? 'PLAYBACK ACTIVE' : 'PAUSED'}
          </Badge>
          <span style={{ fontSize: '0.8rem', color: '#A7B0C8' }}>
            Normalized Event Stream ({replayEvents.length} Steps)
          </span>
        </div>
      </div>

      {/* 3D Cyber Twin Spatial Stage */}
      <div
        style={{
          background: '#0D1424',
          border: '1px solid #1E2D4A',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            padding: '0.75rem 1.25rem',
            background: '#131D36',
            borderBottom: '1px solid #24315C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Box size={18} color="#00B7FF" />
            <div style={{ display: 'flex', background: '#080E22', padding: '2px', borderRadius: '6px', border: '1px solid #24315C' }}>
              <button
                onClick={() => setViewMode('topology')}
                style={{
                  background: viewMode === 'topology' ? '#151F46' : 'transparent',
                  color: viewMode === 'topology' ? '#00B7FF' : '#717E9E',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                3D Cyber Topology
              </button>
              <button
                onClick={() => setViewMode('scene')}
                style={{
                  background: viewMode === 'scene' ? '#151F46' : 'transparent',
                  color: viewMode === 'scene' ? '#00B7FF' : '#717E9E',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                3D Physical Crime Scene (.GLB)
              </button>
            </div>

            {currentEvent && (
              <Badge variant="investigating" size="sm">
                Active Step {currentIndex + 1}: {currentEvent.event_type}
              </Badge>
            )}
          </div>

          {currentEvent?.evidence_id && (
            <Button
              size="sm"
              variant="outline"
              icon={<FileCheck2 size={13} />}
              onClick={() => handleViewEvidence(currentEvent.evidence_id)}
            >
              Verify Evidence [{currentEvent.evidence_id}]
            </Button>
          )}
        </div>

        <div style={{ height: '520px', width: '100%', position: 'relative' }}>
          {viewMode === 'scene' ? (
            <Investigation3DScene
              caseId={activeCase?.case_id || 'CASE-001'}
              selectedEvidenceId={currentEvent?.evidence_id}
              onSelectEvidence={handleViewEvidence}
              height="520px"
              width="100%"
            />
          ) : reconstructionModel ? (
            <LiveCyberTwin3DView
              model={reconstructionModel}
              selectedEventId={currentEvent?.event_id || null}
              height="520px"
              width="100%"
            />
          ) : (
            <CyberTwinStage
              currentEvent={currentEvent}
              onViewEvidence={handleViewEvidence}
            />
          )}
        </div>
      </div>

      {/* Replay Controls & Scrubber */}
      <ReplayControls
        isPlaying={isPlaying}
        currentIndex={currentIndex}
        totalEvents={replayEvents.length}
        speed={speed}
        onPlayPause={() => setIsPlaying(!isPlaying)}
        onRestart={() => {
          setIsPlaying(false);
          setCurrentIndex(0);
        }}
        onStepBack={() => {
          setIsPlaying(false);
          setCurrentIndex((prev) => Math.max(prev - 1, 0));
        }}
        onStepForward={() => {
          setIsPlaying(false);
          setCurrentIndex((prev) => Math.min(prev + 1, replayEvents.length - 1));
        }}
        onSeek={(idx) => {
          setIsPlaying(false);
          setCurrentIndex(idx);
        }}
        onSpeedChange={(newSpeed) => setSpeed(newSpeed)}
      />

      {/* Sequence Timeline Strip */}
      <div
        style={{
          background: '#101936',
          border: '1px solid #24315C',
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
        }}
      >
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#F5F7FF', marginBottom: '0.85rem' }}>
          Chronological Attack Progression Sequence
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem'
          }}
        >
          {replayEvents.map((evt, idx) => {
            const isCurrent = idx === currentIndex;
            const isPast = idx < currentIndex;

            return (
              <div
                key={evt.event_id || idx}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentIndex(idx);
                }}
                style={{
                  minWidth: '200px',
                  background: isCurrent ? 'rgba(22, 119, 255, 0.14)' : isPast ? '#151F46' : '#0A1024',
                  border: `1px solid ${isCurrent ? '#00B7FF' : '#24315C'}`,
                  boxShadow: isCurrent ? '0 4px 16px rgba(0, 183, 255, 0.18)' : 'none',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: isCurrent ? '#00B7FF' : '#A7B0C8'
                    }}
                  >
                    Step {idx + 1}
                  </span>
                  <Badge variant={evt.severity} size="sm">{evt.severity}</Badge>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#F5F7FF', marginTop: '0.25rem' }}>
                  {evt.event_type.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#A7B0C8', marginTop: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evt.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence Detail Modal */}
      <EvidenceDetailModal
        evidence={modalEvidence}
        onClose={() => setModalEvidence(null)}
      />
    </div>
  );
};
