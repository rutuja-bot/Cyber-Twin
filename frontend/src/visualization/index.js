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
  RelationshipGraph
};
