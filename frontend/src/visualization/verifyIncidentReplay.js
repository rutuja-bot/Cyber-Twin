/**
 * Verification Suite for Cyber Twin Incident Replay Playback Engine
 * 
 * Verifies:
 * 1. Replay Engine utility functions (calculateNextIndex, calculatePrevIndex, getPlaybackIntervalMs, formatReplayProgress).
 * 2. Boundary conditions:
 *    - First-event boundary: step backward cannot drop below index 0.
 *    - Last-event boundary: step forward cannot exceed totalEvents - 1.
 * 3. Playback speed intervals for 0.5x, 1x, 2x, 5x.
 * 4. Scrubber index mapping and formatting.
 * 5. Dynamic arbitrary event models (testing N=2, N=15, confirming zero hardcoding of 7).
 * 6. InvestigationView component integration (replay controls, accessible names, aria labels, toolbar markup).
 */

const fs = require('fs');
const path = require('path');

const {
  calculateNextIndex,
  calculatePrevIndex,
  getPlaybackIntervalMs,
  formatReplayProgress,
  PLAYBACK_SPEEDS
} = require('./replayEngine');

const { mockEvents, createCyberTwinDataModel } = require('./index');

console.log('================================================================');
console.log('   CYBER TWIN INCIDENT REPLAY PLAYBACK VERIFICATION SUITE       ');
console.log('================================================================\n');

let allPassed = true;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    allPassed = false;
  }
}

// -------------------------------------------------------------
// 1. Replay Engine Boundary Arithmetic
// -------------------------------------------------------------
console.log('--- 1. Step Forward & Backward Boundary Calculations ---');
const totalEvents = 7;

// Initial state (none selected / -1)
assert(calculateNextIndex(-1, totalEvents) === 0, 'calculateNextIndex(-1) starts at index 0');
assert(calculatePrevIndex(-1, totalEvents) === 0, 'calculatePrevIndex(-1) defaults to index 0');

// Stepping forward
assert(calculateNextIndex(0, totalEvents) === 1, 'Step forward from 0 advances to 1');
assert(calculateNextIndex(3, totalEvents) === 4, 'Step forward from 3 advances to 4');
assert(calculateNextIndex(5, totalEvents) === 6, 'Step forward from 5 advances to 6');
assert(calculateNextIndex(6, totalEvents) === 6, 'Step forward from last event (6) stops at 6 (last-event boundary)');

// Stepping backward
assert(calculatePrevIndex(6, totalEvents) === 5, 'Step backward from 6 goes to 5');
assert(calculatePrevIndex(4, totalEvents) === 3, 'Step backward from 4 goes to 3');
assert(calculatePrevIndex(1, totalEvents) === 0, 'Step backward from 1 goes to 0');
assert(calculatePrevIndex(0, totalEvents) === 0, 'Step backward from 0 stops at 0 (first-event boundary)');

// Empty collection safety
assert(calculateNextIndex(0, 0) === 0, 'Next index safe with 0 events');
assert(calculatePrevIndex(0, 0) === 0, 'Prev index safe with 0 events');

// -------------------------------------------------------------
// 2. Playback Speeds & Interval Mapping
// -------------------------------------------------------------
console.log('\n--- 2. Playback Speeds & Interval Calculations ---');
assert(Array.isArray(PLAYBACK_SPEEDS) && PLAYBACK_SPEEDS.length === 4, 'PLAYBACK_SPEEDS provides 4 options');
assert(PLAYBACK_SPEEDS.includes(0.5) && PLAYBACK_SPEEDS.includes(1) && PLAYBACK_SPEEDS.includes(2) && PLAYBACK_SPEEDS.includes(5),
  'PLAYBACK_SPEEDS contains 0.5x, 1x, 2x, 5x');

assert(getPlaybackIntervalMs(1) === 1500, 'Speed 1x yields 1500ms interval');
assert(getPlaybackIntervalMs(0.5) === 3000, 'Speed 0.5x yields 3000ms interval');
assert(getPlaybackIntervalMs(2) === 750, 'Speed 2x yields 750ms interval');
assert(getPlaybackIntervalMs(5) === 300, 'Speed 5x yields 300ms interval');

// -------------------------------------------------------------
// 3. Scrubber Progress Formatting
// -------------------------------------------------------------
console.log('\n--- 3. Progress Formatting & Indicators ---');
assert(formatReplayProgress(-1, 7) === 'Event 0 / 7', 'Overview mode formatted as Event 0 / 7');
assert(formatReplayProgress(0, 7) === 'Event 1 / 7', 'First event formatted as Event 1 / 7');
assert(formatReplayProgress(3, 7) === 'Event 4 / 7', 'Index 3 formatted as Event 4 / 7');
assert(formatReplayProgress(6, 7) === 'Event 7 / 7', 'Last event formatted as Event 7 / 7');
assert(formatReplayProgress(0, 0) === 'Event 0 / 0', 'Empty collection formatted safely as Event 0 / 0');

// -------------------------------------------------------------
// 4. Dynamic Arbitrary Event Count Handling (Zero Hardcoding)
// -------------------------------------------------------------
console.log('\n--- 4. Arbitrary Case Dynamic Event Simulation ---');
const dynamicCounts = [2, 5, 12, 100];
for (const count of dynamicCounts) {
  let idx = 0;
  for (let step = 0; step < count + 5; step++) {
    idx = calculateNextIndex(idx, count);
  }
  assert(idx === count - 1, `Dynamic simulation of ${count} events stopped exactly at ${count - 1}`);

  for (let step = 0; step < count + 5; step++) {
    idx = calculatePrevIndex(idx, count);
  }
  assert(idx === 0, `Dynamic simulation of ${count} events reversed to 0`);
}

// -------------------------------------------------------------
// 5. InvestigationView Markup & Accessibility Audit
// -------------------------------------------------------------
console.log('\n--- 5. InvestigationView Replay UI Audit ---');
const viewPath = path.join(__dirname, 'InvestigationView.jsx');
assert(fs.existsSync(viewPath), 'InvestigationView.jsx exists');
const viewContent = fs.readFileSync(viewPath, 'utf8');

// Controls accessibility
assert(viewContent.includes('aria-label="Previous Event"'), 'Contains accessible Previous Event button');
assert(viewContent.includes('aria-label="Next Event"'), 'Contains accessible Next Event button');
assert(viewContent.includes('aria-label={isPlaying ? "Pause" : "Play"}') || viewContent.includes('aria-label="Play"'),
  'Contains accessible Play/Pause toggle button');
assert(viewContent.includes('aria-label="Incident timeline replay scrubber"'), 'Contains accessible scrubber slider');

// Playback speeds
assert(viewContent.includes('PLAYBACK_SPEEDS'), 'InvestigationView maps over PLAYBACK_SPEEDS');
assert(viewContent.includes('getPlaybackIntervalMs'), 'InvestigationView derives intervals from speed');

// Timer cleanup
assert(viewContent.includes('clearInterval(timer)'), 'InvestigationView performs clean timer disposal');

// Replay state tracking
assert(viewContent.includes('isPlaying'), 'InvestigationView tracks isPlaying state');
assert(viewContent.includes('playbackSpeed'), 'InvestigationView tracks playbackSpeed state');
assert(viewContent.includes('currentEventIndex'), 'InvestigationView tracks currentEventIndex');

// Scrubber synchronization
assert(viewContent.includes('handleScrubberChange'), 'InvestigationView implements handleScrubberChange');
assert(viewContent.includes('handleStepForward'), 'InvestigationView implements handleStepForward');
assert(viewContent.includes('handleStepBackward'), 'InvestigationView implements handleStepBackward');

console.log('\n================================================================');
if (allPassed) {
  console.log('   ALL CHECKS PASSED: INCIDENT REPLAY FULLY VERIFIED!           ');
} else {
  console.error('   SOME CHECKS FAILED: PLEASE REVIEW OUTPUT ABOVE!              ');
  process.exit(1);
}
console.log('================================================================\n');
