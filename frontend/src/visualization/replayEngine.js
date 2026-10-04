/**
 * Incident Replay Engine Pure Utility Module
 * 
 * Provides pure state calculation functions for:
 * - Chronological event sorting
 * - Step-forward and step-backward boundary arithmetic
 * - Playback interval computation for speeds (0.5x, 1x, 2x, 5x)
 * - Replay progress formatting
 */

const PLAYBACK_SPEEDS = [0.5, 1, 2, 5];
const DEFAULT_BASE_INTERVAL_MS = 1500;

/**
 * Sorts events strictly chronologically by timestamp, then event_id.
 * 
 * @param {Array<Object>} events 
 * @returns {Array<Object>}
 */
function sortEventsChronologically(events) {
  if (!Array.isArray(events)) return [];
  return [...events].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return (a.event_id || '').localeCompare(b.event_id || '');
  });
}

/**
 * Calculates the next index during step forward or automated playback.
 * Guaranteed to never exceed totalEvents - 1.
 * 
 * @param {number} currentIndex 
 * @param {number} totalEvents 
 * @returns {number}
 */
function calculateNextIndex(currentIndex, totalEvents) {
  if (totalEvents <= 0) return 0;
  if (currentIndex < 0) return 0;
  if (currentIndex >= totalEvents - 1) return totalEvents - 1;
  return currentIndex + 1;
}

/**
 * Calculates the previous index during step backward.
 * Guaranteed to never go below 0.
 * 
 * @param {number} currentIndex 
 * @param {number} totalEvents 
 * @returns {number}
 */
function calculatePrevIndex(currentIndex, totalEvents) {
  if (totalEvents <= 0) return 0;
  if (currentIndex <= 0) return 0;
  return currentIndex - 1;
}

/**
 * Computes timer interval in milliseconds based on playback speed multiplier.
 * 
 * @param {number} speed - e.g. 0.5, 1, 2, 5
 * @param {number} baseIntervalMs - default 1500ms
 * @returns {number}
 */
function getPlaybackIntervalMs(speed, baseIntervalMs = DEFAULT_BASE_INTERVAL_MS) {
  const numericSpeed = typeof speed === 'number' && speed > 0 ? speed : 1;
  return Math.max(100, Math.round(baseIntervalMs / numericSpeed));
}

/**
 * Formats user-facing replay progress indicator.
 * e.g. "Event 4 / 7"
 * 
 * @param {number} currentIndex 
 * @param {number} totalEvents 
 * @returns {string}
 */
function formatReplayProgress(currentIndex, totalEvents) {
  if (totalEvents <= 0) return 'Event 0 / 0';
  const displayIndex = currentIndex >= 0 ? currentIndex + 1 : 0;
  return `Event ${displayIndex} / ${totalEvents}`;
}

module.exports = {
  sortEventsChronologically,
  calculateNextIndex,
  calculatePrevIndex,
  getPlaybackIntervalMs,
  formatReplayProgress,
  PLAYBACK_SPEEDS,
  DEFAULT_BASE_INTERVAL_MS
};
