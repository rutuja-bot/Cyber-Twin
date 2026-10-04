import React, { useMemo } from 'react';
import { InvestigationView } from './visualization/InvestigationView';
import { createCyberTwinDataModel } from './visualization/dataAdapter';
import mockEvents from './visualization/mockEvents.json';

/**
 * Cyber Twin Root Application Component
 * 
 * Serves as the top-level frontend entry component.
 * Integrates and renders the Cyber Twin Investigation Workbench,
 * populated with the initial baseline CyberTwinDataModel.
 */
export function App() {
  // Initialize baseline CyberTwinDataModel from mock incident events
  const model = useMemo(() => {
    return createCyberTwinDataModel(mockEvents);
  }, []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      overflow: 'hidden',
      backgroundColor: '#0f172a'
    }}>
      <InvestigationView
        model={model}
        height="100vh"
        width="100%"
      />
    </div>
  );
}

export default App;
