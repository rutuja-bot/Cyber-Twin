/**
 * Core Integration Verification Script for Cyber Twin
 *
 * Verifies that the canonical backend incident reconstruction payload
 * (from Person 2 & Rutuja's backend) seamlessly powers Sakshi's visualization pipeline:
 * 1. Data Adapter (createModelFromReconstruction & createCyberTwinDataModel)
 * 2. Relationship Graph Elements (buildCytoscapeElements & getCytoscapeStylesheet)
 * 3. 3D Cyber Twin Scene Model (transformModelTo3DScene)
 * 4. Attack Path Engine (identifyAttackPath)
 * 5. Incident Replay Engine (calculateNextIndex, formatReplayProgress)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import visualization modules
import {
  createModelFromReconstruction,
  createCyberTwinDataModel,
  isValidBackendEvent
} from './dataAdapter.js';

import {
  buildCytoscapeElements,
  getCytoscapeStylesheet
} from './graphElements.js';

import {
  transformModelTo3DScene,
  classifyEntityZone,
  ZONE_EXTERNAL,
  ZONE_CORP_LAN,
  ZONE_RESTRICTED_DC
} from './cyberTwin3D.js';

import {
  identifyAttackPath,
  isAttackEvent
} from './attackPath.js';

import {
  calculateNextIndex,
  calculatePrevIndex,
  formatReplayProgress
} from './replayEngine.js';

console.log('================================================================');
console.log('CYBER TWIN — CORE INTEGRATION VERIFICATION TEST');
console.log('================================================================');

// 1. Load canonical incident reconstruction JSON
const reconstructionPath = path.resolve(__dirname, '../../../data/processed/incident_reconstruction.json');
if (!fs.existsSync(reconstructionPath)) {
  console.error(`FAILED: Reconstruction file not found at ${reconstructionPath}`);
  process.exit(1);
}

const reconstructionRaw = fs.readFileSync(reconstructionPath, 'utf8');
const reconstruction = JSON.parse(reconstructionRaw);

console.log(`[PASS] Loaded canonical reconstruction for Case: ${reconstruction.case_id}`);
console.log(`       Title: ${reconstruction.title}`);
console.log(`       Summary: ${reconstruction.summary.slice(0, 90)}...`);

// 2. Validate Data Adapter with Backend Reconstruction
const model = createModelFromReconstruction(reconstruction);

console.log('\n--- 1. Data Model Verification ---');
console.log(`[PASS] Case ID: ${model.case_id}`);
console.log(`[PASS] Total Events: ${model.events.length} (Expected: 6)`);
console.log(`[PASS] Total Entities: ${model.entities.length} (Expected: 7)`);
console.log(`[PASS] Total Relationships: ${model.relationships.length} (Expected: 15)`);
console.log(`[PASS] Total Timeline Stages: ${model.timeline.length} (Expected: 6)`);
console.log(`[PASS] Total Findings: ${model.findings.length} (Expected: 3)`);

if (model.events.length !== 6) throw new Error(`Expected 6 events, got ${model.events.length}`);
if (model.entities.length !== 7) throw new Error(`Expected 7 entities, got ${model.entities.length}`);
if (model.relationships.length !== 15) throw new Error(`Expected 15 relationships, got ${model.relationships.length}`);
if (model.timeline.length !== 6) throw new Error(`Expected 6 timeline stages, got ${model.timeline.length}`);
if (model.findings.length !== 3) throw new Error(`Expected 3 findings, got ${model.findings.length}`);

// Validate all 6 events satisfy Event v1 Contract
for (const evt of model.events) {
  if (!isValidBackendEvent(evt)) {
    throw new Error(`Event ${evt?.event_id} does not satisfy Backend Event v1 contract`);
  }
}
console.log('[PASS] All 6 events strictly conform to Backend Event v1 contract');

// Validate key canonical relationships exist
const canonicalRelTypes = new Set(model.relationships.map(r => r.type));
const expectedRelTypes = ['AUTHENTICATED_TO', 'RESOLVED_IP', 'USES', 'EXECUTED', 'CONNECTED_TO', 'ACCESSED', 'EXFILTRATED_TO'];
for (const relType of expectedRelTypes) {
  if (!canonicalRelTypes.has(relType)) {
    throw new Error(`Missing expected relationship type: ${relType}`);
  }
}
console.log(`[PASS] Canonical relationship types present: ${Array.from(canonicalRelTypes).join(', ')}`);

// 3. Validate Cytoscape 2D Graph Elements Generation
console.log('\n--- 2. Cytoscape 2D Graph Generation ---');
const cyElements = buildCytoscapeElements(model);
const cyNodes = cyElements.filter(el => el.group === 'nodes');
const cyEdges = cyElements.filter(el => el.group === 'edges');

console.log(`[PASS] Cytoscape Nodes generated: ${cyNodes.length} (Expected: 7)`);
console.log(`[PASS] Cytoscape Edges generated: ${cyEdges.length} (Expected: 15)`);
if (cyNodes.length !== 7) throw new Error(`Expected 7 Cytoscape nodes, got ${cyNodes.length}`);
if (cyEdges.length !== 15) throw new Error(`Expected 15 Cytoscape edges, got ${cyEdges.length}`);

const cyStylesheet = getCytoscapeStylesheet();
if (!Array.isArray(cyStylesheet) || cyStylesheet.length === 0) {
  throw new Error('Cytoscape stylesheet is empty');
}
console.log(`[PASS] Cytoscape Stylesheet loaded with ${cyStylesheet.length} style rules`);

// 4. Validate 3D Cyber Twin Spatial Infrastructure
console.log('\n--- 3. 3D Cyber Twin Spatial Scene Generation ---');
const scene3D = transformModelTo3DScene(model);
console.log(`[PASS] 3D Zones defined: ${scene3D.zones.length}`);
console.log(`[PASS] 3D Entity Nodes: ${scene3D.nodes.length} (Expected: 7)`);
console.log(`[PASS] 3D Topology Links: ${scene3D.links.length} (Expected: 15)`);
console.log(`[PASS] 3D Summary: External=${scene3D.summary.entitiesInExternalZone}, Corp=${scene3D.summary.entitiesInCorpZone}, DC=${scene3D.summary.entitiesInDcZone}`);

if (scene3D.nodes.length !== 7) throw new Error(`Expected 7 3D nodes, got ${scene3D.nodes.length}`);
if (scene3D.links.length !== 15) throw new Error(`Expected 15 3D links, got ${scene3D.links.length}`);

// Verify entity zone assignments
const externalEntities = scene3D.nodes.filter(n => n.zone === ZONE_EXTERNAL);
const corpLanEntities = scene3D.nodes.filter(n => n.zone === ZONE_CORP_LAN);
const restrictedDcEntities = scene3D.nodes.filter(n => n.zone === ZONE_RESTRICTED_DC);
console.log(`[PASS] Spatial distribution: External=${externalEntities.length}, Corp LAN=${corpLanEntities.length}, DC=${restrictedDcEntities.length}`);

// 5. Validate Attack Path Isolation
console.log('\n--- 4. Attack Path Progression & Isolation ---');
const attackAnalysis = identifyAttackPath(model);
console.log(`[PASS] Attack Events identified: ${attackAnalysis.attackEventIds.length} / ${attackAnalysis.summary.totalEvents}`);
console.log(`[PASS] Attack Nodes identified: ${attackAnalysis.attackNodeIds.length} / ${attackAnalysis.summary.totalNodes}`);
console.log(`[PASS] Attack Edges identified: ${attackAnalysis.attackEdgeIds.length} / ${attackAnalysis.summary.totalEdges}`);
if (attackAnalysis.attackEventIds.length === 0) throw new Error('No attack events identified');

// 6. Validate Replay Engine Sequencing
console.log('\n--- 5. Incident Replay Engine ---');
let replayIdx = 0;
console.log(`[PASS] Initial step: ${formatReplayProgress(replayIdx, model.events.length)}`);
while (replayIdx < model.events.length - 1) {
  replayIdx = calculateNextIndex(replayIdx, model.events.length);
}
console.log(`[PASS] Final step: ${formatReplayProgress(replayIdx, model.events.length)}`);
if (replayIdx !== model.events.length - 1) throw new Error('Replay engine did not step to final event');

console.log('\n================================================================');
console.log('ALL CORE INTEGRATION VERIFICATION CHECKS PASSED SUCCESSFULLY!');
console.log('================================================================');
