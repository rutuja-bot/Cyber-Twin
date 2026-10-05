import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Case,
  Evidence,
  NormalizedEvent,
  Entity,
  Finding,
  ReplayEvent,
  InvestigationSummary
} from '../types';
import { getCases, getCaseSummary } from '../api/cases';
import { getEvidenceByCase } from '../api/evidence';
import { getEventsByCase } from '../api/timeline';
import { getGraphData, GraphData } from '../api/graph';
import { getReplayEvents } from '../api/replay';
import { getFindingsByCase } from '../api/findings';

interface InvestigationContextType {
  cases: Case[];
  activeCase: Case | null;
  summary: InvestigationSummary | null;
  evidenceList: Evidence[];
  eventList: NormalizedEvent[];
  graphData: GraphData;
  replayEvents: ReplayEvent[];
  findingsList: Finding[];
  loading: boolean;
  selectedEvent: NormalizedEvent | null;
  selectedEvidence: Evidence | null;
  selectedEntity: Entity | null;
  setActiveCaseId: (caseId: string) => void;
  setSelectedEvent: (event: NormalizedEvent | null) => void;
  setSelectedEvidence: (evidence: Evidence | null) => void;
  setSelectedEntity: (entity: Entity | null) => void;
  refreshData: () => Promise<void>;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const InvestigationContext = createContext<InvestigationContextType | undefined>(undefined);

export const InvestigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [activeCaseId, setActiveCaseId] = useState<string>('CASE-2026-0882');
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [summary, setSummary] = useState<InvestigationSummary | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [eventList, setEventList] = useState<NormalizedEvent[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ entities: [], relationships: [] });
  const [replayEvents, setReplayEvents] = useState<ReplayEvent[]>([]);
  const [findingsList, setFindingsList] = useState<Finding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Cross-view selection state
  const [selectedEvent, setSelectedEvent] = useState<NormalizedEvent | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  // Load initial cases list
  useEffect(() => {
    async function loadCases() {
      try {
        const loadedCases = await getCases();
        setCases(loadedCases);
        if (loadedCases.length > 0 && !activeCaseId) {
          setActiveCaseId(loadedCases[0].case_id);
        }
      } catch (err) {
        console.error('Failed to load cases:', err);
      }
    }
    loadCases();
  }, []);

  // Whenever activeCaseId changes, load all case forensic data in parallel
  useEffect(() => {
    if (!activeCaseId) return;

    let isMounted = true;
    setLoading(true);

    async function loadCaseData() {
      try {
        const [
          casesRes,
          summaryRes,
          evidenceRes,
          eventsRes,
          graphRes,
          replayRes,
          findingsRes
        ] = await Promise.all([
          getCases(),
          getCaseSummary(activeCaseId),
          getEvidenceByCase(activeCaseId),
          getEventsByCase(activeCaseId),
          getGraphData(activeCaseId),
          getReplayEvents(activeCaseId),
          getFindingsByCase(activeCaseId)
        ]);

        if (isMounted) {
          const current = casesRes.find((c) => c.case_id === activeCaseId) || casesRes[0] || null;
          setActiveCase(current);
          setSummary(summaryRes);
          setEvidenceList(evidenceRes);
          setEventList(eventsRes);
          setGraphData(graphRes);
          setReplayEvents(replayRes);
          setFindingsList(findingsRes);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load investigation data for case', activeCaseId, err);
        if (isMounted) setLoading(false);
      }
    }

    loadCaseData();

    return () => {
      isMounted = false;
    };
  }, [activeCaseId]);

  const refreshData = async () => {
    if (!activeCaseId) return;
    setLoading(true);
    const [summaryRes, evidenceRes, eventsRes, graphRes, replayRes, findingsRes] = await Promise.all([
      getCaseSummary(activeCaseId),
      getEvidenceByCase(activeCaseId),
      getEventsByCase(activeCaseId),
      getGraphData(activeCaseId),
      getReplayEvents(activeCaseId),
      getFindingsByCase(activeCaseId)
    ]);
    setSummary(summaryRes);
    setEvidenceList(evidenceRes);
    setEventList(eventsRes);
    setGraphData(graphRes);
    setReplayEvents(replayRes);
    setFindingsList(findingsRes);
    setLoading(false);
  };

  // Session Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('cyber_twin_auth') === 'true';
  });

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Artificial small delay for authentic cyber terminal feel
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (username.trim() === 'investigator' && password === 'cyber123') {
      sessionStorage.setItem('cyber_twin_auth', 'true');
      setIsAuthenticated(true);
      return { success: true };
    } else {
      return {
        success: false,
        error: 'Invalid credentials. Please verify your investigator ID and security passphrase.'
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('cyber_twin_auth');
    setIsAuthenticated(false);
  };

  return (
    <InvestigationContext.Provider
      value={{
        cases,
        activeCase,
        summary,
        evidenceList,
        eventList,
        graphData,
        replayEvents,
        findingsList,
        loading,
        selectedEvent,
        selectedEvidence,
        selectedEntity,
        setActiveCaseId,
        setSelectedEvent,
        setSelectedEvidence,
        setSelectedEntity,
        refreshData,
        isAuthenticated,
        login,
        logout
      }}
    >
      {children}
    </InvestigationContext.Provider>
  );
};

export const useInvestigation = (): InvestigationContextType => {
  const context = useContext(InvestigationContext);
  if (!context) {
    throw new Error('useInvestigation must be used within an InvestigationProvider');
  }
  return context;
};
