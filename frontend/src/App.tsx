import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InvestigationProvider, useInvestigation } from './context/InvestigationContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { InvestigationHeader } from './components/layout/InvestigationHeader';

// Pages
import { LoginPage } from './pages/Login/LoginPage';
import { LandingPage } from './pages/Landing/LandingPage';
import { CaseDashboardPage } from './pages/Dashboard/CaseDashboardPage';
import { InvestigationDashboardPage } from './pages/Investigation/InvestigationDashboardPage';
import { EvidencePage } from './pages/Evidence/EvidencePage';
import { TimelinePage } from './pages/Timeline/TimelinePage';
import { GraphPage } from './pages/Graph/GraphPage';
import { ReplayPage } from './pages/Replay/ReplayPage';
import { ReportPage } from './pages/Report/ReportPage';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useInvestigation();

  // Unauthenticated: Present Login as first screen
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Authenticated: Full Workspace with Sidebar, Navbar, and Investigation Views
  return (
    <div className="app-container">
      {/* Main Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar />

        <Routes>
          {/* Default redirect to Landing/Overview */}
          <Route path="/" element={<Navigate to="/landing" replace />} />

          {/* Landing / Project Entry Overview without investigation header */}
          <Route
            path="/landing"
            element={
              <div className="page-wrapper">
                <LandingPage />
              </div>
            }
          />

          {/* Investigation Workspace Routes with contextual investigation header */}
          <Route
            path="/*"
            element={
              <>
                <InvestigationHeader />
                <div className="page-wrapper">
                  <Routes>
                    <Route path="cases" element={<CaseDashboardPage />} />
                    <Route path="investigation" element={<InvestigationDashboardPage />} />
                    <Route path="evidence" element={<EvidencePage />} />
                    <Route path="timeline" element={<TimelinePage />} />
                    <Route path="graph" element={<GraphPage />} />
                    <Route path="replay" element={<ReplayPage />} />
                    <Route path="report" element={<ReportPage />} />
                    <Route path="*" element={<Navigate to="/landing" replace />} />
                  </Routes>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <InvestigationProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </InvestigationProvider>
  );
};

export default App;
