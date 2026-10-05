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
          background: '#101936',
          border: '1px solid #24315C',
          borderRadius: '10px',
          padding: '1.1rem 1.35rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <FileText size={24} color="#00B7FF" />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#F5F7FF' }}>
              Official Forensic Investigation Dossier
            </div>
            <div style={{ fontSize: '0.78rem', color: '#A7B0C8', marginTop: '0.1rem' }}>
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
          background: '#101936',
          border: '1px solid #24315C',
          padding: '2.5rem',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2.25rem',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Document Header */}
        <div style={{ borderBottom: '1px solid #24315C', paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: '#00B7FF',
                  fontWeight: 600,
                  letterSpacing: '0.08em'
                }}
              >
                CYBER TWIN DIGITAL FORENSICS DIVISION
              </span>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#F5F7FF', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
                Forensic Incident Investigation Report
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#A7B0C8', marginTop: '0.2rem' }}>
                Automated Incident Reconstruction & Correlated Evidence Verification
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.15rem', fontWeight: 700, color: '#00B7FF' }}>
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#00B7FF', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
            1. Executive Incident Summary
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#F5F7FF', lineHeight: 1.65, opacity: 0.9 }}>
            {activeCase.description} The incident commenced with anomalous off-hours internal subnet credential
            brute force attempts targeting account <code style={{ color: '#00B7FF' }}>dev_user41</code>, succeeding
            at 02:17 UTC into an interactive RDP session on workstation <code style={{ color: '#00B7FF' }}>WS-FIN-04</code>.
            Subsequently, obfuscated PowerShell memory dumping was utilized to escalate privileges to NT AUTHORITY\SYSTEM,
            followed by lateral SMB read of restricted financial database <code style={{ color: '#00B7FF' }}>customer_vault_q3.db</code>.
            The data was staged into archive <code style={{ color: '#00B7FF' }}>svchost_upd.zip</code> and exfiltrated to
            external malicious C2 <code style={{ color: '#FF3CAC' }}>198.51.100.42:8443</code>. Anti-forensic log wiping
            was attempted prior to session termination.
          </p>
        </div>

        {/* Section 2: Key Correlated Findings */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#00B7FF', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            2. Correlated Forensic Findings & MITRE ATT&CK Mapping
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {findings.map((f, index) => (
              <div
                key={f.finding_id}
                style={{
                  background: '#151F46',
                  border: '1px solid #24315C',
                  borderRadius: '10px',
                  padding: '1.35rem',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', color: '#00B7FF', fontWeight: 600 }}>
                      FINDING #{index + 1}:
                    </span>
                    <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#F5F7FF' }}>
                      {f.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Badge variant={f.severity} size="sm">{f.severity}</Badge>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#4DEBFF', fontWeight: 600 }}>
                      Confidence: {(f.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#A7B0C8', lineHeight: 1.55, marginBottom: '0.85rem' }}>
                  {f.description}
                </p>

                {/* MITRE Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  {f.mitre_tactics.map((tac) => (
                    <span
                      key={tac}
                      style={{
                        fontSize: '0.7rem',
                        background: 'rgba(123, 44, 255, 0.12)',
                        border: '1px solid rgba(123, 44, 255, 0.3)',
                        color: '#D62CFF',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 600
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
                        background: 'rgba(214, 44, 255, 0.12)',
                        border: '1px solid rgba(214, 44, 255, 0.3)',
                        color: '#FF3CAC',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontFamily: 'JetBrains Mono, monospace',
                        fontWeight: 600
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Recommendation */}
                <div
                  style={{
                    background: 'rgba(22, 119, 255, 0.08)',
                    borderLeft: '3px solid #00B7FF',
                    padding: '0.6rem 0.85rem',
                    fontSize: '0.8rem',
                    color: '#F5F7FF',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '0.5rem',
                    borderRadius: '0 6px 6px 0'
                  }}
                >
                  <strong style={{ color: '#00B7FF' }}>Remediation:</strong> {f.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Evidence Chain of Custody */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#00B7FF', marginBottom: '0.85rem', letterSpacing: '-0.01em' }}>
            3. Supporting Evidence Integrity & Chain of Custody
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #24315C', color: '#A7B0C8' }}>
                <th style={{ padding: '0.75rem 0.6rem' }}>Evidence ID</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Filename & Source</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Type</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>SHA-256 Hash</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Verification</th>
              </tr>
            </thead>
            <tbody>
              {evidenceList.map((e) => (
                <tr key={e.evidence_id} style={{ borderBottom: '1px solid #24315C' }}>
                  <td style={{ padding: '0.75rem 0.6rem', fontFamily: 'JetBrains Mono, monospace', color: '#00B7FF', fontWeight: 600 }}>
                    {e.evidence_id}
                  </td>
                  <td style={{ padding: '0.75rem 0.6rem', color: '#F5F7FF' }}>
                    <div><strong>{e.filename}</strong></div>
                    <div style={{ fontSize: '0.7rem', color: '#A7B0C8' }}>{e.source}</div>
                  </td>
                  <td style={{ padding: '0.75rem 0.6rem' }}>
                    <Badge variant="default" size="sm">{e.type}</Badge>
                  </td>
                  <td style={{ padding: '0.75rem 0.6rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#A7B0C8' }}>
                    {e.hash.substring(0, 16)}...{e.hash.substring(e.hash.length - 8)}
                  </td>
                  <td style={{ padding: '0.75rem 0.6rem' }}>
                    <span style={{ color: '#4DEBFF', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
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
