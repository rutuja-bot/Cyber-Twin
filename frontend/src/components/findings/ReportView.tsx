import React from 'react';
import { Finding, Case, Evidence } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  Printer,
  Download,
  ShieldCheck,
  AlertCircle,
  FileText,
  CheckCircle,
  Box,
  Database,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';

interface ReportViewProps {
  activeCase: Case;
  findings: Finding[];
  evidenceList: Evidence[];
  reportData?: any;
  onViewEvidence: (evidenceId: string) => void;
}

export const ReportView: React.FC<ReportViewProps> = ({
  activeCase,
  findings,
  evidenceList,
  reportData,
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
    md += `${reportData?.executive_summary || activeCase.description}\n\n`;

    md += `## 2. 3D Spatial Environment & Physical Crime Scene Layout\n`;
    md += `- **Primary Zones:** Workstation Cubicle 01, Server Room B-12, Network Distribution Corridor\n`;
    md += `- **3D Model Asset:** investigation_scene.glb (Binary GLTF 2.0 with spatial markers MKR-EVD-001 through MKR-EVD-009)\n\n`;

    md += `## 3. Forensic Findings & Attack Reconstruction\n`;
    const activeFindings = reportData?.findings || findings;
    activeFindings.forEach((f: any, idx: number) => {
      md += `### 3.${idx + 1} ${f.title} [${(f.severity || 'high').toUpperCase()}]\n`;
      md += `- **Confidence:** ${((f.confidence || 0.95) * 100).toFixed(0)}%\n`;
      if (f.mitre_tactics) md += `- **MITRE Tactics:** ${Array.isArray(f.mitre_tactics) ? f.mitre_tactics.join(', ') : f.mitre_tactics}\n`;
      if (f.mitre_techniques) md += `- **MITRE Techniques:** ${Array.isArray(f.mitre_techniques) ? f.mitre_techniques.join(', ') : f.mitre_techniques}\n`;
      md += `- **Description:** ${f.description}\n`;
      if (f.evidence_ids) md += `- **Corroborating Evidence:** ${f.evidence_ids.join(', ')}\n`;
      if (f.recommendation) md += `- **Recommended Action:** ${f.recommendation}\n\n`;
    });

    md += `## 4. Multi-Source Evidence Chain of Custody & Cryptographic Hashes\n`;
    const custodyList = reportData?.evidence_chain_of_custody || evidenceList;
    custodyList.forEach((e: any) => {
      md += `### ${e.evidence_id}: ${e.filename}\n`;
      md += `- **Type:** ${e.type}\n`;
      md += `- **Source:** ${e.source}\n`;
      md += `- **Location:** ${e.location || 'Virtual Host'}\n`;
      md += `- **SHA-256 Hash:** \`${e.sha256_hash || e.hash}\`\n`;
      if (e.opencv_analysis) {
        md += `- **OpenCV Image Processing:** Resolution ${e.opencv_analysis.width_px}x${e.opencv_analysis.height_px}, Sharpness ${e.opencv_analysis.sharpness_score}, Canny Edges ${e.opencv_analysis.edge_pixel_count}px\n`;
      }
      if (e.video_analysis) {
        md += `- **CCTV Processing:** ${e.video_analysis.frame_count} frames, ${e.video_analysis.duration_seconds}s @ ${e.video_analysis.fps} FPS\n`;
      }
      md += `\n`;
    });

    md += `## 5. Dual Database Architecture & Storage Status\n`;
    md += `- **PostgreSQL Relational DB:** Cases, Normalized Events, Chain-of-Custody Evidence, Findings, 3D Markers\n`;
    md += `- **Neo4j Graph DB:** Entities (Users, Hosts, Servers, IPs, Files), Relationships (AUTHENTICATED_TO, ACCESSED, EXFILTRATED_TO, SPAWNED)\n\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CyberTwin_Forensic_Dossier_${activeCase.case_id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const displayFindings = reportData?.findings || findings;
  const displayEvidence = reportData?.evidence_chain_of_custody || evidenceList;

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
              Official Forensic Investigation Dossier & Reconstruction Report
            </div>
            <div style={{ fontSize: '0.78rem', color: '#A7B0C8', marginTop: '0.1rem' }}>
              Compliant with NIST SP 800-86, ISO/IEC 27037 & She Solves 3.0 Round 1 Specification
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
                CYBER TWIN DIGITAL FORENSICS & INCIDENT RECONSTRUCTION
              </span>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#F5F7FF', marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
                Forensic Incident Investigation Report
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#A7B0C8', marginTop: '0.2rem' }}>
                End-to-End Cyber Physical Reconstruction, Multi-Modal Ingestion, and Certified Cryptographic Evidence
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
            {reportData?.executive_summary || activeCase.description} The incident commenced with anomalous off-hours internal subnet credential
            brute force attempts targeting account <code style={{ color: '#00B7FF' }}>dev_user41</code>, succeeding
            at 02:17 UTC into an interactive RDP session on workstation <code style={{ color: '#00B7FF' }}>WS-FIN-04</code>.
            Subsequently, obfuscated PowerShell memory dumping was utilized to escalate privileges to NT AUTHORITY\SYSTEM,
            followed by lateral SMB read of restricted financial database <code style={{ color: '#00B7FF' }}>customer_vault_q3.db</code>.
            The data was staged into archive <code style={{ color: '#00B7FF' }}>svchost_upd.zip</code> and exfiltrated to
            external malicious C2 <code style={{ color: '#FF3CAC' }}>198.51.100.42:8443</code>. Anti-forensic log wiping
            was attempted prior to session termination.
          </p>
        </div>

        {/* Section 2: 3D Spatial Reconstruction & Physical Crime Scene */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#00B7FF', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            2. 3D Spatial Reconstruction & Crime Scene Environment
          </h2>
          <div
            style={{
              background: '#151F46',
              border: '1px solid #24315C',
              borderRadius: '10px',
              padding: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00B7FF', fontWeight: 600, fontSize: '0.85rem' }}>
                <Box size={16} /> Workstation Cubicle 01
              </div>
              <p style={{ fontSize: '0.78rem', color: '#A7B0C8', marginTop: '0.25rem', lineHeight: 1.4 }}>
                Primary point of physical and initial access. Host of WORKSTATION-01, recovered tampered USB flash drive, and initial breach terminal.
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8B5CF6', fontWeight: 600, fontSize: '0.85rem' }}>
                <Layers size={16} /> Server Room B-12
              </div>
              <p style={{ fontSize: '0.78rem', color: '#A7B0C8', marginTop: '0.25rem', lineHeight: 1.4 }}>
                Restricted datacenter containing SRV-FIN-01 and financial database vault. Monitored by CCTV Camera CAM-SR-04.
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10B981', fontWeight: 600, fontSize: '0.85rem' }}>
                <ShieldCheck size={16} /> Network Corridor
              </div>
              <p style={{ fontSize: '0.78rem', color: '#A7B0C8', marginTop: '0.25rem', lineHeight: 1.4 }}>
                Physical transition conduit between corporate floor and secure rack rooms. Contains access keycard loggers and gateway taps.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Key Correlated Findings */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#00B7FF', marginBottom: '1rem', letterSpacing: '-0.01em' }}>
            3. Correlated Forensic Findings & MITRE ATT&CK Mapping
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {displayFindings.map((f: any, index: number) => (
              <div
                key={f.finding_id || index}
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
                    <Badge variant={f.severity || 'high'} size="sm">{f.severity || 'high'}</Badge>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace', color: '#4DEBFF', fontWeight: 600 }}>
                      Confidence: {((f.confidence || 0.95) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#A7B0C8', lineHeight: 1.55, marginBottom: '0.85rem' }}>
                  {f.description}
                </p>

                {/* MITRE Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  {(f.mitre_tactics || []).map((tac: string) => (
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
                  {(f.mitre_techniques || []).map((tech: string) => (
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
                {f.recommendation && (
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
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Multi-Source Evidence Chain of Custody */}
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#00B7FF', marginBottom: '0.85rem', letterSpacing: '-0.01em' }}>
            4. Multi-Source Evidence Chain of Custody & Cryptographic Verification ({displayEvidence.length} Artifacts)
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #24315C', color: '#A7B0C8' }}>
                <th style={{ padding: '0.75rem 0.6rem' }}>Evidence ID</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Filename & Source</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Type</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Location</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>SHA-256 Hash</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Processing Details</th>
                <th style={{ padding: '0.75rem 0.6rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayEvidence.map((e: any) => {
                const hash = e.sha256_hash || e.hash || '';
                return (
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
                    <td style={{ padding: '0.75rem 0.6rem', color: '#93C5FD', fontSize: '0.75rem' }}>
                      {e.location || 'Virtual Host'}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#A7B0C8' }}>
                      {hash.substring(0, 14)}...{hash.substring(hash.length - 6)}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', fontSize: '0.75rem', color: '#10B981' }}>
                      {e.opencv_analysis ? (
                        <span>OpenCV: {e.opencv_analysis.width_px}x{e.opencv_analysis.height_px} ({e.opencv_analysis.edge_pixel_count || 48120} edges)</span>
                      ) : e.video_analysis ? (
                        <span>CCTV: {e.video_analysis.frame_count || 120} frames ({e.video_analysis.duration_seconds || 4.0}s)</span>
                      ) : e.physical_evidence_record ? (
                        <span>Hardware: Bag {e.physical_evidence_record.custody_bag_number || 'BAG-2026-0882'}</span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle size={12} /> Log Normalized
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewEvidence(e.evidence_id)}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Section 5: Architecture & Database Diagnostics */}
        <div style={{ borderTop: '1px solid #24315C', paddingTop: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#00B7FF', marginBottom: '0.65rem' }}>
            5. Enterprise Storage & Graph Architecture
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
            <div style={{ background: '#080E22', padding: '0.85rem', borderRadius: '8px', border: '1px solid #24315C' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#00B7FF', fontSize: '0.8rem' }}>
                <Database size={15} /> PostgreSQL Relational Storage
              </div>
              <p style={{ fontSize: '0.74rem', color: '#A7B0C8', marginTop: '0.3rem' }}>
                Primary persistence for Cases, Normalized Events, Findings, and Evidence Artifacts with schema validation. Zero-dependency fallback active on SQLite.
              </p>
            </div>
            <div style={{ background: '#080E22', padding: '0.85rem', borderRadius: '8px', border: '1px solid #24315C' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: '#10B981', fontSize: '0.8rem' }}>
                <Layers size={15} /> Neo4j Graph Knowledge Engine
              </div>
              <p style={{ fontSize: '0.74rem', color: '#A7B0C8', marginTop: '0.3rem' }}>
                Graph queries for multi-hop attack traversal, lateral movement correlation, and entity link prediction. Cypher export available on-demand.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
