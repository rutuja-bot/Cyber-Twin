import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  FastForward,
  Gauge
} from 'lucide-react';
import { Button } from '../common/Button';

interface ReplayControlsProps {
  isPlaying: boolean;
  currentIndex: number;
  totalEvents: number;
  speed: number;
  onPlayPause: () => void;
  onRestart: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onSeek: (index: number) => void;
  onSpeedChange: (speed: number) => void;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  isPlaying,
  currentIndex,
  totalEvents,
  speed,
  onPlayPause,
  onRestart,
  onStepBack,
  onStepForward,
  onSeek,
  onSpeedChange
}) => {
  return (
    <div
      style={{
        background: '#0a0f1d',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Scrubber and Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.78rem' }}>
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>
            Incident Playback Progress:
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00f2fe', fontWeight: 700 }}>
            Step {currentIndex + 1} of {totalEvents}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={Math.max(totalEvents - 1, 0)}
          value={currentIndex}
          onChange={(e) => onSeek(Number(e.target.value))}
          style={{
            width: '100%',
            height: '6px',
            accentColor: '#00f2fe',
            cursor: 'pointer',
            borderRadius: '3px'
          }}
        />
      </div>

      {/* Button Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Playback Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRestart}
            title="Restart Replay"
            icon={<RotateCcw size={16} />}
          >
            Restart
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onStepBack}
            disabled={currentIndex <= 0}
            title="Step Backward"
            icon={<SkipBack size={16} />}
          >
            Prev
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onPlayPause}
            icon={isPlaying ? <Pause size={18} /> : <Play size={18} />}
          >
            {isPlaying ? 'Pause Playback' : 'Play Reconstruction'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onStepForward}
            disabled={currentIndex >= totalEvents - 1}
            title="Step Forward"
            icon={<SkipForward size={16} />}
          >
            Next
          </Button>
        </div>

        {/* Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#0d1424', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <Gauge size={14} color="#38bdf8" />
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Speed:</span>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              style={{
                background: speed === s ? '#00f2fe' : 'transparent',
                color: speed === s ? '#080c14' : '#cbd5e1',
                border: 'none',
                padding: '0.2rem 0.45rem',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                cursor: 'pointer'
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
