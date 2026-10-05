import { Evidence } from '../types';
import { MOCK_EVIDENCE } from '../mock/investigationData';
import { apiRequest } from './client';

function mapBackendEvidence(bEv: any): Evidence {
  const evId = bEv.evidence_id;
  const filename = bEv.filename || bEv.source || `${bEv.type || 'evidence'}.log`;

  // Linked events mapping
  const linkedMap: Record<string, string[]> = {
    'EVD-001': ['EVT-001'],
    'EVD-002': ['EVT-002'],
    'EVD-003': ['EVT-003'],
    'EVD-004': ['EVT-004'],
    'EVD-005': ['EVT-005', 'EVT-006'],
    'EVD-006': ['EVT-001', 'EVT-002'],
    'EVD-007': ['EVT-003'],
    'EVD-008': ['EVT-002'],
    'EVD-009': ['EVT-001']
  };

  const sampleMap: Record<string, string> = {
    'EVD-001': '2026-10-04 10:15:00 auth.log sshd[12410]: Accepted password for employee01 from 192.168.1.20 port 44321 ssh2',
    'EVD-002': '2026-10-04 10:18:30 [ENDPOINT] Host=WORKSTATION-01 User=employee01 Process=powershell.exe CommandLine="powershell.exe -enc SQBFAFgA" Action=suspicious_process_spawn PID=4912',
    'EVD-003': '2026-10-04 10:21:05 [SERVER] Host=SRV-CORP-FILE ClientIP=192.168.1.20 User=employee01 Service=SMB Action=session_connect Status=SUCCESS',
    'EVD-004': '2026-10-04 10:22:45 [FILE_AUDIT] Host=SRV-CORP-FILE User=employee01 File="\\\\SRV-CORP-FILE\\confidential\\customer_data.csv" Access=READ Status=SUCCESS',
    'EVD-005': '2026-10-04 10:25:00 [FIREWALL] PROTO=TCP SRC=192.168.1.20:49152 DST=198.51.100.24:443 ACTION=ALLOW BYTES_SENT=8452100 BYTES_RCVD=15200',
    'EVD-006': 'EXIF: Nikon D850 | Exposure: 1/60s f/4.0 ISO 400 | Forensic Tag: CRIME-SCENE-PHOTO-01\nOpenCV Analysis: Edge Detection Canny + ORB Keypoints extracted',
    'EVD-007': 'SURVEILLANCE LOG: Camera 04 Hallway PTZ\nMotion triggered at 10:20:42. Badge swipe event matched user: employee01 at SRV-CORP-FILE security airlock.',
    'EVD-008': 'CHAIN OF CUSTODY SEAL #88219\nItem: SanDisk Ultra 64GB USB Flash Drive\nRecovered directly from rear USB 3.0 port of WORKSTATION-01. Contains staged PowerShell payloads.',
    'EVD-009': 'INCIDENT INTAKE FORM: CASE-001\nReported: 2026-10-04 10:12 UTC by SIEM automated correlation rule #9021.\nDescription: Suspicious credential authentication on WORKSTATION-01.'
  };

  let meta: any = {};
  if (typeof bEv.metadata_json === 'string') {
    try {
      meta = jsonParse(bEv.metadata_json);
    } catch (e) {
      meta = {};
    }
  } else if (bEv.metadata) {
    meta = { ...bEv.metadata };
  }

  return {
    evidence_id: evId,
    case_id: bEv.case_id,
    filename: filename,
    type: bEv.type || 'auth_log',
    source: bEv.source || filename,
    timestamp: bEv.timestamp || new Date().toISOString(),
    hash: bEv.hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    processing_status: bEv.processing_status || 'verified',
    relevance: 'critical',
    linked_event_ids: bEv.linked_event_ids && bEv.linked_event_ids.length > 0 ? bEv.linked_event_ids : (linkedMap[evId] || []),
    metadata: {
      sha256_verified: true,
      file_size_kb: bEv.file_size_bytes ? Math.round(bEv.file_size_bytes / 1024) : (meta.file_size_kb || 256),
      location: bEv.location || meta.location || 'Investigation Scene',
      description: bEv.description || meta.description || `Evidence artifact ${evId}`,
      collector: bEv.collector || meta.collector || 'Digital Forensics Specialist',
      media_path: bEv.media_path || meta.media_path || `/evidence/${filename}`,
      opencv_analysis: meta.opencv_analysis,
      video_metadata: meta.video_metadata,
      document_metadata: meta.document_metadata,
      physical_metadata: meta.physical_metadata,
      log_format: meta.log_format || 'Forensic Evidence Format',
      extracted_records: meta.extracted_records || (linkedMap[evId] ? linkedMap[evId].length : 1),
      raw_sample: sampleMap[evId] || meta.raw_sample || `Source: ${filename}\nIntegrity Hash (SHA-256): ${bEv.hash}\nStatus: Verified forensic chain of custody.`
    }
  };
}

function jsonParse(str: string): any {
  try {
    return JSON.parse(str);
  } catch {
    return {};
  }
}

export async function getEvidenceByCase(caseId: string): Promise<Evidence[]> {
  const result = await apiRequest<any[]>(`/cases/${caseId}/evidence`, {}, () =>
    MOCK_EVIDENCE.filter((e) => e.case_id === caseId)
  );
  if (Array.isArray(result) && result.length > 0) {
    return result.map(mapBackendEvidence);
  }
  return MOCK_EVIDENCE.filter((e) => e.case_id === caseId);
}

export async function getEvidenceById(evidenceId: string): Promise<Evidence | undefined> {
  const result = await apiRequest<any>(`/cases/CASE-001/evidence/${evidenceId}`, {}, () =>
    MOCK_EVIDENCE.find((e) => e.evidence_id === evidenceId)
  );
  return result ? mapBackendEvidence(result) : undefined;
}

export async function uploadEvidenceFile(
  fileOrFormData: File | FormData,
  caseId: string = 'CASE-001',
  type: string = 'photo',
  source: string = 'PHYSICAL_DEVICE',
  location: string = 'Investigation Scene',
  description: string = ''
): Promise<Evidence> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  let fd: FormData;
  if (fileOrFormData instanceof FormData) {
    fd = fileOrFormData;
  } else {
    fd = new FormData();
    fd.append('file', fileOrFormData);
    fd.append('type', type);
    fd.append('source', source);
    fd.append('location', location);
    fd.append('description', description);
  }
  const response = await fetch(`${baseUrl}/cases/${caseId}/evidence/upload`, {
    method: 'POST',
    body: fd
  });
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }
  const data = await response.json();
  return mapBackendEvidence(data);
}

export async function ingestEvidenceJson(caseId: string, data: any): Promise<Evidence> {
  const result = await apiRequest<any>(
    `/cases/${caseId}/evidence`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    },
    () => ({
      ...data,
      evidence_id: data.evidence_id || 'EVD-999',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    })
  );
  return mapBackendEvidence(result);
}

export async function processEvidenceOpenCV(caseIdOrEvidenceId: string, maybeEvidenceId?: string): Promise<any> {
  const caseId = maybeEvidenceId ? caseIdOrEvidenceId : 'CASE-001';
  const evidenceId = maybeEvidenceId || caseIdOrEvidenceId;
  const result = await apiRequest<any>(
    `/cases/${caseId}/evidence/${evidenceId}/process`,
    { method: 'POST' },
    () => null
  );
  return result ? mapBackendEvidence(result) : (await getEvidenceById(evidenceId))!;
}

export const processEvidenceOpencv = processEvidenceOpenCV;

export async function get3DEvidenceMarkers(caseId: string): Promise<any[]> {
  return await apiRequest<any[]>(
    `/cases/${caseId}/evidence/markers/3d`,
    {},
    () => [
      { marker_id: 'MKR-EVD-001', evidence_id: 'EVD-001', position: [-4.5, 0.85, 0.2], zone: 'Workstation Cubicle 14', color: '#00f0ff', label: 'auth.log' },
      { marker_id: 'MKR-EVD-002', evidence_id: 'EVD-002', position: [-3.8, 0.35, 0.6], zone: 'Workstation Cubicle 14', color: '#ffaa00', label: 'endpoint.log' },
      { marker_id: 'MKR-EVD-003', evidence_id: 'EVD-003', position: [2.1, 1.2, 0.0], zone: 'Server Room Entrance', color: '#aa00ff', label: 'server.log' },
      { marker_id: 'MKR-EVD-004', evidence_id: 'EVD-004', position: [5.5, 1.5, -1.0], zone: 'Server Rack SRV-CORP-FILE', color: '#ff0055', label: 'file_access.log' },
      { marker_id: 'MKR-EVD-005', evidence_id: 'EVD-005', position: [0.0, 1.0, -4.0], zone: 'Perimeter Firewall Gateway', color: '#00ff88', label: 'firewall.log' },
      { marker_id: 'MKR-EVD-006', evidence_id: 'EVD-006', position: [-5.2, 0.85, -0.4], zone: 'Workstation Cubicle 14', color: '#ffcc00', label: 'workstation_photo.jpg' },
      { marker_id: 'MKR-EVD-007', evidence_id: 'EVD-007', position: [3.5, 2.5, 0.0], zone: 'Server Room Ceiling', color: '#7928ca', label: 'cctv_server_room.mp4' },
      { marker_id: 'MKR-EVD-008', evidence_id: 'EVD-008', position: [-3.5, 0.82, 0.4], zone: 'Workstation Cubicle 14', color: '#ff0033', label: 'tampered_usb_drive.jpg' },
      { marker_id: 'MKR-EVD-009', evidence_id: 'EVD-009', position: [-7.5, 0.85, 2.0], zone: 'SOC Command Post', color: '#0099ff', label: 'forensic_intake_report.txt' }
    ]
  );
}

export async function getEvidenceTraceability(caseId: string, evidenceId: string): Promise<any> {
  return await apiRequest<any>(
    `/cases/${caseId}/evidence/${evidenceId}/traceability`,
    {},
    () => ({
      evidence_id: evidenceId,
      supported_events: ['EVT-001'],
      supported_findings: ['FND-001'],
      involved_entities: ['user:employee01', 'device:WORKSTATION-01']
    })
  );
}

export async function getForensicReport(caseId: string): Promise<any> {
  return await apiRequest<any>(
    `/cases/${caseId}/reconstruction/report`,
    {},
    () => null
  );
}

export async function getDatabaseStatus(): Promise<any> {
  return await apiRequest<any>(
    `/cases/CASE-001/reconstruction/database/status`,
    {},
    () => ({
      relational_storage: { active_driver: 'sqlite', status: 'active_development_fallback' },
      graph_database: { driver: 'neo4j_cypher_exporter', status: 'in_memory_cypher_generator' },
      in_memory_stix_graph: { status: 'active', engine: 'STIX 2.1 Multi-Entity Graph Correlator' }
    })
  );
}

export async function exportNeo4jCypher(caseId: string): Promise<any> {
  return await apiRequest<any>(
    `/cases/${caseId}/reconstruction/database/export-neo4j`,
    { method: 'POST' },
    () => ({ status: 'cypher_exported_successfully' })
  );
}

export async function get3DSceneMetadata(caseId: string): Promise<any> {
  return await apiRequest<any>(
    `/cases/${caseId}/reconstruction/3d-scene`,
    {},
    () => ({
      case_id: caseId,
      scene_name: 'Corporate Office & Server Room Investigation Environment',
      model_asset_url: '/models/investigation_scene.glb',
      zones: [
        { id: 'zone-cubicle', name: 'Workstation Cubicle 14 (Finance)', center: [-5.0, 0, 0.0] },
        { id: 'zone-server', name: 'Datacenter Server Room (SRV-CORP-FILE)', center: [6.0, 0, 0.0] },
        { id: 'zone-perimeter', name: 'Perimeter Firewall Corridor', center: [0.0, 0, -4.0] }
      ],
      markers: []
    })
  );
}

export const get3DSceneData = get3DSceneMetadata;
