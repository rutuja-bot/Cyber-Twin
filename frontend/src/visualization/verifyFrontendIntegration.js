/**
 * Verification Script for Frontend Application Integration
 * ESM Module implementation compatible with package.json type: module.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  createCyberTwinDataModel,
  createModelFromReconstruction
} from './dataAdapter.js';

const mockEvents = JSON.parse(fs.readFileSync(path.join(__dirname, 'mockEvents.json'), 'utf8'));

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
const mainTsxPath = path.join(frontendDir, 'src', 'main.tsx');
const appTsxPath = path.join(frontendDir, 'src', 'App.tsx');
const contextPath = path.join(frontendDir, 'src', 'context', 'InvestigationContext.tsx');
const dashPath = path.join(frontendDir, 'src', 'pages', 'Investigation', 'InvestigationDashboardPage.tsx');

assert(fs.existsSync(htmlPath), `index.html exists at ${htmlPath}`);
assert(fs.existsSync(mainTsxPath), `src/main.tsx exists at ${mainTsxPath}`);
assert(fs.existsSync(appTsxPath), `src/App.tsx exists at ${appTsxPath}`);
assert(fs.existsSync(contextPath), `InvestigationContext.tsx exists at ${contextPath}`);
assert(fs.existsSync(dashPath), `InvestigationDashboardPage.tsx exists at ${dashPath}`);

// -------------------------------------------------------------
// 2. index.html Structure Checks
// -------------------------------------------------------------
console.log('\n--- 2. HTML Entry Shell Checks ---');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');
assert(htmlContent.includes('<div id="root"></div>'), 'index.html contains #root mounting target');
assert(htmlContent.includes('/src/main.tsx') || htmlContent.includes('/src/index.jsx'), 'index.html links to application entry module');
assert(htmlContent.includes('<title>Cyber Twin'), 'index.html contains Cyber Twin title');

// -------------------------------------------------------------
// 3. src/main.tsx React DOM Bootstrap Checks
// -------------------------------------------------------------
console.log('\n--- 3. React DOM Client Bootstrap Checks ---');
const mainContent = fs.readFileSync(mainTsxPath, 'utf8');
assert(mainContent.includes("from 'react-dom/client'"), 'src/main.tsx imports from react-dom/client');
assert(mainContent.includes('createRoot'), 'src/main.tsx calls createRoot');
assert(mainContent.includes('<App />') || mainContent.includes('<App/>'), 'src/main.tsx renders <App />');
assert(mainContent.includes("getElementById('root')"), 'src/main.tsx binds to document.getElementById("root")');

// -------------------------------------------------------------
// 4. Investigation Workbench Core Integration Checks
// -------------------------------------------------------------
console.log('\n--- 4. Investigation Workbench Core Integration Checks ---');
const contextContent = fs.readFileSync(contextPath, 'utf8');
const dashContent = fs.readFileSync(dashPath, 'utf8');

assert(contextContent.includes('createModelFromReconstruction'), 'InvestigationContext imports createModelFromReconstruction');
assert(contextContent.includes('reconstructionModel'), 'InvestigationContext manages reconstructionModel state');
assert(dashContent.includes('InvestigationView'), 'InvestigationDashboardPage imports InvestigationView');
assert(dashContent.includes('model={reconstructionModel}'), 'InvestigationDashboardPage passes dynamic model to InvestigationView');

// -------------------------------------------------------------
// 5. Default Demo Case Check
// -------------------------------------------------------------
console.log('\n--- 5. Active Case Alignment ---');
assert(contextContent.includes("'CASE-001'"), 'InvestigationContext defaults activeCaseId to CASE-001');

// -------------------------------------------------------------
// 6. Runtime Dependency Resolution
// -------------------------------------------------------------
console.log('\n--- 6. Runtime Dependency Resolution ---');
try {
  const React = await import('react');
  assert(typeof React.default.createElement === 'function', 'react package is resolvable and functional');
} catch (e) {
  assert(false, `react package resolution failed: ${e.message}`);
}

try {
  const ReactDOMClient = await import('react-dom/client');
  assert(typeof ReactDOMClient.default.createRoot === 'function', 'react-dom/client package is resolvable and exports createRoot');
} catch (e) {
  assert(false, `react-dom/client package resolution failed: ${e.message}`);
}

try {
  const cytoscape = await import('cytoscape');
  assert(typeof cytoscape.default === 'function', 'cytoscape package is resolvable');
} catch (e) {
  assert(false, `cytoscape package resolution failed: ${e.message}`);
}

try {
  const three = await import('three');
  assert(typeof three.Scene === 'function', 'three package is resolvable');
} catch (e) {
  assert(false, `three package resolution failed: ${e.message}`);
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
assert(fs.existsSync(path.join(__dirname, 'InvestigationView.jsx')), 'InvestigationView.jsx preserved and present');
assert(fs.existsSync(path.join(__dirname, 'RelationshipGraph.jsx')), 'RelationshipGraph.jsx preserved and present');
assert(fs.existsSync(path.join(__dirname, 'IncidentTimeline.jsx')), 'IncidentTimeline.jsx preserved and present');
assert(fs.existsSync(path.join(__dirname, 'CyberTwin3DView.jsx')), 'CyberTwin3DView.jsx preserved and present');

console.log('\n================================================================');
if (allPassed) {
  console.log('   ALL CHECKS PASSED: FRONTEND APP INTEGRATION VERIFIED!        ');
} else {
  console.error('   SOME CHECKS FAILED: PLEASE REVIEW OUTPUT ABOVE!              ');
  process.exit(1);
}
console.log('================================================================\n');
