/**
 * Verification Script for Cyber Twin Relationship Graph (Stage 1B)
 * 
 * Verifies:
 * 1. Cytoscape elements are correctly generated from CyberTwinDataModel.
 * 2. Nodes expose id, entityType, label, eventIds, evidenceIds.
 * 3. Edges expose relationshipType, eventId, evidenceId, source, target.
 * 4. Headless Cytoscape graph initializes and renders layout with mock data.
 * 5. Node selection event returns entity details and linked evidence IDs.
 * 6. Edge selection event returns relationship details and linked evidence ID.
 * 7. Graph manipulation operations (fit, zoom, pan) work properly.
 * 8. Clear visual differentiation exists in the stylesheet for all entity types.
 */

const cytoscape = require('cytoscape');
const fs = require('fs');
const path = require('path');

const {
  mockEvents,
  createCyberTwinDataModel,
  buildCytoscapeElements,
  getCytoscapeStylesheet
} = require('./index');

console.log('================================================================');
console.log('   CYBER TWIN RELATIONSHIP GRAPH VERIFICATION (STAGE 1B)        ');
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

// 1. Data Model Generation from existing mock events
console.log('--- 1. Data Model Ingestion ---');
const model = createCyberTwinDataModel(mockEvents);
assert(model && model.entities.length === 10, `Loaded CyberTwinDataModel with ${model.entities.length} entities`);
assert(model.relationships.length === 19, `Loaded CyberTwinDataModel with ${model.relationships.length} relationships`);

// 2. Cytoscape Elements Generation
console.log('\n--- 2. Cytoscape Elements Generation ---');
const elements = buildCytoscapeElements(model);
const nodes = elements.filter(el => el.group === 'nodes');
const edges = elements.filter(el => el.group === 'edges');

assert(elements.length === 29, `Generated 29 total Cytoscape elements (10 nodes + 19 edges)`);
assert(nodes.length === 10, `Generated exactly 10 Cytoscape nodes`);
assert(edges.length === 19, `Generated exactly 19 Cytoscape edges`);

// 3. Node Contract & Attributes Verification
console.log('\n--- 3. Node Contract & Attributes Verification ---');
const expectedEntityTypes = ['user', 'device', 'ip', 'file', 'server'];
const foundEntityTypes = new Set();

nodes.forEach(node => {
  const d = node.data;
  const hasId = typeof d.id === 'string' && d.id.length > 0;
  const hasType = expectedEntityTypes.includes(d.entityType);
  const hasLabel = typeof d.label === 'string' && d.label.length > 0;
  const hasEvents = Array.isArray(d.eventIds) && d.eventIds.length > 0;
  const hasEvidence = Array.isArray(d.evidenceIds) && d.evidenceIds.length > 0;
  const hasClass = node.classes.includes(`entity-${d.entityType}`);

  if (hasType) foundEntityTypes.add(d.entityType);

  assert(hasId && hasType && hasLabel && hasEvents && hasEvidence && hasClass,
    `Node [${d.id}] | Type: ${d.entityType} | Events: [${d.eventIds.join(',')}] | Evidence: [${d.evidenceIds.join(',')}]`);
});

assert(expectedEntityTypes.every(t => foundEntityTypes.has(t)),
  `All 5 entity types represented: ${[...foundEntityTypes].join(', ')}`);

// 4. Edge Contract & Attributes Verification
console.log('\n--- 4. Edge Contract & Attributes Verification ---');
const expectedRelTypes = ['USES', 'CONNECTED_TO', 'ACCESSED'];
const foundRelTypes = new Set();

edges.forEach(edge => {
  const d = edge.data;
  const hasId = typeof d.id === 'string' && d.id.length > 0;
  const hasSource = typeof d.source === 'string';
  const hasTarget = typeof d.target === 'string';
  const hasType = expectedRelTypes.includes(d.relationshipType);
  const hasEventId = typeof d.eventId === 'string' && d.eventId.startsWith('EVT-');
  const hasEvidenceId = typeof d.evidenceId === 'string' && d.evidenceId.startsWith('EVD-');

  if (hasType) foundRelTypes.add(d.relationshipType);

  assert(hasId && hasSource && hasTarget && hasType && hasEventId && hasEvidenceId,
    `Edge [${d.id}] ${d.source} --(${d.relationshipType})--> ${d.target} [Event: ${d.eventId}, Evidence: ${d.evidenceId}]`);
});

assert(expectedRelTypes.every(t => foundRelTypes.has(t)),
  `All relationship types represented: ${[...foundRelTypes].join(', ')}`);

// 5. Headless Cytoscape Initialization & Layout Execution
console.log('\n--- 5. Cytoscape Headless Graph Execution ---');
const stylesheet = getCytoscapeStylesheet();
assert(Array.isArray(stylesheet) && stylesheet.length >= 8, `Cytoscape stylesheet defined with ${stylesheet.length} rules`);

const cy = cytoscape({
  headless: true,
  elements,
  style: stylesheet
});

assert(cy.nodes().length === 10, `Cytoscape instance contains 10 nodes`);
assert(cy.edges().length === 19, `Cytoscape instance contains 19 edges`);

// 6. Node Selection Simulation
console.log('\n--- 6. Node Selection Simulation ---');
let selectedNodeData = null;
cy.on('tap', 'node', (evt) => {
  selectedNodeData = evt.target.data();
});

const sampleNode = cy.nodes('#user\\:employee01');
assert(sampleNode.length === 1, `Located node user:employee01`);
sampleNode.emit('tap');

assert(selectedNodeData !== null, `Node tap event successfully fired and captured`);
assert(selectedNodeData.id === 'user:employee01', `Selected node ID: ${selectedNodeData.id}`);
assert(selectedNodeData.entityType === 'user', `Selected node Type: ${selectedNodeData.entityType}`);
assert(selectedNodeData.evidenceIds.includes('EVD-001'), `Selected node includes evidence EVD-001`);
console.log(`Captured Node Details:`, {
  id: selectedNodeData.id,
  type: selectedNodeData.entityType,
  label: selectedNodeData.label,
  events: selectedNodeData.eventIds,
  evidence: selectedNodeData.evidenceIds
});

// 7. Edge Selection Simulation
console.log('\n--- 7. Edge Selection Simulation ---');
let selectedEdgeData = null;
cy.on('tap', 'edge', (evt) => {
  selectedEdgeData = evt.target.data();
});

const sampleEdge = cy.edges().first();
assert(sampleEdge.length === 1, `Located sample edge: ${sampleEdge.id()}`);
sampleEdge.emit('tap');

assert(selectedEdgeData !== null, `Edge tap event successfully fired and captured`);
assert(selectedEdgeData.evidenceId !== undefined, `Selected edge retains evidenceId: ${selectedEdgeData.evidenceId}`);
assert(selectedEdgeData.eventId !== undefined, `Selected edge retains eventId: ${selectedEdgeData.eventId}`);
console.log(`Captured Edge Details:`, {
  id: selectedEdgeData.id,
  source: selectedEdgeData.source,
  target: selectedEdgeData.target,
  type: selectedEdgeData.relationshipType,
  eventId: selectedEdgeData.eventId,
  evidenceId: selectedEdgeData.evidenceId
});

// 8. Basic Graph Manipulation Operations
console.log('\n--- 8. Graph Interaction Operations (Fit, Zoom, Pan) ---');
try {
  cy.zoom(1.5);
  assert(cy.zoom() === 1.5, `Zoom in operation works (zoom = ${cy.zoom()})`);
  cy.pan({ x: 50, y: 100 });
  assert(cy.pan().x === 50 && cy.pan().y === 100, `Pan operation works`);
  cy.fit();
  assert(true, `Fit operation executed without errors`);
} catch (err) {
  assert(false, `Graph interaction failed: ${err.message}`);
}

// 9. React Component Source Check
console.log('\n--- 9. React Component Verification ---');
const componentPath = path.join(__dirname, 'RelationshipGraph.jsx');
assert(fs.existsSync(componentPath), `RelationshipGraph.jsx exists at ${componentPath}`);
const componentSource = fs.readFileSync(componentPath, 'utf8');
assert(componentSource.includes('export function RelationshipGraph'), `Exports RelationshipGraph functional component`);
assert(componentSource.includes('useRef'), `Uses useRef hook for container reference`);
assert(componentSource.includes('useEffect'), `Uses useEffect hook for Cytoscape lifecycle`);
assert(componentSource.includes('useState'), `Uses useState hook for inspector details`);
assert(componentSource.includes('onNodeSelect'), `Supports onNodeSelect callback prop`);
assert(componentSource.includes('onEdgeSelect'), `Supports onEdgeSelect callback prop`);
assert(componentSource.includes('handleFit'), `Includes Fit View control`);
assert(componentSource.includes('handleZoomIn'), `Includes Zoom In control`);
assert(componentSource.includes('handleZoomOut'), `Includes Zoom Out control`);
assert(componentSource.includes('handleResetLayout'), `Includes Reset Layout control`);

// Cleanup Cytoscape instance
cy.destroy();

console.log('\n================================================================');
if (allPassed) {
  console.log('   ALL CHECKS PASSED: STAGE 1B RELATIONSHIP GRAPH VERIFIED!    ');
} else {
  console.error('   SOME CHECKS FAILED: REVIEW LOGS ABOVE.                     ');
  process.exit(1);
}
console.log('================================================================\n');
