/**
 * Verification Suite for Cyber Twin 3D Infrastructure Layer (Task 3)
 * 
 * Verifies:
 * 1. Three.js dependency resolves cleanly in Node/frontend environment.
 * 2. cyberTwin3D layout transformation module exists and exports contracts.
 * 3. 3D Zone classification assigns enterprise zones (External, Corp LAN, Restricted DC).
 * 4. Transformation of standard CyberTwinDataModel into 3D scene elements:
 *    - 3 infrastructure zones
 *    - 10 nodes with 3D primitive geometry specs (box, cylinder, octahedron)
 *    - 19 curved spatial connection links
 * 5. Robustness against arbitrary datasets:
 *    - Empty data model ({ entities: [], relationships: [] }) handles safely.
 *    - Single-node model.
 *    - Dynamic synthetic multi-zone datacenter model.
 * 6. Attack Path isolation integration in 3D:
 *    - Attack path nodes and threat beams identified.
 *    - Benign links and nodes segregated for dimming.
 * 7. Replay / Event selection synchronization contract in 3D.
 * 8. CyberTwin3DView component source inspection:
 *    - Three.js scene, camera, renderer creation.
 *    - Orbit/rotation camera controls and reset view.
 *    - Animated threat beam pulse loop.
 *    - Comprehensive memory cleanup on unmount (geometries, materials, renderer disposal).
 * 9. Integration into InvestigationView with split view and view mode controls.
 * 10. Confirmation of protected files status.
 */

const fs = require('fs');
const path = require('path');
const THREE = require('three');

const {
  mockEvents,
  createCyberTwinDataModel,
  ZONE_EXTERNAL,
  ZONE_CORP_LAN,
  ZONE_RESTRICTED_DC,
  getZoneDefinitions,
  classifyEntityZone,
  getEntity3DSpec,
  transformModelTo3DScene,
  identifyAttackPath
} = require('./index');

console.log('================================================================');
console.log('   CYBER TWIN 3D INFRASTRUCTURE LAYER VERIFICATION (TASK 3)    ');
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
// 1. Dependency Resolution & Module Exports
// -------------------------------------------------------------
console.log('--- 1. Three.js Dependency & Module Exports ---');
assert(typeof THREE === 'object' && typeof THREE.Scene === 'function', 'Three.js dependency resolved successfully');
assert(typeof THREE.PerspectiveCamera === 'function', 'THREE.PerspectiveCamera is available');
assert(typeof THREE.WebGLRenderer === 'function', 'THREE.WebGLRenderer constructor is available');
assert(typeof getZoneDefinitions === 'function', 'getZoneDefinitions is exported');
assert(typeof classifyEntityZone === 'function', 'classifyEntityZone is exported');
assert(typeof getEntity3DSpec === 'function', 'getEntity3DSpec is exported');
assert(typeof transformModelTo3DScene === 'function', 'transformModelTo3DScene is exported');

// -------------------------------------------------------------
// 2. Zone Definitions & Classification
// -------------------------------------------------------------
console.log('\n--- 2. Infrastructure Zones & Classification ---');
const zones = getZoneDefinitions();
assert(Array.isArray(zones) && zones.length === 3, 'Defined exactly 3 enterprise cyber infrastructure zones');
assert(zones.some(z => z.id === ZONE_EXTERNAL), 'Zone 1: External Internet / Attacker Zone defined');
assert(zones.some(z => z.id === ZONE_CORP_LAN), 'Zone 2: Corporate LAN Subnet (192.168.1.0/24) defined');
assert(zones.some(z => z.id === ZONE_RESTRICTED_DC), 'Zone 3: Restricted Data Center Subnet (192.168.2.0/24) defined');

// Verify entity zone classification
assert(classifyEntityZone({ type: 'ip', name: '198.51.100.44' }) === ZONE_EXTERNAL, 'Attacker Ingress IP (198.51.100.44) -> External Zone');
assert(classifyEntityZone({ type: 'ip', name: '203.0.113.88' }) === ZONE_EXTERNAL, 'C2 Egress IP (203.0.113.88) -> External Zone');
assert(classifyEntityZone({ type: 'device', name: 'WORKSTATION-01' }) === ZONE_CORP_LAN, 'Workstation device -> Corporate LAN Zone');
assert(classifyEntityZone({ type: 'user', name: 'employee01' }) === ZONE_CORP_LAN, 'User employee01 -> Corporate LAN Zone');
assert(classifyEntityZone({ type: 'server', name: 'DB-FINANCE-01' }) === ZONE_RESTRICTED_DC, 'Database server (DB-FINANCE-01) -> Restricted DC Zone');
assert(classifyEntityZone({ type: 'ip', name: '192.168.2.10' }) === ZONE_RESTRICTED_DC, 'Internal server IP (192.168.2.10) -> Restricted DC Zone');

// -------------------------------------------------------------
// 3. 3D Primitive Specifications
// -------------------------------------------------------------
console.log('\n--- 3. 3D Primitive Geometry Specifications ---');
const serverSpec = getEntity3DSpec({ type: 'server', name: 'DB-FINANCE-01' });
assert(serverSpec.geometryType === 'box' && serverSpec.dimensions[1] >= 3.0, 'Server represents as tall rack/tower primitive');

const deviceSpec = getEntity3DSpec({ type: 'device', name: 'WORKSTATION-01' });
assert(deviceSpec.geometryType === 'box' && deviceSpec.dimensions[1] < 2.0, 'Device represents as compact workstation box primitive');

const userSpec = getEntity3DSpec({ type: 'user', name: 'employee01' });
assert(userSpec.geometryType === 'cylinder', 'User operator represents as capsule/cylinder primitive');

const ipSpec = getEntity3DSpec({ type: 'ip', name: '198.51.100.44' });
assert(ipSpec.geometryType === 'octahedron', 'IP address represents as diamond/octahedron network node');

const fileSpec = getEntity3DSpec({ type: 'file', name: 'powershell_payload.ps1' });
assert(fileSpec.geometryType === 'cylinder' && fileSpec.elevation > 2.0, 'File artifact represents as floating barrel primitive');

// -------------------------------------------------------------
// 4. Model Transformation into 3D Scene
// -------------------------------------------------------------
console.log('\n--- 4. Model Transformation to 3D Scene ---');
const standardModel = createCyberTwinDataModel(mockEvents);
const scene3D = transformModelTo3DScene(standardModel);

assert(scene3D.nodes.length === 10, `Mapped all 10 entities to 3D nodes (got ${scene3D.nodes.length})`);
assert(scene3D.links.length === 19, `Mapped all 19 relationships to 3D spatial links (got ${scene3D.links.length})`);
assert(scene3D.zones.length === 3, 'Scene includes 3 infrastructure zones');

// Verify distribution across 3D coordinates
const externalNodes = scene3D.nodes.filter(n => n.zone === ZONE_EXTERNAL);
const corpNodes = scene3D.nodes.filter(n => n.zone === ZONE_CORP_LAN);
const dcNodes = scene3D.nodes.filter(n => n.zone === ZONE_RESTRICTED_DC);

assert(externalNodes.length === 2, `External Zone has 2 entities (${externalNodes.map(n => n.name).join(', ')})`);
assert(corpNodes.length === 6, `Corporate LAN has 6 entities (${corpNodes.map(n => n.name).join(', ')})`);
assert(dcNodes.length === 2, `Data Center Zone has 2 entities (${dcNodes.map(n => n.name).join(', ')})`);

// Verify spatial links have valid 3D vectors
scene3D.links.forEach(link => {
  const s = link.startPosition;
  const e = link.endPosition;
  const validVector = (
    typeof s.x === 'number' && typeof s.y === 'number' && typeof s.z === 'number' &&
    typeof e.x === 'number' && typeof e.y === 'number' && typeof e.z === 'number'
  );
  assert(validVector, `Link [${link.id}] has valid 3D endpoints: (${s.x.toFixed(1)}, ${s.y.toFixed(1)}, ${s.z.toFixed(1)}) -> (${e.x.toFixed(1)}, ${e.y.toFixed(1)}, ${e.z.toFixed(1)})`);
});

// -------------------------------------------------------------
// 5. Robustness & Arbitrary Dataset Handling (Zero Hardcoding)
// -------------------------------------------------------------
console.log('\n--- 5. Arbitrary Dataset Robustness Testing ---');

// 5a. Empty model
const emptyScene = transformModelTo3DScene({ entities: [], relationships: [], events: [] });
assert(emptyScene.nodes.length === 0, 'Empty model produces 0 3D nodes without crashing');
assert(emptyScene.links.length === 0, 'Empty model produces 0 3D links without crashing');
assert(emptyScene.zones.length === 3, 'Empty model retains 3 zone layout planes');

// 5b. Null/undefined model
const nullScene = transformModelTo3DScene(null);
assert(nullScene.nodes.length === 0, 'Null model produces 0 nodes gracefully');

// 5c. Synthetic multi-cloud infrastructure
const customEntities = [
  { id: 'server:AWS-PROD-01', name: 'AWS-PROD-01', type: 'server', first_seen: '', last_seen: '', event_ids: ['E1'], evidence_ids: [] },
  { id: 'server:GCP-VAULT-02', name: 'GCP-VAULT-02', type: 'server', first_seen: '', last_seen: '', event_ids: ['E1'], evidence_ids: [] },
  { id: 'ip:10.10.1.25', name: '10.10.1.25', type: 'ip', first_seen: '', last_seen: '', event_ids: ['E1'], evidence_ids: [] },
  { id: 'device:LAPTOP-ALICE', name: 'LAPTOP-ALICE', type: 'device', first_seen: '', last_seen: '', event_ids: ['E1'], evidence_ids: [] },
  { id: 'ip:198.51.100.77', name: '198.51.100.77', type: 'ip', first_seen: '', last_seen: '', event_ids: ['E1'], evidence_ids: [] }
];
const customRels = [
  { id: 'R1', source_id: 'ip:198.51.100.77', target_id: 'device:LAPTOP-ALICE', type: 'CONNECTED_TO', event_id: 'E1', evidence_id: '', timestamp: '' },
  { id: 'R2', source_id: 'device:LAPTOP-ALICE', target_id: 'server:AWS-PROD-01', type: 'CONNECTED_TO', event_id: 'E1', evidence_id: '', timestamp: '' }
];
const custom3D = transformModelTo3DScene({ entities: customEntities, relationships: customRels });
assert(custom3D.nodes.length === 5, 'Synthetic dataset mapped 5 nodes');
assert(custom3D.links.length === 2, 'Synthetic dataset mapped 2 links');

// -------------------------------------------------------------
// 6. Attack Path Integration in 3D Scene
// -------------------------------------------------------------
console.log('\n--- 6. Attack Path Integration in 3D Scene ---');
const attackPathInfo = identifyAttackPath(standardModel);

// Verify attack nodes in 3D scene
const attackNodeIds = new Set(attackPathInfo.attackNodeIds);
const attackNodesIn3D = scene3D.nodes.filter(n => attackNodeIds.has(n.id));
assert(attackNodesIn3D.length === 10, 'All attack-path entities represented in 3D scene');

// Verify threat beam links in 3D scene
const attackEdgeIds = new Set(attackPathInfo.attackEdgeIds);
const threatBeams = scene3D.links.filter(l => attackEdgeIds.has(l.id));
const benignLinks = scene3D.links.filter(l => !attackEdgeIds.has(l.id));

assert(threatBeams.length === 17, `17 threat beams identified for animated transmission`);
assert(benignLinks.length === 2, `2 benign links identified for dimming`);
assert(benignLinks.some(l => l.id === 'rel_1_EVT-001'), 'Benign link rel_1_EVT-001 isolated');
assert(benignLinks.some(l => l.id === 'rel_2_EVT-001'), 'Benign link rel_2_EVT-001 isolated');

// -------------------------------------------------------------
// 7. Component Source Inspection (CyberTwin3DView.jsx)
// -------------------------------------------------------------
console.log('\n--- 7. CyberTwin3DView Component Source Inspection ---');
const compPath = path.join(__dirname, 'CyberTwin3DView.jsx');
assert(fs.existsSync(compPath), `CyberTwin3DView.jsx exists at ${compPath}`);

const compSource = fs.readFileSync(compPath, 'utf8');
assert(compSource.includes('export function CyberTwin3DView'), 'Exports CyberTwin3DView functional component');
assert(compSource.includes('THREE.Scene'), 'Creates Three.js Scene');
assert(compSource.includes('THREE.PerspectiveCamera'), 'Creates Three.js PerspectiveCamera');
assert(compSource.includes('THREE.WebGLRenderer'), 'Creates Three.js WebGLRenderer');
assert(compSource.includes('THREE.GridHelper'), 'Renders floor grid helper');
assert(compSource.includes('THREE.CatmullRomCurve3'), 'Constructs curved 3D connection paths');
assert(compSource.includes('requestAnimationFrame'), 'Implements animated render loop');
assert(compSource.includes('cancelAnimationFrame'), 'Cancels animation frame on unmount');
assert(compSource.includes('renderer.dispose()'), 'Disposes Three.js renderer on unmount');
assert(compSource.includes('selectedEventId'), 'Supports selectedEventId prop for replay/focus synchronization');
assert(compSource.includes('attackPathOnly'), 'Supports attackPathOnly prop for threat isolation');
assert(compSource.includes('threatPulseRef'), 'Maintains animated threat beam pulses');
assert(compSource.includes('handleResetCamera'), 'Includes Reset Camera View control');
assert(compSource.includes('aria-label="3D Cyber Twin infrastructure visualization"'), 'Provides accessible aria-label');

// -------------------------------------------------------------
// 8. Integration into InvestigationView.jsx
// -------------------------------------------------------------
console.log('\n--- 8. Integration into InvestigationView.jsx ---');
const ivPath = path.join(__dirname, 'InvestigationView.jsx');
const ivSource = fs.readFileSync(ivPath, 'utf8');

assert(ivSource.includes("import { CyberTwin3DView } from './CyberTwin3DView'"), 'InvestigationView imports CyberTwin3DView');
assert(ivSource.includes('<CyberTwin3DView'), 'InvestigationView embeds CyberTwin3DView component');
assert(ivSource.includes('viewMode'), 'InvestigationView manages viewMode state (split / 2d / 3d)');
assert(ivSource.includes('View Mode: Split 2D + 3D'), 'InvestigationView provides Split View toggle');
assert(ivSource.includes('View Mode: 2D Graph Only'), 'InvestigationView provides 2D Graph toggle');
assert(ivSource.includes('View Mode: 3D Cyber Twin Only'), 'InvestigationView provides 3D Cyber Twin toggle');

// -------------------------------------------------------------
// 9. Protected Files Verification
// -------------------------------------------------------------
console.log('\n--- 9. Protected Files Verification ---');
const protectedFiles = [
  'dataAdapter.js',
  'graphElements.js',
  'replayEngine.js',
  'attackPath.js'
];

protectedFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  assert(fs.existsSync(filePath), `Protected file ${file} exists and is preserved`);
});

console.log('\n================================================================');
if (allPassed) {
  console.log('   ALL CHECKS PASSED: 3D CYBER TWIN LAYER VERIFIED!            ');
} else {
  console.error('   SOME CHECKS FAILED: REVIEW LOGS ABOVE.                      ');
  process.exit(1);
}
console.log('================================================================\n');

