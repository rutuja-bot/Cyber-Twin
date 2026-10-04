/**
 * Cyber Twin Visualization Module Entry Point
 */

const mockEvents = require('./mockEvents.json');
const {
  isValidBackendEvent,
  sortEventsChronologically,
  deriveEntities,
  deriveRelationships,
  buildEvidenceMap,
  createCyberTwinDataModel
} = require('./dataAdapter');

const {
  buildCytoscapeElements,
  getCytoscapeStylesheet
} = require('./graphElements');

let RelationshipGraph;
try {
  RelationshipGraph = require('./RelationshipGraph').RelationshipGraph;
} catch (e) {
  // ESM or bundler fallback
}

let IncidentTimeline, formatEventType;
try {
  const timelineModule = require('./IncidentTimeline');
  IncidentTimeline = timelineModule.IncidentTimeline;
  formatEventType = timelineModule.formatEventType;
} catch (e) {
  // ESM or bundler fallback
}

let InvestigationView;
try {
  InvestigationView = require('./InvestigationView').InvestigationView;
} catch (e) {
  // ESM or bundler fallback
}

let CyberTwin3DView;
try {
  CyberTwin3DView = require('./CyberTwin3DView').CyberTwin3DView;
} catch (e) {
  // ESM or bundler fallback
}

const {
  calculateNextIndex,
  calculatePrevIndex,
  getPlaybackIntervalMs,
  formatReplayProgress,
  PLAYBACK_SPEEDS
} = require('./replayEngine');

const {
  isAttackEvent,
  getAttackPathEventIds,
  getAttackPathNodeIds,
  getAttackPathEdgeIds,
  identifyAttackPath
} = require('./attackPath');

const {
  ZONE_EXTERNAL,
  ZONE_CORP_LAN,
  ZONE_RESTRICTED_DC,
  getZoneDefinitions,
  classifyEntityZone,
  getEntity3DSpec,
  transformModelTo3DScene
} = require('./cyberTwin3D');

module.exports = {
  mockEvents,
  isValidBackendEvent,
  sortEventsChronologically,
  deriveEntities,
  deriveRelationships,
  buildEvidenceMap,
  createCyberTwinDataModel,
  buildCytoscapeElements,
  getCytoscapeStylesheet,
  RelationshipGraph,
  IncidentTimeline,
  formatEventType,
  InvestigationView,
  CyberTwin3DView,
  calculateNextIndex,
  calculatePrevIndex,
  getPlaybackIntervalMs,
  formatReplayProgress,
  PLAYBACK_SPEEDS,
  isAttackEvent,
  getAttackPathEventIds,
  getAttackPathNodeIds,
  getAttackPathEdgeIds,
  identifyAttackPath,
  ZONE_EXTERNAL,
  ZONE_CORP_LAN,
  ZONE_RESTRICTED_DC,
  getZoneDefinitions,
  classifyEntityZone,
  getEntity3DSpec,
  transformModelTo3DScene
};
