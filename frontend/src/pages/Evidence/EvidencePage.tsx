import React, { useState, useRef } from 'react';
import {
  Search,
  ShieldCheck,
  Hash,
  Upload,
  Plus,
  Image as ImageIcon,
  Video,
  Box,
  FileText,
  Terminal,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useInvestigation } from '../../context/InvestigationContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EvidenceDetailModal } from '../../components/evidence/EvidenceDetailModal';
import { Modal } from '../../components/common/Modal';
import { Evidence } from '../../types';
import { uploadEvidenceFile, ingestEvidenceJson } from '../../api/evidence';

export const EvidencePage: React.FC = () => {
  const { evidenceList, selectedEvidence, setSelectedEvidence, refreshData } = useInvestigation();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [relevanceFilter, setRelevanceFilter] = useState<string>('all');
  const [activeModalEvidence, setActiveModalEvidence] = useState<Evidence | null>(selectedEvidence);

  // Ingest Modal state
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [ingestFilename, setIngestFilename] = useState('');
  const [ingestType, setIngestType] = useState('photo');
  const [ingestSource, setIngestSource] = useState('PHYSICAL_SECURITY_CAMERA');
  const [ingestLocation, setIngestLocation] = useState('Room B-12 Server Room');
  const [ingestDescription, setIngestDescription] = useState('Digital forensic capture for incident investigation.');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getEvidenceCategory = (e: Evidence): string => {
    const t = e.type.toLowerCase();
    const fn = e.filename.toLowerCase();
    if (t === 'photo' || t === 'image' || fn.endsWith('.jpg') || fn.endsWith('.png')) return 'photo';
    if (t === 'video' || t === 'cctv' || fn.endsWith('.mp4')) return 'video';
    if (t === 'physical' || fn.includes('usb')) return 'physical';
    if (t === 'document' || t === 'report' || fn.endsWith('.txt') || fn.endsWith('.pdf')) return 'document';
    return 'cyber';
  };

  const filteredEvidence = evidenceList.filter((e) => {
    const matchesSearch =
      e.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.evidence_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.location && e.location.toLowerCase().includes(searchTerm.toLowerCase()));

    const cat = getEvidenceCategory(e);
    const matchesCategory =
      categoryFilter === 'all' ||
      (categoryFilter === 'cyber' && cat === 'cyber') ||
      (categoryFilter === 'photo' && cat === 'photo') ||
      (categoryFilter === 'video' && cat === 'video') ||
      (categoryFilter === 'physical' && cat === 'physical') ||
      (categoryFilter === 'document' && cat === 'document');

    const matchesRelevance = relevanceFilter === 'all' || e.relevance === relevanceFilter;
    return matchesSearch && matchesCategory && matchesRelevance;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadStatus(null);

    try {
      if (selectedFile) {
        // Multipart file upload with backend OpenCV processing
        const res = await uploadEvidenceFile(
          selectedFile,
          'CASE-001',
          ingestType,
          ingestSource,
          ingestLocation,
          ingestDescription
        );
        setUploadStatus({
          success: true,
          message: `Evidence ${res.evidence_id} successfully ingested and verified with SHA-256!`
        });
      } else {
        // Metadata / JSON ingest
        const res = await ingestEvidenceJson('CASE-001', {
          evidence_id: `EVD-0${evidenceList.length + 1}`,
          filename: ingestFilename || 'investigation_evidence.dat',
          type: ingestType,
          source: ingestSource,
          location: ingestLocation,
          description: ingestDescription,
          collector: 'Forensic Agent A. Thorne',
          processing_status: 'verified',
          relevance: 'high'
        });
        setUploadStatus({
          success: true,
          message: `Evidence ${res.evidence_id || 'item'} registered into Chain of Custody!`
        });
      }

      if (refreshData) {
        await refreshData();
      }
      setTimeout(() => {
        setIsIngestModalOpen(false);
        setUploadStatus(null);
        setSelectedFile(null);
        setIngestFilename('');
      }, 1500);
    } catch (err: any) {
      console.error('Evidence upload error:', err);
      setUploadStatus({
        success: false,
        message: err.message || 'Failed to ingest evidence artifact.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'photo':
        return <ImageIcon size={14} color="#00B7FF" />;
      case 'video':
        return <Video size={14} color="#10B981" />;
      case 'physical':
        return <Box size={14} color="#F59E0B" />;
      case 'document':
        return <FileText size={14} color="#8B5CF6" />;
      default:
        return <Terminal size={14} color="#3B82F6" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          borderBottom: '1px solid #24315C',
          paddingBottom: '1.25rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F5F7FF', letterSpacing: '-0.02em' }}>
            Evidence Vault & Multimedia Intake
          </h1>
          <p style={{ fontSize: '0.825rem', color: '#A7B0C8', marginTop: '0.2rem' }}>
            Multi-source forensic artifacts: Cybersecurity Logs, Scene Photos, CCTV Video, Physical Hardware, and Intake Reports
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsIngestModalOpen(true)}
          >
            <Plus size={14} style={{ marginRight: '0.35rem' }} /> Ingest Evidence
          </Button>
          <Badge variant="verified">
            <ShieldCheck size={14} /> SHA-256 Certified
          </Badge>
          <span style={{ fontSize: '0.78rem', color: '#717E9E' }}>
            {evidenceList.length} artifacts cataloged
          </span>
        </div>
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          borderBottom: '1px solid #1E293B',
          paddingBottom: '0.5rem'
        }}
      >
        {[
          { id: 'all', label: 'All Artifacts', count: evidenceList.length },
          {
            id: 'cyber',
            label: 'Cybersecurity Logs',
            count: evidenceList.filter((e) => getEvidenceCategory(e) === 'cyber').length
          },
          {
            id: 'photo',
            label: 'Scene Photos (OpenCV)',
            count: evidenceList.filter((e) => getEvidenceCategory(e) === 'photo').length
          },
          {
            id: 'video',
            label: 'CCTV Video',
            count: evidenceList.filter((e) => getEvidenceCategory(e) === 'video').length
          },
          {
            id: 'physical',
            label: 'Physical Hardware',
            count: evidenceList.filter((e) => getEvidenceCategory(e) === 'physical').length
          },
          {
            id: 'document',
            label: 'Reports & Docs',
            count: evidenceList.filter((e) => getEvidenceCategory(e) === 'document').length
          }
        ].map((tab) => {
          const isActive = categoryFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              style={{
                background: isActive ? '#151F46' : 'transparent',
                color: isActive ? '#00B7FF' : '#717E9E',
                border: isActive ? '1px solid #00B7FF' : '1px solid transparent',
                borderRadius: '6px',
                padding: '0.4rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: isActive ? 'rgba(0, 183, 255, 0.2)' : '#101936',
                  color: isActive ? '#4DEBFF' : '#5A6689',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  fontSize: '0.7rem'
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.85rem',
          alignItems: 'center',
          background: '#101936',
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          border: '1px solid #24315C',
          boxShadow: '0 4px 20px rgba(5, 8, 22, 0.4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
          <Search size={16} color="#00B7FF" />
          <input
            type="text"
            placeholder="Search by ID, file name, source host, location, or SHA-256..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#F5F7FF',
              fontSize: '0.84rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* Relevance Filter */}
          <select
            value={relevanceFilter}
            onChange={(e) => setRelevanceFilter(e.target.value)}
            style={{
              background: '#080E22',
              border: '1px solid #24315C',
              color: '#F5F7FF',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.78rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Relevance</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Professional Evidence Table */}
      <div style={{ background: '#101936', border: '1px solid #24315C', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(5, 8, 22, 0.4)' }}>
        <table className="forensic-table">
          <thead>
            <tr>
              <th style={{ width: '95px' }}>Evidence ID</th>
              <th>Source & Filename</th>
              <th style={{ width: '130px' }}>Type / Category</th>
              <th style={{ width: '150px' }}>Location / Zone</th>
              <th style={{ width: '140px' }}>Timestamp (UTC)</th>
              <th>SHA-256 Hash</th>
              <th style={{ width: '90px' }}>Status</th>
              <th style={{ width: '110px' }}>Linked Events</th>
              <th style={{ width: '90px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvidence.map((e) => {
              const cat = getEvidenceCategory(e);
              return (
                <tr key={e.evidence_id}>
                  {/* ID */}
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00B7FF', fontWeight: 600 }}>
                    {e.evidence_id}
                  </td>

                  {/* Source & Filename */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      {getCategoryIcon(cat)}
                      <div style={{ fontWeight: 600, color: '#F5F7FF' }}>{e.filename}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#717E9E', marginLeft: '1.35rem' }}>{e.source}</div>
                  </td>

                  {/* Type / Category */}
                  <td>
                    <Badge variant="default" size="sm">
                      {e.type.replace(/_/g, ' ')}
                    </Badge>
                  </td>

                  {/* Location / Zone */}
                  <td>
                    {e.location ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: '#93C5FD' }}>
                        <MapPin size={12} color="#00B7FF" />
                        <span>{e.location}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#5A6689' }}>Virtual Host</span>
                    )}
                  </td>

                  {/* Timestamp */}
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem', color: '#A7B0C8' }}>
                    {e.timestamp.replace('T', ' ').replace('Z', '')}
                  </td>

                  {/* SHA-256 */}
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem', color: '#A7B0C8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Hash size={12} color="#00B7FF" />
                      <span>{e.hash.substring(0, 14)}...{e.hash.substring(e.hash.length - 6)}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <Badge variant={e.processing_status} size="sm">{e.processing_status}</Badge>
                  </td>

                  {/* Linked Events */}
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {e.linked_event_ids.map((evtId) => (
                        <span
                          key={evtId}
                          style={{
                            fontSize: '0.68rem',
                            fontFamily: 'JetBrains Mono, monospace',
                            background: '#151F46',
                            border: '1px solid #24315C',
                            color: '#4DEBFF',
                            padding: '0.08rem 0.35rem',
                            borderRadius: '4px'
                          }}
                        >
                          {evtId}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Action */}
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveModalEvidence(e)}
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

      {/* Evidence Detail Modal */}
      <EvidenceDetailModal
        evidence={activeModalEvidence}
        onClose={() => setActiveModalEvidence(null)}
      />

      {/* Evidence Ingest / Upload Modal */}
      <Modal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        title="Ingest Forensic Evidence Artifact"
        subtitle="Secure intake pipeline supporting digital logs, crime scene photos, CCTV, physical hardware, and documents"
        maxWidth="600px"
      >
        <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {uploadStatus && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: uploadStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: `1px solid ${uploadStatus.success ? '#10B981' : '#EF4444'}`,
                color: uploadStatus.success ? '#10B981' : '#EF4444',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.825rem'
              }}
            >
              {uploadStatus.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{uploadStatus.message}</span>
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.78rem', color: '#A7B0C8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Upload Evidence File (Optional - or specify metadata below)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setIngestFilename(e.target.files[0].name);
                }
              }}
              style={{
                width: '100%',
                background: '#080E22',
                border: '1px solid #24315C',
                padding: '0.5rem',
                borderRadius: '6px',
                color: '#F5F7FF',
                fontSize: '0.8rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#A7B0C8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Artifact Type
              </label>
              <select
                value={ingestType}
                onChange={(e) => setIngestType(e.target.value)}
                style={{
                  width: '100%',
                  background: '#080E22',
                  border: '1px solid #24315C',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  color: '#F5F7FF',
                  fontSize: '0.8rem'
                }}
              >
                <option value="photo">Photo / Image (OpenCV processing)</option>
                <option value="video">CCTV / Video</option>
                <option value="physical">Physical Hardware / Media</option>
                <option value="document">Report / Document</option>
                <option value="auth_log">Authentication Log</option>
                <option value="sysmon">Sysmon Endpoint Log</option>
                <option value="pcap">PCAP Packet Capture</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: '#A7B0C8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Source System / Camera ID
              </label>
              <input
                type="text"
                value={ingestSource}
                onChange={(e) => setIngestSource(e.target.value)}
                style={{
                  width: '100%',
                  background: '#080E22',
                  border: '1px solid #24315C',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  color: '#F5F7FF',
                  fontSize: '0.8rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#A7B0C8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Physical / Spatial Location Zone
            </label>
            <input
              type="text"
              value={ingestLocation}
              onChange={(e) => setIngestLocation(e.target.value)}
              placeholder="e.g. Workstation-01 Desk, Server Room Rack B-12"
              style={{
                width: '100%',
                background: '#080E22',
                border: '1px solid #24315C',
                padding: '0.5rem',
                borderRadius: '6px',
                color: '#F5F7FF',
                fontSize: '0.8rem'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#A7B0C8', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
              Forensic Custody Description
            </label>
            <textarea
              value={ingestDescription}
              onChange={(e) => setIngestDescription(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                background: '#080E22',
                border: '1px solid #24315C',
                padding: '0.5rem',
                borderRadius: '6px',
                color: '#F5F7FF',
                fontSize: '0.8rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => setIsIngestModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isUploading}
            >
              <Upload size={14} style={{ marginRight: '0.35rem' }} />
              {isUploading ? 'Ingesting & Hashing...' : 'Ingest & Certify SHA-256'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
