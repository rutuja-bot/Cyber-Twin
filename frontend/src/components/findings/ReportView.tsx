import React from 'react';
import { Finding, Case, Evidence } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Printer, Download, ShieldCheck, AlertCircle, FileText, CheckCircle } from 'lucide-react';

interface ReportViewProps {
  activeCase: Case;
  findings: Finding[];
  evidenceList: Evidence[];
  onViewEvidence: (evidenceId: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  activeCase,
  findings,
  evidenceList,
  onViewEvidence
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    let md = `# DIGITAL FORENSIC INVESTIGATION REPORT\n`;
    md += `**Case ID:** ${activeCase.case_id}\n`;
    md += `**Incident Title:** ${activeCase.title}\n`;
    md += `**Severity:** ${activeCase.severity.toUpperCase()}\n`;
    md += `**Status:** ${activeCase.status.toUpperCase()}\n`;
    md += `**Lead Investigator:** ${activeCase.investigator}\n`;
    md += `**Generated Date:** ${new Date().toISOString()}\n\n`;

    md += `## 1. Executive Summary\n`;
    md += `${activeCase.description}\n\n`;

    md += `## 2. Forensic Findings & Attack Reconstruction\n`;
    findings.forEach((f, idx) => {
      md += `### 2.${idx + 1} ${f.title} [${f.severity.toUpperCase()}]\n`;
      md += `- **Confidence:** ${(f.confidence * 100).toFixed(0)}%\n`;
      md += `- **MITRE Tactics:** ${f.mitre_tactics.join(', ')}\n`;
      md += `- **MITRE Techniques:** ${f.mitre_techniques.join(', ')}\n`;
      md += `- **Description:** ${f.description}\n`;
      md += `- **Corroborating Evidence:** ${f.evidence_ids.join(', ')}\n`;
      md += `- **Recommended Action:** ${f.recommendation}\n\n`;
    });

    md += `## 3. Evidence Chain of Custody & Cryptographic Hashes\n`;
    evidenceList.forEach((e) => {
      md += `- **${e.filename}** (${e.type})\n  - SHA-256: \`${e.hash}\`\n  - Source: ${e.source}\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CyberTwin_Forensic_Report_${activeCase.case_id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Report Action Header */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0d1424',
          border: '1px solid #1e293b',
          borderRadius: '8px',
          padding: '1rem 1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText size={22} color="#00f2fe" />
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Official Forensic Investigation Dossier
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Standard NIST SP 800-86 & ISO/IEC 27037 incident reconstruction template
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" size="sm" icon={<Download size={15} />} onClick={handleDownloadMarkdown}>
            Export Markdown
          </Button>
          <Button variant="primary" size="sm" icon={<Printer size={15} />} onClick={handlePrint}>
            Generate / Print Report
          </Button>
        </div>
      </div>

      {/* Main Forensic Dossier Card */}
      <div
        className="cyber-card"
        style={{
          background: '#0a0f1d',
          border: '1px solid #1e293b',
          padding: '2.5rem',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}
      >
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid #1e293b', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#00f2fe',
                  fontWeight: 700,
                  letterSpacing: '0.1em'
                }}
              >
                CYBER TWIN DIGITAL FORENSICS DIVISION
              </span>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.35rem' }}>
                Forensic Incident Investigation Report
              </h1>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Automated Incident Reconstruction & Correlated Evidence Verification
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', fontWeight: 800, color: '#00f2fe' }}>
                {activeCase.case_id}
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <Badge variant={activeCase.severity}>{activeCase.severity} SEVERITY</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Executive Incident Summary */}
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem' }}>
            1. Executive Incident Summary
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6 }}>
            {activeCase.description} The incident commenced with anomalous off-hours internal subnet credential
            brute force attempts targeting account <code style={{ color: '#00f2fe' }}>dev_user41</code>, succeeding
            at 02:17 UTC into an interactive RDP session on workstation <code style={{ color: '#00f2fe' }}>WS-FIN-04</code>.
            Subsequently, obfuscated PowerShell memory dumping was utilized to escalate privileges to NT AUTHORITY\SYSTEM,
            followed by lateral SMB read of restricted financial database <code style={{ color: '#00f2fe' }}>customer_vault_q3.db</code>.
            The data was staged into archive <code style={{ color: '#00f2fe' }}>svchost_upd.zip</code> and exfiltrated to
            external malicious C2 <code style={{ color: '#ef4444' }}>198.51.100.42:8443</code>. Anti-forensic log wiping
            was attempted prior to session termination.
          </p>
        </div>

        {/* Section 2: Key Correlated Findings */}
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', marginBottom: '1rem' }}>
            2. Correlated Forensic Findings & MITRE ATT&CK Mapping
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {findings.map((f, index) => (
              <div
                key={f.finding_id}
                style={{
                  background: '#0d1424',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '1.25rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#00f2fe', fontWeight: 700 }}>
                      FINDING #{index + 1}:
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                      {f.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant={f.severity} size="sm">{f.severity}</Badge>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#10b981', fontWeight: 600 }}>
                      Confidence: {(f.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                  {f.description}
                </p>

                {/* MITRE Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {f.mitre_tactics.map((tac) => (
                    <span
                      key={tac}
                      style={{
                        fontSize: '0.7rem',
                        background: 'rgba(168, 85, 247, 0.12)',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                        color: '#d8b4fe',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    >
                      Tactic: {tac}
                    </span>
                  ))}
                  {f.mitre_techniques.map((tech) => (
                    <span
                      key={tech}
                      style={{
                        fontSize: '0.7rem',
                        background: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#fcd34d',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontFamily: 'JetBrains Mono, monospace'
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Recommendation */}
                <div
                  style={{
                    background: 'rgba(0, 242, 254, 0.05)',
                    borderLeft: '3px solid #00f2fe',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.8rem',
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.5rem'
                  }}
                >
                  <strong style={{ color: '#00f2fe' }}>Remediation:</strong> {f.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Evidence Chain of Custody */}
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', marginBottom: '0.75rem' }}>
            3. Supporting Evidence Integrity & Chain of Custody
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #1e293b', color: '#94a3b8' }}>
                <th style={{ padding: '0.6rem 0.5rem' }}>Evidence ID</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Filename & Source</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Type</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>SHA-256 Hash</th>
                <th style={{ padding: '0.6rem 0.5rem' }}>Verification</th>
              </tr>
            </thead>
            <tbody>
              {evidenceList.map((e) => (
                <tr key={e.evidence_id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'JetBrains Mono, monospace', color: '#00f2fe', fontWeight: 700 }}>
                    {e.evidence_id}
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem', color: '#f1f5f9' }}>
                    <div><strong>{e.filename}</strong></div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{e.source}</div>
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>
                    <Badge variant="default" size="sm">{e.type}</Badge>
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#38bdf8' }}>
                    {e.hash.substring(0, 16)}...{e.hash.substring(e.hash.length - 8)}
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem' }}>
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
                      <CheckCircle size={14} /> Certified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
