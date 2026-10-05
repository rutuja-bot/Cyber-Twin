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
        background: '#101936',
        border: '1px solid #24315C',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)'
      }}
    >
      {/* Scrubber and Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem', fontSize: '0.8rem' }}>
          <span style={{ color: '#A7B0C8', fontWeight: 600 }}>
            Incident Playback Progress:
          </span>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00B7FF', fontWeight: 600 }}>
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
            accentColor: '#00B7FF',
            cursor: 'pointer',
            borderRadius: '3px'
          }}
        />
      </div>

      {/* Button Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        {/* Playback Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRestart}
            title="Restart Replay"
            icon={<RotateCcw size={15} />}
          >
            Restart
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onStepBack}
            disabled={currentIndex <= 0}
            title="Step Backward"
            icon={<SkipBack size={15} />}
          >
            Prev
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={onPlayPause}
            icon={isPlaying ? <Pause size={17} /> : <Play size={17} />}
          >
            {isPlaying ? 'Pause Playback' : 'Play Reconstruction'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onStepForward}
            disabled={currentIndex >= totalEvents - 1}
            title="Step Forward"
            icon={<SkipForward size={15} />}
          >
            Next
          </Button>
        </div>

        {/* Speed Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', background: '#151F46', padding: '0.3rem 0.6rem', borderRadius: '8px', border: '1px solid #24315C' }}>
          <Gauge size={14} color="#00B7FF" />
          <span style={{ fontSize: '0.72rem', color: '#A7B0C8', fontWeight: 600 }}>Speed:</span>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              style={{
                background: speed === s ? 'linear-gradient(135deg, #1677FF 0%, #7B2CFF 100%)' : 'transparent',
                color: speed === s ? '#FFFFFF' : '#A7B0C8',
                border: 'none',
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                fontFamily: 'JetBrains Mono, monospace',
                cursor: 'pointer',
                boxShadow: speed === s ? '0 2px 8px rgba(22, 119, 255, 0.35)' : 'none'
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
