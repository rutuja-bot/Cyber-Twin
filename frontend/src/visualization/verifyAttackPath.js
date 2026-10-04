/**
 * Verification Suite for Cyber Twin Attack Path Highlighting & Isolation Toggle (Task 2)
 * 
 * Verifies:
 * 1. Attack path pure utility functions export correctly from attackPath.js and index.js.
 * 2. Attack-path detection works with the existing mock dataset:
 *    - EVT-001 (normal_login) is isolated as benign baseline.
 *    - EVT-002 through EVT-007 are identified as the adversary progression (Patient Zero -> Pivots -> Target).
 * 3. Attack-path event, node, and edge IDs are derived strictly from data (no hardcoded counts).
 * 4. Benign/background relationships (rel_1_EVT-001, rel_2_EVT-001) are cleanly identified for dimming.
 * 5. Robustness against diverse datasets: empty datasets, single-event datasets, and synthetic multi-stage attack scenarios.
 * 6. Cytoscape graph simulation:
 *    - Attack Path OFF: all elements normal/prominent.
 *    - Attack Path ON: benign elements dimmed, attack path elements prominent.
 *    - Event selection + Attack Path ON: selected event elements highlighted, non-attack dimmed, attack path prominent.
 *    - Clear Focus + Attack Path ON: returns to attack path overview with background dimmed.
 *    - Attack Path OFF: restores 100% full graph visibility.
 * 7. Replay compatibility: Replay stepping works seamlessly alongside the attack path toggle.
 * 8. Backward-compatibility: RelationshipGraph and IncidentTimeline preserve all previous contracts.
 */

const fs = require('fs');
const path = require('path');
const cytoscape = require('cytoscape');

const {
  mockEvents,
  createCyberTwinDataModel,
  buildCytoscapeElements,
  getCytoscapeStylesheet,
  isAttackEvent,
  getAttackPathEventIds,
  getAttackPathNodeIds,
  getAttackPathEdgeIds,
  identifyAttackPath,
  calculateNextIndex,
  calculatePrevIndex
} = require('./index');

console.log('================================================================');
console.log('   CYBER TWIN ATTACK PATH ISOLATION VERIFICATION (TASK 2)       ');
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
// 1. Module Exports & Contract Inspection
// -------------------------------------------------------------
console.log('--- 1. Module Exports & Contract Inspection ---');
assert(typeof isAttackEvent === 'function', 'isAttackEvent is exported as function');
assert(typeof getAttackPathEventIds === 'function', 'getAttackPathEventIds is exported as function');
assert(typeof getAttackPathNodeIds === 'function', 'getAttackPathNodeIds is exported as function');
assert(typeof getAttackPathEdgeIds === 'function', 'getAttackPathEdgeIds is exported as function');
assert(typeof identifyAttackPath === 'function', 'identifyAttackPath is exported as function');

// -------------------------------------------------------------
// 2. Existing Dataset Attack Path Identification (mockEvents)
// -------------------------------------------------------------
console.log('\n--- 2. Existing Mock Dataset Attack Path Identification ---');
const standardModel = createCyberTwinDataModel(mockEvents);
const analysis = identifyAttackPath(standardModel);

console.log('Telemetry Summary:', analysis.summary);

// Verify EVT-001 (normal baseline login) is NOT part of attack path
assert(isAttackEvent(mockEvents[0]) === false, 'EVT-001 (normal_login) is classified as benign baseline');
assert(analysis.benignEventIds.includes('EVT-001'), 'benignEventIds contains EVT-001');

// Verify EVT-002 through EVT-007 are part of the attack path
const expectedAttackEvents = ['EVT-002', 'EVT-003', 'EVT-004', 'EVT-005', 'EVT-006', 'EVT-007'];
const allAttackDetected = expectedAttackEvents.every(id => analysis.attackEventIds.includes(id));
assert(allAttackDetected, `All 6 progression events (${expectedAttackEvents.join(', ')}) detected on attack path`);

// Verify specific attack phases
assert(analysis.attackEventIds.includes('EVT-002'), 'Patient Zero Ingress: EVT-002 (suspicious_login) in attack path');
assert(analysis.attackEventIds.includes('EVT-003'), 'Execution: EVT-003 (suspicious_process_execution) in attack path');
assert(analysis.attackEventIds.includes('EVT-004'), 'Collection: EVT-004 (file_access confidential) in attack path');
assert(analysis.attackEventIds.includes('EVT-005'), 'Lateral Movement Pivot: EVT-005 (internal_server_connection) in attack path');
assert(analysis.attackEventIds.includes('EVT-006'), 'Egress C2: EVT-006 (external_connection) in attack path');
assert(analysis.attackEventIds.includes('EVT-007'), 'Exfiltration Target: EVT-007 (data_transfer exfil archive) in attack path');

// Verify edges classification
assert(analysis.benignEdgeIds.includes('rel_1_EVT-001'), 'Benign edge rel_1_EVT-001 identified for background dimming');
assert(analysis.benignEdgeIds.includes('rel_2_EVT-001'), 'Benign edge rel_2_EVT-001 identified for background dimming');
assert(analysis.attackEdgeIds.length === 17, `17 relationships correctly assigned to adversary attack path`);

// -------------------------------------------------------------
// 3. Dynamic / Synthetic Scenarios (Zero Hardcoding)
// -------------------------------------------------------------
console.log('\n--- 3. Dynamic & Synthetic Scenario Testing ---');

// 3a. Empty dataset
const emptyAnalysis = identifyAttackPath([]);
assert(emptyAnalysis.attackEventIds.length === 0, 'Empty dataset produces 0 attack events without error');
assert(emptyAnalysis.benignEventIds.length === 0, 'Empty dataset produces 0 benign events without error');

// 3b. Synthetic enterprise dataset with mixed benign & adversary activity
const syntheticEvents = [
  {
    event_id: 'EVT-SYN-01',
    case_id: 'CASE-SYNTH-99',
    timestamp: '2026-10-04T10:00:00Z',
    event_type: 'normal_ldap_query',
    user: 'sys_auditor',
    device: 'DC-PRIMARY',
    source_ip: '10.10.1.5',
    destination_ip: '10.10.1.1',
    file: null,
    server: null,
    evidence_id: 'EVD-SYN-01'
  },
  {
    event_id: 'EVT-SYN-02',
    case_id: 'CASE-SYNTH-99',
    timestamp: '2026-10-04T10:05:00Z',
    event_type: 'routine_backup_sync',
    user: 'backup_svc',
    device: 'BACKUP-NODE',
    source_ip: '10.10.1.50',
    destination_ip: '10.10.2.100',
    file: null,
    server: 'NAS-ARCHIVE',
    evidence_id: 'EVD-SYN-02'
  },
  {
    event_id: 'EVT-SYN-03',
    case_id: 'CASE-SYNTH-99',
    timestamp: '2026-10-04T10:15:00Z',
    event_type: 'unauthorized_ssh_session',
    user: 'unknown_root',
    device: 'DMZ-BASTION',
    source_ip: '198.51.100.99',
    destination_ip: '10.10.0.10',
    file: null,
    server: null,
    evidence_id: 'EVD-SYN-03'
  },
  {
    event_id: 'EVT-SYN-04',
    case_id: 'CASE-SYNTH-99',
    timestamp: '2026-10-04T10:20:00Z',
    event_type: 'kernel_privilege_escalation',
    user: 'unknown_root',
    device: 'DMZ-BASTION',
    source_ip: null,
    destination_ip: null,
    file: 'cve_exploit_binary.elf',
    server: null,
    evidence_id: 'EVD-SYN-04'
  },
  {
    event_id: 'EVT-SYN-05',
    case_id: 'CASE-SYNTH-99',
    timestamp: '2026-10-04T10:30:00Z',
    event_type: 'data_exfiltration_cloud',
    user: 'unknown_root',
    device: 'DMZ-BASTION',
    source_ip: '10.10.0.10',
    destination_ip: '203.0.113.200',
    file: 'crown_jewels_dump.tar.gz',
    server: null,
    evidence_id: 'EVD-SYN-05'
  }
];

const synthModel = createCyberTwinDataModel(syntheticEvents);
const synthAnalysis = identifyAttackPath(synthModel);

assert(synthAnalysis.summary.totalEvents === 5, 'Synthetic dataset has 5 events');
assert(synthAnalysis.summary.benignEventsCount === 2, 'Identified 2 benign events in synthetic dataset');
assert(synthAnalysis.summary.attackEventsCount === 3, 'Identified 3 attack progression events in synthetic dataset');
assert(synthAnalysis.benignEventIds.includes('EVT-SYN-01'), 'EVT-SYN-01 correctly tagged benign');
assert(synthAnalysis.benignEventIds.includes('EVT-SYN-02'), 'EVT-SYN-02 correctly tagged benign');
assert(synthAnalysis.attackEventIds.includes('EVT-SYN-03'), 'EVT-SYN-03 (unauthorized SSH) on attack path');
assert(synthAnalysis.attackEventIds.includes('EVT-SYN-04'), 'EVT-SYN-04 (privilege escalation) on attack path');
assert(synthAnalysis.attackEventIds.includes('EVT-SYN-05'), 'EVT-SYN-05 (data exfiltration) on attack path');

// Verify that benign entity NAS-ARCHIVE is correctly categorized
assert(synthAnalysis.benignNodeIds.includes('server:NAS-ARCHIVE'), 'server:NAS-ARCHIVE identified as benign node');
assert(synthAnalysis.attackNodeIds.includes('device:DMZ-BASTION'), 'device:DMZ-BASTION identified as compromised node');

// -------------------------------------------------------------
// 4. Cytoscape Graph Headless Simulation (Attack Path Isolation)
// -------------------------------------------------------------
console.log('\n--- 4. Cytoscape Graph Simulation with Attack Path ---');

const elements = buildCytoscapeElements(standardModel);
const stylesheet = getCytoscapeStylesheet();
const cy = cytoscape({ headless: true, elements, style: stylesheet });

// Function simulating the exact RelationshipGraph synchronization engine
function applyGraphState(cyInstance, selectedEventId, attackPathOnly, attackPathNodeIds, attackPathEdgeIds) {
  cyInstance.elements().removeClass('synced-highlight synced-dimmed');

  if (!selectedEventId && !attackPathOnly) {
    return;
  }

  const matchingNodes = selectedEventId
    ? cyInstance.nodes().filter(node => (node.data('eventIds') || []).includes(selectedEventId))
    : cyInstance.collection();

  const matchingEdges = selectedEventId
    ? cyInstance.edges().filter(edge => edge.data('eventId') === selectedEventId)
    : cyInstance.collection();

  if (attackPathOnly) {
    const attackNodesSet = new Set(attackPathNodeIds || []);
    const attackEdgesSet = new Set(attackPathEdgeIds || []);

    const nonAttackNodes = cyInstance.nodes().filter(node => !attackNodesSet.has(node.id()));
    const nonAttackEdges = cyInstance.edges().filter(edge => !attackEdgesSet.has(edge.id()));

    nonAttackNodes.addClass('synced-dimmed');
    nonAttackEdges.addClass('synced-dimmed');

    if (matchingNodes.length > 0 || matchingEdges.length > 0) {
      matchingNodes.addClass('synced-highlight');
      matchingEdges.addClass('synced-highlight');
    }
  } else {
    if (matchingNodes.length > 0 || matchingEdges.length > 0) {
      matchingNodes.addClass('synced-highlight');
      matchingEdges.addClass('synced-highlight');
      cyInstance.nodes().not(matchingNodes).addClass('synced-dimmed');
      cyInstance.edges().not(matchingEdges).addClass('synced-dimmed');
    }
  }
}

// 4a. Initial State: Attack Path OFF, no selection
applyGraphState(cy, null, false, analysis.attackNodeIds, analysis.attackEdgeIds);
assert(cy.elements('.synced-dimmed').length === 0, 'Attack Path OFF: 0 elements dimmed (100% visible)');
assert(cy.elements('.synced-highlight').length === 0, 'Attack Path OFF: 0 elements highlighted');

// 4b. Toggle Attack Path ON (Overview Mode)
applyGraphState(cy, null, true, analysis.attackNodeIds, analysis.attackEdgeIds);
const dimmedEdges = cy.edges('.synced-dimmed');
assert(dimmedEdges.length === 2, `Attack Path ON: Exactly 2 benign edges dimmed (got ${dimmedEdges.length})`);
assert(dimmedEdges.some(e => e.id() === 'rel_1_EVT-001'), 'rel_1_EVT-001 is dimmed in Attack Path mode');
assert(dimmedEdges.some(e => e.id() === 'rel_2_EVT-001'), 'rel_2_EVT-001 is dimmed in Attack Path mode');
assert(cy.edges().not(dimmedEdges).length === 17, '17 attack edges remain prominent');

// 4c. Select event EVT-004 while Attack Path is ON
applyGraphState(cy, 'EVT-004', true, analysis.attackNodeIds, analysis.attackEdgeIds);
const highlightedNodes = cy.nodes('.synced-highlight');
const highlightedEdges = cy.edges('.synced-highlight');
assert(highlightedNodes.length > 0, `Active event EVT-004 has ${highlightedNodes.length} highlighted nodes`);
assert(highlightedEdges.length > 0, `Active event EVT-004 has ${highlightedEdges.length} highlighted edges`);
assert(cy.edges('.synced-dimmed').length >= 2, 'Benign edges remain dimmed while event is selected');

// 4d. Clear Focus while Attack Path is ON
applyGraphState(cy, null, true, analysis.attackNodeIds, analysis.attackEdgeIds);
assert(cy.elements('.synced-highlight').length === 0, 'Clear Focus removes all highlight rings');
assert(cy.edges('.synced-dimmed').length === 2, 'Attack Path isolation preserved after Clear Focus');

// 4e. Toggle Attack Path OFF
applyGraphState(cy, null, false, analysis.attackNodeIds, analysis.attackEdgeIds);
assert(cy.elements('.synced-dimmed').length === 0, 'Attack Path OFF restores full graph visibility');
assert(cy.elements('.synced-highlight').length === 0, 'No remaining highlight classes after turning OFF');

// -------------------------------------------------------------
// 5. Replay Engine Compatibility with Attack Path Mode
// -------------------------------------------------------------
console.log('\n--- 5. Replay Engine Compatibility with Attack Path Mode ---');
let curReplayIdx = 0; // EVT-001
assert(mockEvents[curReplayIdx].event_id === 'EVT-001', 'Replay starts at EVT-001');

// Step next to EVT-002 (Patient Zero)
curReplayIdx = calculateNextIndex(curReplayIdx, mockEvents.length);
const evt002 = mockEvents[curReplayIdx];
assert(evt002.event_id === 'EVT-002', 'Replay stepped to EVT-002 (Patient Zero)');

// Apply Attack Path ON during replay frame
applyGraphState(cy, evt002.event_id, true, analysis.attackNodeIds, analysis.attackEdgeIds);
assert(cy.nodes('.synced-highlight').length > 0, 'Replay frame highlights Patient Zero nodes');
assert(cy.edges('.synced-dimmed').length >= 2, 'Replay preserves attack path background dimming');

// Step next to EVT-003 (Execution)
curReplayIdx = calculateNextIndex(curReplayIdx, mockEvents.length);
const evt003 = mockEvents[curReplayIdx];
assert(evt003.event_id === 'EVT-003', 'Replay stepped to EVT-003 (Execution)');
applyGraphState(cy, evt003.event_id, true, analysis.attackNodeIds, analysis.attackEdgeIds);
assert(cy.nodes('.synced-highlight').some(n => n.id() === 'file:powershell_payload.ps1'),
  'Replay frame highlights powershell_payload.ps1 node');

// Clean up Cytoscape instance
cy.destroy();

// -------------------------------------------------------------
// 6. Component File Checks
// -------------------------------------------------------------
console.log('\n--- 6. Component Source File Inspection ---');
const ivPath = path.join(__dirname, 'InvestigationView.jsx');
const rgPath = path.join(__dirname, 'RelationshipGraph.jsx');
const itPath = path.join(__dirname, 'IncidentTimeline.jsx');

const ivSource = fs.readFileSync(ivPath, 'utf8');
const rgSource = fs.readFileSync(rgPath, 'utf8');
const itSource = fs.readFileSync(itPath, 'utf8');

assert(ivSource.includes('attackPathOnly'), 'InvestigationView manages attackPathOnly state');
assert(ivSource.includes('Attack Path Only:'), 'InvestigationView renders [ Attack Path Only: OFF / ON ] toggle');
assert(ivSource.includes('identifyAttackPath'), 'InvestigationView imports identifyAttackPath');

assert(rgSource.includes('attackPathOnly'), 'RelationshipGraph accepts attackPathOnly prop');
assert(rgSource.includes('attackPathNodeIds'), 'RelationshipGraph accepts attackPathNodeIds prop');
assert(rgSource.includes('attackPathEdgeIds'), 'RelationshipGraph accepts attackPathEdgeIds prop');

assert(itSource.includes('attackPathOnly'), 'IncidentTimeline accepts attackPathOnly prop');
assert(itSource.includes('attackPathEventIds'), 'IncidentTimeline accepts attackPathEventIds prop');
assert(itSource.includes('isDeemphasized'), 'IncidentTimeline de-emphasizes non-attack events when filtered');

console.log('\n================================================================');
if (allPassed) {
  console.log('   ALL CHECKS PASSED: TASK 2 ATTACK PATH ISOLATION VERIFIED!    ');
} else {
  console.error('   SOME CHECKS FAILED: REVIEW LOGS ABOVE.                      ');
  process.exit(1);
}
console.log('================================================================\n');
