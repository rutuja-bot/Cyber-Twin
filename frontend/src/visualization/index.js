/**
 * Cyber Twin Visualization Module Entry Point
 * ESM Module structure supporting full integration with Backend reconstruction data.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mockEvents = require('./mockEvents.json');

import {
  isValidBackendEvent,
  sortEventsChronologically,
  deriveEntities,
  deriveRelationships,
  buildEvidenceMap,
  createCyberTwinDataModel,
  createModelFromReconstruction
} from './dataAdapter.js';

import {
  buildCytoscapeElements,
  getCytoscapeStylesheet
} from './graphElements.js';

import { RelationshipGraph } from './RelationshipGraph.jsx';
import { IncidentTimeline, formatEventType } from './IncidentTimeline.jsx';
import { InvestigationView } from './InvestigationView.jsx';
import { CyberTwin3DView } from './CyberTwin3DView.jsx';

import {
  calculateNextIndex,
  calculatePrevIndex,
  getPlaybackIntervalMs,
  formatReplayProgress,
  PLAYBACK_SPEEDS
} from './replayEngine.js';

import {
  isAttackEvent,
  getAttackPathEventIds,
  getAttackPathNodeIds,
  getAttackPathEdgeIds,
  identifyAttackPath
} from './attackPath.js';

import {
  ZONE_EXTERNAL,
  ZONE_CORP_LAN,
  ZONE_RESTRICTED_DC,
  getZoneDefinitions,
  classifyEntityZone,
  getEntity3DSpec,
  transformModelTo3DScene
} from './cyberTwin3D.js';

export {
  mockEvents,
  isValidBackendEvent,
  sortEventsChronologically,
  deriveEntities,
  deriveRelationships,
  buildEvidenceMap,
  createCyberTwinDataModel,
  createModelFromReconstruction,
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

export default {
  mockEvents,
  isValidBackendEvent,
  sortEventsChronologically,
  deriveEntities,
  deriveRelationships,
  buildEvidenceMap,
  createCyberTwinDataModel,
  createModelFromReconstruction,
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
