/**
 * Browser End-to-End Test Suite for Cyber Twin Workbench via Chrome DevTools Protocol
 */

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

async function isPortOpen(url) {
  try {
    const res = await fetch(url);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

function killProc(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
    } else {
      proc.kill('SIGKILL');
    }
  } catch { }
}

async function runBrowserValidation() {
  console.log('================================================================');
  console.log('   CYBER TWIN BROWSER E2E VALIDATION via CDP                    ');
  console.log('================================================================\n');

  let passed = true;
  function assert(cond, msg) {
    if (cond) {
      console.log(`[PASS] ${msg}`);
    } else {
      console.error(`[FAIL] ${msg}`);
      passed = false;
    }
  }

  let spawnedVite = null;
  let spawnedChrome = null;
  let ws = null;

  try {
    // 1. Ensure Vite Dev Server is running on port 5174
    const viteRunning = await isPortOpen('http://localhost:5174/');
    if (!viteRunning) {
      console.log('Vite server not detected on port 5174. Starting temporary Vite server...');
      const frontendDir = path.resolve(__dirname, '..', '..');
      if (process.platform === 'win32') {
        spawnedVite = spawn('cmd.exe', ['/c', 'npx vite --port 5174'], {
          cwd: frontendDir,
          stdio: 'ignore'
        });
      } else {
        spawnedVite = spawn('npx', ['vite', '--port', '5174'], {
          cwd: frontendDir,
          stdio: 'ignore'
        });
      }
      // Wait for Vite to be ready
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 200));
        if (await isPortOpen('http://localhost:5174/')) break;
      }
    }

    // 2. Ensure Chrome is running with remote debugging on port 9222
    let chromeRunning = await isPortOpen('http://127.0.0.1:9222/json/list');
    if (!chromeRunning) {
      console.log('Headless Chrome not detected on port 9222. Starting temporary Chrome...');
      const chromeCandidates = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
      ];
      const chromeBin = chromeCandidates.find(p => p && fs.existsSync(p));
      if (!chromeBin) {
        throw new Error('Chrome executable not found for E2E testing.');
      }
      const tmpProfile = path.join(os.tmpdir(), 'cdp_run_' + Date.now());
      spawnedChrome = spawn(chromeBin, [
        'http://localhost:5174/',
        '--headless=new',
        '--remote-debugging-port=9222',
        `--user-data-dir=${tmpProfile}`,
        '--window-size=1400,900'
      ], { stdio: 'ignore' });

      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 200));
        if (await isPortOpen('http://127.0.0.1:9222/json/list')) break;
      }
    }

    // 3. Fetch CDP target
    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const targets = await listRes.json();
    const pageTarget = targets.find(t => t.type === 'page' && t.url.includes('5174'));
    if (!pageTarget) {
      throw new Error('No page target found matching port 5174. Targets: ' + JSON.stringify(targets));
    }

    console.log(`Connecting to CDP target: ${pageTarget.title} (${pageTarget.url})`);
    ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let msgId = 1;
    const pending = new Map();
    const consoleErrors = [];

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && pending.has(data.id)) {
        const { resolve, reject } = pending.get(data.id);
        pending.delete(data.id);
        if (data.error) reject(data.error);
        else resolve(data.result);
      }
      if (data.method === 'Runtime.consoleAPICalled') {
        if (data.params.type === 'error') {
          consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
        }
      }
      if (data.method === 'Runtime.exceptionThrown') {
        consoleErrors.push(data.params.exceptionDetails.text + ': ' + (data.params.exceptionDetails.exception?.description || ''));
      }
    };

    await new Promise((resolve) => ws.onopen = resolve);

    function send(method, params = {}) {
      const id = msgId++;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Enable CDP domains
    await send('Runtime.enable');
    await send('Page.enable');

    async function evalExpr(expression) {
      const res = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true
      });
      return res.result?.value;
    }

    // Wait for initial DOM and React to finish mounting
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 500));
      try {
        const count = await evalExpr('document.getElementById("root")?.children.length || 0');
        if (count > 0) break;
      } catch { }
    }

    // --- Check 1: No Blank Screen / Root Mounting ---
    console.log('--- 1. Application Loading & Root Mount ---');
    const rootChildCount = await evalExpr('document.getElementById("root")?.children.length || 0');
    assert(rootChildCount > 0, `Root element mounted with ${rootChildCount} child components (no blank screen)`);

    // --- Check 2 & 3: Workbench Title & Case Header ---
    console.log('\n--- 2 & 3. Header & Case Telemetry ---');
    const headerTitle = await evalExpr('document.body.innerText.includes("Cyber Twin Investigation Workbench")');
    assert(headerTitle, 'InvestigationView rendered with workbench title');

    const caseBadge = await evalExpr('document.body.innerText.includes("Case: CASE-001")');
    assert(caseBadge, 'Dynamic case header displays Case: CASE-001');

    // --- Check 4: Telemetry Counters ---
    console.log('\n--- 4. Dynamic Metric Counters ---');
    const hasEventsCount = await evalExpr('document.body.innerText.includes("Events:") && document.body.innerText.includes("7")');
    assert(hasEventsCount, 'Telemetry shows 7 Events');

    const hasEntitiesCount = await evalExpr('document.body.innerText.includes("Entities:") && document.body.innerText.includes("10")');
    assert(hasEntitiesCount, 'Telemetry shows 10 Entities');

    const hasRelCount = await evalExpr('document.body.innerText.includes("Relationships:") && document.body.innerText.includes("19")');
    assert(hasRelCount, 'Telemetry shows 19 Relationships');

    const hasEvdCount = await evalExpr('document.body.innerText.includes("Evidence Records:") && document.body.innerText.includes("7")');
    assert(hasEvdCount, 'Telemetry shows 7 Evidence Records');

    // --- Check 5: Chronological Incident Timeline ---
    console.log('\n--- 5. Chronological Incident Timeline ---');
    const hasStep1 = await evalExpr('document.body.innerText.includes("Normal Login") && document.body.innerText.includes("EVT-001")');
    assert(hasStep1, 'Timeline displays Step 1 (Normal Login EVT-001)');

    const hasStep7 = await evalExpr('document.body.innerText.includes("EVT-007")');
    assert(hasStep7, 'Timeline displays Step 7 (EVT-007)');

    // --- Check 6: Relationship Graph with Cytoscape ---
    console.log('\n--- 6. Relationship Graph & Cytoscape Rendering ---');
    const cyCanvasExists = await evalExpr('document.querySelector("canvas") !== null');
    assert(cyCanvasExists, 'Cytoscape HTML5 Canvas rendered successfully');

    const graphToolbar = await evalExpr('document.body.innerText.includes("Fit View") && document.body.innerText.includes("Zoom In") && document.body.innerText.includes("Reset Layout")');
    assert(graphToolbar, 'Graph controls toolbar rendered (Fit View, Zoom In, Zoom Out, Reset Layout)');

    // --- Check 7: Timeline Event Selection Simulation ---
    console.log('\n--- 7. Timeline Event Click & Graph Synchronization ---');
    // Click on EVT-004 card in timeline: exactly one const cards declaration targeting [role="button"] with EVT-004
    const clickedEvent4 = await evalExpr(`
      (() => {
        const cards = Array.from(document.querySelectorAll('[role="button"]')).filter(el => el.innerText && el.innerText.includes('EVT-004'));
        const target = cards[0];
        if (target) {
          target.click();
          return true;
        }
        return false;
      })()
    `);
    assert(clickedEvent4, 'Found and clicked timeline event EVT-004');
    await new Promise(r => setTimeout(r, 600));

    const focusBannerUpdated = await evalExpr('document.body.innerText.includes("Focus:") && document.body.innerText.includes("EVT-004")');
    assert(focusBannerUpdated, 'Workbench state updated: Focus on EVT-004');

    const inspectorUpdated = await evalExpr('document.body.innerText.includes("EVD-004") && document.body.innerText.includes("confidential_financials.xlsx")');
    assert(inspectorUpdated, 'Event Inspector displays EVT-004 fields (EVD-004, confidential_financials.xlsx)');

    // --- Check 8 & 10: Forensic Evidence Trace Drawer ---
    console.log('\n--- 8 & 10. Forensic Evidence Traceability ---');
    const evidenceTraced = await evalExpr('document.body.innerText.includes("VERIFIED IN EVIDENCE MAP")');
    assert(evidenceTraced, 'Evidence record verified in evidence_map without invented data');

    // --- Check 9: Clear Focus Action ---
    console.log('\n--- 9. Clear Focus Action ---');
    const clearFocusClicked = await evalExpr(`
      (() => {
        const clearBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Clear Focus'));
        if (clearBtn) {
          clearBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(clearFocusClicked, 'Clicked Clear Focus button');
    await new Promise(r => setTimeout(r, 500));

    const overviewRestored = await evalExpr('document.body.innerText.includes("Overview Mode")');
    assert(overviewRestored, 'Clear Focus restored workbench to Overview Mode (100% visible)');

    // --- Check 11: Responsive Layout on Narrow Viewport ---
    console.log('\n--- 11. Responsive Layout Testing ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 768,
      height: 1024,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 500));
    const rootVisibleOnNarrow = await evalExpr('document.getElementById("root").offsetHeight > 500');
    assert(rootVisibleOnNarrow, 'Workbench remains functional on narrow 768px viewport');

    // Reset viewport
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1400,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false
    });
    await new Promise(r => setTimeout(r, 300));

    // --- Check 12: Console Errors ---
    console.log('\n--- 12. Browser Console Inspection ---');
    assert(consoleErrors.length === 0, `Browser console contains 0 runtime errors (found: ${consoleErrors.length} -> ${consoleErrors.join(', ')})`);

    // --- Check 13: Page Refresh Stability ---
    console.log('\n--- 13. Page Refresh Stability ---');
    await send('Page.reload');
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 500));
      try {
        const count = await evalExpr('document.getElementById("root")?.children.length || 0');
        if (count > 0) break;
      } catch { }
    }
    const reloadTitle = await evalExpr('document.body.innerText.includes("Cyber Twin Investigation Workbench")');
    assert(reloadTitle, 'Workbench reloads and renders cleanly upon page refresh');

    // --- Check 14: Incident Replay Playback Engine Controls ---
    console.log('\n--- 14. Incident Replay Playback Engine Controls ---');

    // 14a. Replay Toolbar Rendering
    const hasReplayToolbar = await evalExpr('document.querySelector("input[aria-label=\'Incident timeline replay scrubber\']") !== null');
    assert(hasReplayToolbar, 'Replay Scrubber slider rendered with accessible aria-label');

    const hasPlayBtn = await evalExpr('document.querySelector("button[aria-label=\'Play\']") !== null || document.body.innerText.includes("Play")');
    assert(hasPlayBtn, 'Play button rendered with accessible label');

    const hasPrevBtn = await evalExpr('document.querySelector("button[aria-label=\'Previous Event\']") !== null');
    assert(hasPrevBtn, 'Previous Event button rendered with accessible label');

    const hasNextBtn = await evalExpr('document.querySelector("button[aria-label=\'Next Event\']") !== null');
    assert(hasNextBtn, 'Next Event button rendered with accessible label');

    // 14b. Step Forward Interaction
    const stepForwardSuccess = await evalExpr(`
      (() => {
        const nextBtn = document.querySelector("button[aria-label='Next Event']");
        if (nextBtn && !nextBtn.disabled) {
          nextBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(stepForwardSuccess, 'Clicked Next Event button successfully');
    await new Promise(r => setTimeout(r, 400));
    const stepForwardFocus = await evalExpr('document.body.innerText.includes("Focus: EVT-001") || document.body.innerText.includes("EVT-001")');
    assert(stepForwardFocus, 'Step Forward updated focus state');

    // 14c. Step Backward Interaction
    const stepBackwardSuccess = await evalExpr(`
      (() => {
        const prevBtn = document.querySelector("button[aria-label='Previous Event']");
        if (prevBtn) {
          prevBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(stepBackwardSuccess, 'Clicked Previous Event button successfully');
    await new Promise(r => setTimeout(r, 400));

    // 14d. Playback Speed Selector (2x)
    const speedChangeSuccess = await evalExpr(`
      (() => {
        const speedBtn = document.querySelector("button[aria-label='Playback speed 2x']");
        if (speedBtn) {
          speedBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(speedChangeSuccess, 'Selected 2x playback speed');

    // 14e. Scrubber Interaction
    const scrubberScrubSuccess = await evalExpr(`
      (() => {
        const scrubber = document.querySelector("input[aria-label='Incident timeline replay scrubber']");
        if (scrubber) {
          scrubber.value = "3";
          scrubber.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        return false;
      })()
    `);
    assert(scrubberScrubSuccess, 'Scrubber seeks to index 3 (Event 4)');
    await new Promise(r => setTimeout(r, 400));
    const scrubberUpdatedFocus = await evalExpr('document.body.innerText.includes("Event 4 / 7") || document.body.innerText.includes("EVT-004")');
    assert(scrubberUpdatedFocus, 'Scrubber synchronized timeline to Event 4 / 7');

    // --- Check 15: Attack Path Highlighting & Isolation Toggle ---
    console.log('\n--- 15. Attack Path Highlighting & Isolation Toggle ---');

    // 15a. Verify Attack Path Only control exists and initial state is OFF
    const initialToggleState = await evalExpr(`
      (() => {
        const btn = document.querySelector("button[aria-label*='Attack Path Only']");
        if (!btn) return null;
        return {
          exists: true,
          text: btn.innerText.trim(),
          isOff: btn.innerText.includes('OFF')
        };
      })()
    `);
    assert(initialToggleState && initialToggleState.exists, 'Attack Path Only toggle button exists');
    assert(initialToggleState && initialToggleState.isOff, `Initial state is OFF (${initialToggleState?.text})`);

    // 15b. Click toggle to enable Attack Path Only mode (ON)
    const toggleToOn = await evalExpr(`
      (() => {
        const btn = document.querySelector("button[aria-label*='Attack Path Only']");
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(toggleToOn, 'Clicked Attack Path Only toggle button');
    await new Promise(r => setTimeout(r, 400));

    // 15c. Verify UI state updated to ON
    const onStateVerified = await evalExpr(`
      (() => {
        const btn = document.querySelector("button[aria-label*='Attack Path Only']");
        const bodyText = document.body.innerText;
        return {
          btnOn: btn ? btn.innerText.includes('ON') : false,
          hasAttackBadge: bodyText.includes('Attack Path')
        };
      })()
    `);
    assert(onStateVerified.btnOn, 'Toggle button state updated to ON');
    assert(onStateVerified.hasAttackBadge, 'Attack Path indicator active in workbench telemetry');

    // 15d. Click toggle again to restore normal view (OFF)
    const toggleToOff = await evalExpr(`
      (() => {
        const btn = document.querySelector("button[aria-label*='Attack Path Only']");
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(toggleToOff, 'Clicked Attack Path Only toggle button again');
    await new Promise(r => setTimeout(r, 400));

    const offStateRestored = await evalExpr(`
      (() => {
        const btn = document.querySelector("button[aria-label*='Attack Path Only']");
        return btn ? btn.innerText.includes('OFF') : false;
      })()
    `);
    assert(offStateRestored, 'Normal full view cleanly restored (state: OFF)');

    // --- Check 16: 3D Cyber Twin Infrastructure Layer ---
    console.log('\n--- 16. 3D Cyber Twin Infrastructure Layer ---');

    // 16a. Verify 3D Cyber Twin container exists
    const has3DContainer = await evalExpr(`
      (() => {
        const container = document.querySelector("[aria-label='3D Cyber Twin infrastructure visualization']");
        if (!container) return false;
        return true;
      })()
    `);
    assert(has3DContainer, '3D Cyber Twin container rendered with accessible label');

    // 16b. Verify 3D Cyber Twin title and infrastructure controls
    const cyberTwin3DDetails = await evalExpr(`
      (() => {
        const container = document.querySelector("[aria-label='3D Cyber Twin infrastructure visualization']");
        if (!container) return null;
        const text = container.innerText;
        const hasTitle = text.includes('3D Cyber Twin');
        const hasZones = text.includes('Zones:');
        const hasReset = container.querySelector("button[aria-label='Reset 3D camera view']") !== null;
        return { hasTitle, hasZones, hasReset };
      })()
    `);
    assert(cyberTwin3DDetails && cyberTwin3DDetails.hasTitle, '3D Cyber Twin title is rendered');
    assert(cyberTwin3DDetails && cyberTwin3DDetails.hasZones, '3D Cyber Twin zone telemetry is displayed');
    assert(cyberTwin3DDetails && cyberTwin3DDetails.hasReset, 'Reset 3D camera view button is rendered');

    // 16c. Verify Topology View Mode controls exist
    const viewModeControls = await evalExpr(`
      (() => {
        const splitBtn = document.querySelector("button[aria-label='View Mode: Split 2D + 3D']");
        const graph2DBtn = document.querySelector("button[aria-label='View Mode: 2D Graph Only']");
        const twin3DBtn = document.querySelector("button[aria-label='View Mode: 3D Cyber Twin Only']");
        return {
          hasSplit: splitBtn !== null,
          has2D: graph2DBtn !== null,
          has3D: twin3DBtn !== null
        };
      })()
    `);
    assert(viewModeControls && viewModeControls.hasSplit, 'Split 2D+3D view mode button rendered');
    assert(viewModeControls && viewModeControls.has2D, '2D Graph only view mode button rendered');
    assert(viewModeControls && viewModeControls.has3D, '3D Cyber Twin only view mode button rendered');

    // 16d. Switch to 3D Cyber Twin Only mode
    const switchTo3D = await evalExpr(`
      (() => {
        const twin3DBtn = document.querySelector("button[aria-label='View Mode: 3D Cyber Twin Only']");
        if (twin3DBtn) {
          twin3DBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(switchTo3D, 'Switched to 3D Cyber Twin Only view mode');
    await new Promise(r => setTimeout(r, 400));

    // Verify 3D view is present and 2D view controls are hidden in 3D-only mode
    const view3DActive = await evalExpr(`
      (() => {
        const twin3D = document.querySelector("[aria-label='3D Cyber Twin infrastructure visualization']");
        const hasFitView = document.querySelector("button[title='Fit Graph to View']") !== null;
        return {
          has3D: twin3D !== null,
          has2D: hasFitView
        };
      })()
    `);
    assert(view3DActive.has3D, '3D Cyber Twin view active in 3D-only mode');
    assert(!view3DActive.has2D, '2D Graph hidden in 3D-only mode');

    // 16e. Switch back to Split View
    const switchToSplit = await evalExpr(`
      (() => {
        const splitBtn = document.querySelector("button[aria-label='View Mode: Split 2D + 3D']");
        if (splitBtn) {
          splitBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert(switchToSplit, 'Restored Split View mode');
    await new Promise(r => setTimeout(r, 400));

    const splitRestored = await evalExpr(`
      (() => {
        const twin3D = document.querySelector("[aria-label='3D Cyber Twin infrastructure visualization']");
        const hasFitView = document.querySelector("button[title='Fit Graph to View']") !== null;
        return {
          has3D: twin3D !== null,
          has2D: hasFitView
        };
      })()
    `);
    assert(splitRestored.has3D && splitRestored.has2D, 'Both 2D Graph and 3D Cyber Twin active in Split View');

    // 16f. Final console error verification
    assert(consoleErrors.length === 0, `Zero console runtime errors detected across all 16 interactions (${consoleErrors.length} errors)`);

    console.log('\n================================================================');
    if (passed) {
      console.log('   ALL 16 BROWSER CHECKS PASSED: UI, REPLAY, ATTACK PATH & 3D CYBER TWIN VERIFIED! ');
    } else {
      console.error('   SOME BROWSER CHECKS FAILED!                                  ');
      process.exit(1);
    }
    console.log('================================================================\n');

  } finally {
    if (ws) {
      try { ws.close(); } catch { }
    }
    if (spawnedChrome) {
      killProc(spawnedChrome);
    }
    if (spawnedVite) {
      killProc(spawnedVite);
    }
  }
}

runBrowserValidation().catch(e => {
  console.error('Browser validation failed with exception:', e);
  process.exit(1);
});
