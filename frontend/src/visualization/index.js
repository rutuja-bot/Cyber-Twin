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

module.exports = {
  mockEvents,
  isValidBackendEvent,
  sortEventsChronologically,
  deriveEntities,
  deriveRelationships,
  buildEvidenceMap,
  createCyberTwinDataModel
};

