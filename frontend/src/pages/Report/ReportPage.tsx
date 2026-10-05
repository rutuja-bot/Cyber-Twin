import React, { useState, useEffect } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { ReportView } from '../../components/findings/ReportView';
import { EvidenceDetailModal } from '../../components/evidence/EvidenceDetailModal';
import { Evidence } from '../../types';
import { getForensicReport } from '../../api/evidence';

export const ReportPage: React.FC = () => {
  const { activeCase, findingsList, evidenceList } = useInvestigation();
  const [modalEvidence, setModalEvidence] = useState<Evidence | null>(null);
  const [liveReportData, setLiveReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const caseId = activeCase?.case_id || 'CASE-001';
        const data = await getForensicReport(caseId);
        if (isMounted && data) {
          setLiveReportData(data);
        }
      } catch (err) {
        console.warn('Could not fetch backend report; falling back to context data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchReport();
    return () => {
      isMounted = false;
    };
  }, [activeCase?.case_id]);

  if (!activeCase) return null;

  const handleViewEvidence = (evidenceId: string) => {
    const ev = evidenceList.find((e) => e.evidence_id === evidenceId) || evidenceList[0];
    setModalEvidence(ev);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <ReportView
        activeCase={activeCase}
        findings={findingsList}
        evidenceList={evidenceList}
        reportData={liveReportData}
        onViewEvidence={handleViewEvidence}
      />

      <EvidenceDetailModal
        evidence={modalEvidence}
        onClose={() => setModalEvidence(null)}
      />
    </div>
  );
};
