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
import { getCaseReconstruction } from '../api/reconstruction';
import { createModelFromReconstruction, createCyberTwinDataModel, mockEvents } from '../visualization';

interface InvestigationContextType {
  cases: Case[];
  activeCase: Case | null;
  summary: InvestigationSummary | null;
  evidenceList: Evidence[];
  eventList: NormalizedEvent[];
  graphData: GraphData;
  replayEvents: ReplayEvent[];
  findingsList: Finding[];
  reconstructionModel: any | null;
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
  const [activeCaseId, setActiveCaseId] = useState<string>('CASE-001');
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [summary, setSummary] = useState<InvestigationSummary | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [eventList, setEventList] = useState<NormalizedEvent[]>([]);
  const [graphData, setGraphData] = useState<GraphData>({ entities: [], relationships: [] });
  const [replayEvents, setReplayEvents] = useState<ReplayEvent[]>([]);
  const [findingsList, setFindingsList] = useState<Finding[]>([]);
  const [reconstructionModel, setReconstructionModel] = useState<any | null>(null);
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
          findingsRes,
          reconRes
        ] = await Promise.all([
          getCases(),
          getCaseSummary(activeCaseId),
          getEvidenceByCase(activeCaseId),
          getEventsByCase(activeCaseId),
          getGraphData(activeCaseId),
          getReplayEvents(activeCaseId),
          getFindingsByCase(activeCaseId),
          getCaseReconstruction(activeCaseId)
        ]);

        if (isMounted) {
          const current = casesRes.find((c) => c.case_id === activeCaseId) || casesRes[0] || null;
          setActiveCase(current);
          setSummary(summaryRes);

          // Enrich evidence with live reconstruction event linkages if available
          const enrichedEvidence = evidenceRes.map((ev) => {
            if (reconRes?.events && Array.isArray(reconRes.events)) {
              const linked = reconRes.events
                .filter((e: any) => e.evidence_id === ev.evidence_id || e.evidence_ids?.includes(ev.evidence_id))
                .map((e: any) => e.event_id);
              if (linked.length > 0) {
                return {
                  ...ev,
                  linked_event_ids: linked,
                  metadata: {
                    ...ev.metadata,
                    extracted_records: linked.length
                  }
                };
              }
            }
            return ev;
          });

          setEvidenceList(enrichedEvidence);
          setEventList(eventsRes);
          setGraphData(graphRes);
          setReplayEvents(replayRes);
          setFindingsList(findingsRes);

          // Build canonical Cyber Twin Model from backend reconstruction
          try {
            if (reconRes && (reconRes.case_id || reconRes.events || reconRes.graph)) {
              const model = createModelFromReconstruction(reconRes);
              setReconstructionModel(model);
            } else {
              setReconstructionModel(createCyberTwinDataModel(mockEvents));
            }
          } catch (modelErr) {
            console.warn('Error creating model from reconstruction, using fallback model:', modelErr);
            setReconstructionModel(createCyberTwinDataModel(mockEvents));
          }

          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load investigation data for case', activeCaseId, err);
        if (isMounted) {
          setReconstructionModel(createCyberTwinDataModel(mockEvents));
          setLoading(false);
        }
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
    const [
      summaryRes,
      evidenceRes,
      eventsRes,
      graphRes,
      replayRes,
      findingsRes,
      reconRes
    ] = await Promise.all([
      getCaseSummary(activeCaseId),
      getEvidenceByCase(activeCaseId),
      getEventsByCase(activeCaseId),
      getGraphData(activeCaseId),
      getReplayEvents(activeCaseId),
      getFindingsByCase(activeCaseId),
      getCaseReconstruction(activeCaseId)
    ]);
    setSummary(summaryRes);

    const enrichedEvidence = evidenceRes.map((ev) => {
      if (reconRes?.events && Array.isArray(reconRes.events)) {
        const linked = reconRes.events
          .filter((e: any) => e.evidence_id === ev.evidence_id || e.evidence_ids?.includes(ev.evidence_id))
          .map((e: any) => e.event_id);
        if (linked.length > 0) {
          return {
            ...ev,
            linked_event_ids: linked,
            metadata: {
              ...ev.metadata,
              extracted_records: linked.length
            }
          };
        }
      }
      return ev;
    });

    setEvidenceList(enrichedEvidence);
    setEventList(eventsRes);
    setGraphData(graphRes);
    setReplayEvents(replayRes);
    setFindingsList(findingsRes);
    try {
      if (reconRes && (reconRes.case_id || reconRes.events || reconRes.graph)) {
        setReconstructionModel(createModelFromReconstruction(reconRes));
      }
    } catch (e) {
      // Keep existing model
    }
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
        reconstructionModel,
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
