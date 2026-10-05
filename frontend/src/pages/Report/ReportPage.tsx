import React, { useState } from 'react';
import { useInvestigation } from '../../context/InvestigationContext';
import { ReportView } from '../../components/findings/ReportView';
import { EvidenceDetailModal } from '../../components/evidence/EvidenceDetailModal';
import { Evidence } from '../../types';

export const ReportPage: React.FC = () => {
  const { activeCase, findingsList, evidenceList } = useInvestigation();
  const [modalEvidence, setModalEvidence] = useState<Evidence | null>(null);

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
        onViewEvidence={handleViewEvidence}
      />

      <EvidenceDetailModal
        evidence={modalEvidence}
        onClose={() => setModalEvidence(null)}
      />
    </div>
  );
};
