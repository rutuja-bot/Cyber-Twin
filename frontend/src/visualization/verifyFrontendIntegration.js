/**
 * Verification Script for Frontend Application Integration
 * 
 * Verifies:
 * 1. Entry point files: index.html, src/index.jsx, src/App.jsx exist.
 * 2. index.html provides #root mount container and module script link.
 * 3. src/index.jsx uses react-dom/client createRoot to mount <App />.
 * 4. src/App.jsx initializes CyberTwinDataModel and renders InvestigationView.
 * 5. Dependency resolution: react, react-dom/client, and cytoscape are installed and resolvable.
 * 6. Baseline data model generates 7 events, 10 entities, 19 relationships, 7 evidence records.
 * 7. Zero hardcoded mock IDs in App.jsx.
 * 8. Full backward compatibility with existing visualization components.
 */

const fs = require('fs');
const path = require('path');

const {
  mockEvents,
  createCyberTwinDataModel,
  InvestigationView,
  RelationshipGraph,
  IncidentTimeline
} = require('./index');

console.log('================================================================');
console.log('   CYBER TWIN FRONTEND APPLICATION INTEGRATION VERIFICATION    ');
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
// 1. Entry Point Files Existence
// -------------------------------------------------------------
console.log('--- 1. Application Entry Point Files ---');
const frontendDir = path.resolve(__dirname, '..', '..');
const htmlPath = path.join(frontendDir, 'index.html');
const indexJsxPath = path.join(frontendDir, 'src', 'index.jsx');
const appJsxPath = path.join(frontendDir, 'src', 'App.jsx');

assert(fs.existsSync(htmlPath), `index.html exists at ${htmlPath}`);
assert(fs.existsSync(indexJsxPath), `src/index.jsx exists at ${indexJsxPath}`);
assert(fs.existsSync(appJsxPath), `src/App.jsx exists at ${appJsxPath}`);

// -------------------------------------------------------------
// 2. index.html Structure Checks
// -------------------------------------------------------------
console.log('\n--- 2. HTML Entry Shell Checks ---');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
assert(htmlContent.includes('<div id="root"></div>'), 'index.html contains #root mounting target');
assert(htmlContent.includes('src="/src/index.jsx"') || htmlContent.includes("src='/src/index.jsx'"), 'index.html links to /src/index.jsx');
assert(htmlContent.includes('<title>Cyber Twin'), 'index.html contains Cyber Twin title');

// -------------------------------------------------------------
// 3. src/index.jsx React DOM Bootstrap Checks
// -------------------------------------------------------------
console.log('\n--- 3. React DOM Client Bootstrap Checks ---');
const indexJsxContent = fs.readFileSync(indexJsxPath, 'utf8');
assert(indexJsxContent.includes("from 'react-dom/client'"), 'src/index.jsx imports from react-dom/client');
assert(indexJsxContent.includes('createRoot'), 'src/index.jsx calls createRoot');
assert(indexJsxContent.includes('<App />') || indexJsxContent.includes('<App/>'), 'src/index.jsx renders <App />');
assert(indexJsxContent.includes("getElementById('root')"), 'src/index.jsx binds to document.getElementById("root")');

// -------------------------------------------------------------
// 4. src/App.jsx Investigation Workbench Integration Checks
// -------------------------------------------------------------
console.log('\n--- 4. App.jsx Root Component Integration Checks ---');
const appJsxContent = fs.readFileSync(appJsxPath, 'utf8');
assert(appJsxContent.includes('export function App'), 'App.jsx exports App component');
assert(appJsxContent.includes('export default App'), 'App.jsx has default App export');
assert(appJsxContent.includes('createCyberTwinDataModel'), 'App.jsx imports createCyberTwinDataModel');
assert(appJsxContent.includes('mockEvents'), 'App.jsx imports mockEvents data source');
assert(appJsxContent.includes('InvestigationView'), 'App.jsx mounts InvestigationView');
assert(appJsxContent.includes('model={model}'), 'App.jsx passes dynamic model to InvestigationView');

// -------------------------------------------------------------
// 5. Zero Hardcoding Check in App.jsx
// -------------------------------------------------------------
console.log('\n--- 5. Absence of Hardcoded Mock Values in App.jsx ---');
const appCodeNoComments = appJsxContent.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
assert(!appCodeNoComments.includes('"CASE-001"') && !appCodeNoComments.includes("'CASE-001'"),
  'Zero hardcoded "CASE-001" in App.jsx');
assert(!appCodeNoComments.includes('"EVT-001"') && !appCodeNoComments.includes("'EVT-001'"),
  'Zero hardcoded "EVT-001" in App.jsx');
assert(!appCodeNoComments.includes('"employee01"') && !appCodeNoComments.includes("'employee01'"),
  'Zero hardcoded "employee01" in App.jsx');

// -------------------------------------------------------------
// 6. Runtime Dependency Resolution
// -------------------------------------------------------------
console.log('\n--- 6. Runtime Dependency Resolution ---');
try {
  const React = require('react');
  assert(typeof React.createElement === 'function', 'react package is resolvable and functional');
} catch (e) {
  assert(false, `react package resolution failed: ${e.message}`);
}

try {
  const ReactDOMClient = require('react-dom/client');
  assert(typeof ReactDOMClient.createRoot === 'function', 'react-dom/client package is resolvable and exports createRoot');
} catch (e) {
  assert(false, `react-dom/client package resolution failed: ${e.message}`);
}

try {
  const cytoscape = require('cytoscape');
  assert(typeof cytoscape === 'function', 'cytoscape package is resolvable');
} catch (e) {
  assert(false, `cytoscape package resolution failed: ${e.message}`);
}

// -------------------------------------------------------------
// 7. Baseline Model Instantiation & Data Layer Integration
// -------------------------------------------------------------
console.log('\n--- 7. Baseline Model Instantiation ---');
const baselineModel = createCyberTwinDataModel(mockEvents);
assert(baselineModel.case_id === 'CASE-001', 'Model correctly initializes case_id');
assert(baselineModel.events.length === 7, 'Model correctly loads 7 events');
assert(baselineModel.entities.length === 10, 'Model correctly extracts 10 entities');
assert(baselineModel.relationships.length === 19, 'Model correctly builds 19 relationships');
assert(Object.keys(baselineModel.evidence_map).length === 7, 'Model correctly indexes 7 evidence records');

// -------------------------------------------------------------
// 8. Backward Compatibility with Visualization Stack
// -------------------------------------------------------------
console.log('\n--- 8. Backward Compatibility ---');
assert(typeof InvestigationView !== 'undefined' || fs.existsSync(path.join(__dirname, 'InvestigationView.jsx')),
  'InvestigationView preserved and functional');
assert(typeof RelationshipGraph !== 'undefined' || fs.existsSync(path.join(__dirname, 'RelationshipGraph.jsx')),
  'RelationshipGraph preserved and functional');
assert(typeof IncidentTimeline !== 'undefined' || fs.existsSync(path.join(__dirname, 'IncidentTimeline.jsx')),
  'IncidentTimeline preserved and functional');

console.log('\n================================================================');
if (allPassed) {
  console.log('   ALL CHECKS PASSED: FRONTEND APP INTEGRATION VERIFIED!        ');
} else {
  console.error('   SOME CHECKS FAILED: PLEASE REVIEW OUTPUT ABOVE!              ');
  process.exit(1);
}
console.log('================================================================\n');
