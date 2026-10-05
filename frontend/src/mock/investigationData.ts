import {
  Case,
  Evidence,
  NormalizedEvent,
  Entity,
  Relationship,
  Finding,
  ReplayEvent,
  InvestigationSummary
} from '../types';

export const MOCK_CASES: Case[] = [
  {
    case_id: 'CASE-001',
    title: 'Unauthorized Access and Exfiltration Incident',
    description: 'Investigation into unauthorized credential access, lateral movement, and data exfiltration across corporate network.',
    incident_type: 'Data Exfiltration / Account Takeover',
    status: 'investigating',
    severity: 'critical',
    created_at: '2026-10-04T10:00:00Z',
    last_activity: '2026-10-04T10:55:00Z',
    investigator: 'Rutuja & Investigation Team',
    evidence_count: 9,
    suspicious_event_count: 6,
    entity_count: 7,
    date_range: {
      start: '2026-10-04T10:15:00Z',
      end: '2026-10-04T10:55:00Z'
    }
  },
  {
    case_id: 'CASE-2026-0882',
    title: 'Suspicious Internal Account Activity & Exfiltration',
    description: 'Anomalous off-hours authentication spike for dev_user41 followed by credential dumping, lateral file access to customer vault DB, and encrypted outbound C2 exfiltration.',
    incident_type: 'Data Exfiltration / Account Takeover',
    status: 'investigating',
    severity: 'critical',
    created_at: '2026-10-04T02:15:00Z',
    last_activity: '2026-10-04T03:05:00Z',
    investigator: 'Agent Person 3 (Forensics Lead)',
    evidence_count: 5,
    suspicious_event_count: 8,
    entity_count: 8,
    date_range: {
      start: '2026-10-04T02:14:00Z',
      end: '2026-10-04T02:55:00Z'
    }
  },
  {
    case_id: 'CASE-2026-0741',
    title: 'Anomalous Lateral Movement & Kerberoasting',
    description: 'Multiple SPN ticket requests across Active Directory domain controllers originating from staging jumpbox.',
    incident_type: 'Credential Access / Lateral Movement',
    status: 'open',
    severity: 'high',
    created_at: '2026-10-03T18:30:00Z',
    last_activity: '2026-10-03T21:40:00Z',
    investigator: 'Agent Person 2 (Forensic Engine)',
    evidence_count: 3,
    suspicious_event_count: 5,
    entity_count: 6,
    date_range: {
      start: '2026-10-03T18:00:00Z',
      end: '2026-10-03T21:30:00Z'
    }
  },
  {
    case_id: 'CASE-2026-0619',
    title: 'Cloud Storage API Token Leak & Abuse',
    description: 'CI/CD pipeline secret exfiltration leading to unauthorized object bucket read attempts from foreign IP addresses.',
    incident_type: 'Cloud Credential Compromise',
    status: 'closed',
    severity: 'medium',
    created_at: '2026-10-01T09:12:00Z',
    last_activity: '2026-10-01T15:20:00Z',
    investigator: 'Agent Person 1 (Backend Systems)',
    evidence_count: 4,
    suspicious_event_count: 3,
    entity_count: 5,
    date_range: {
      start: '2026-10-01T09:00:00Z',
      end: '2026-10-01T15:00:00Z'
    }
  }
];

export const MOCK_EVIDENCE: Evidence[] = [
  {
    evidence_id: 'EVD-001',
    case_id: 'CASE-001',
    filename: 'auth.log',
    type: 'auth_log',
    source: 'auth.log',
    timestamp: '2026-10-04T10:15:00Z',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    processing_status: 'verified',
    relevance: 'critical',
    linked_event_ids: ['EVT-001'],
    metadata: {
      file_size_kb: 256,
      sensor_id: 'AUTH-COLLECTOR-01',
      log_format: 'Normalized Syslog / JSON',
      extracted_records: 1,
      sha256_verified: true,
      raw_sample: '2026-10-04 10:15:00 auth.log sshd[12410]: Accepted password for employee01 from 192.168.1.20 port 44321 ssh2'
    }
  },
  {
    evidence_id: 'EVD-002',
    case_id: 'CASE-001',
    filename: 'endpoint.log',
    type: 'endpoint_log',
    source: 'endpoint.log',
    timestamp: '2026-10-04T10:18:30Z',
    hash: 'a7c93e4d92bc103848a6df2314e82c19f5630a916723c0291e0a442751f891ab',
    processing_status: 'verified',
    relevance: 'critical',
    linked_event_ids: ['EVT-002'],
    metadata: {
      file_size_kb: 312,
      sensor_id: 'ENDPOINT-AGENT-01',
      log_format: 'Normalized Syslog / JSON',
      extracted_records: 1,
      sha256_verified: true,
      raw_sample: '2026-10-04 10:18:30 [ENDPOINT] Host=WORKSTATION-01 User=employee01 Process=powershell.exe CommandLine="powershell.exe -enc SQBFAFgA" Action=suspicious_process_spawn PID=4912'
    }
  },
  {
    evidence_id: 'EVD-003',
    case_id: 'CASE-001',
    filename: 'server.log',
    type: 'server_log',
    source: 'server.log',
    timestamp: '2026-10-04T10:21:05Z',
    hash: '5d41402abc4b2a76b9719d911017c592ef43c683b7f1e56b468571eb67727e02',
    processing_status: 'verified',
    relevance: 'high',
    linked_event_ids: ['EVT-003'],
    metadata: {
      file_size_kb: 180,
      sensor_id: 'SERVER-SMB-MONITOR',
      log_format: 'Normalized Syslog / JSON',
      extracted_records: 1,
      sha256_verified: true,
      raw_sample: '2026-10-04 10:21:05 [SERVER] Host=SRV-CORP-FILE ClientIP=192.168.1.20 User=employee01 Service=SMB Action=session_connect Status=SUCCESS'
    }
  },
  {
    evidence_id: 'EVD-004',
    case_id: 'CASE-001',
    filename: 'file_access.log',
    type: 'file_access_log',
    source: 'file_access.log',
    timestamp: '2026-10-04T10:22:45Z',
    hash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    processing_status: 'verified',
    relevance: 'critical',
    linked_event_ids: ['EVT-004'],
    metadata: {
      file_size_kb: 95,
      sensor_id: 'FILE-AUDIT-AGENT',
      log_format: 'Normalized Syslog / JSON',
      extracted_records: 1,
      sha256_verified: true,
      raw_sample: '2026-10-04 10:22:45 [FILE_AUDIT] Host=SRV-CORP-FILE User=employee01 File="\\\\SRV-CORP-FILE\\confidential\\customer_data.csv" Access=READ Status=SUCCESS'
    }
  },
  {
    evidence_id: 'EVD-005',
    case_id: 'CASE-001',
    filename: 'firewall.log',
    type: 'firewall_log',
    source: 'firewall.log',
    timestamp: '2026-10-04T10:25:00Z',
    hash: 'f9429cbb3b9f338b577488f7fdcb73b316ab3ad069c9b5d3810a95a8bfb15b5a',
    processing_status: 'verified',
    relevance: 'critical',
    linked_event_ids: ['EVT-005', 'EVT-006'],
    metadata: {
      file_size_kb: 8452,
      sensor_id: 'EDGE-FW-01',
      log_format: 'Normalized Syslog / JSON',
      extracted_records: 2,
      sha256_verified: true,
      raw_sample: '2026-10-04 10:25:00 [FIREWALL] PROTO=TCP SRC=192.168.1.20:49152 DST=198.51.100.24:443 ACTION=ALLOW BYTES_SENT=8452100 BYTES_RCVD=15200'
    }
  },
  {
    evidence_id: 'EVD-006',
    case_id: 'CASE-001',
    filename: 'workstation_photo.jpg',
    type: 'photo_evidence',
    source: 'workstation_photo.jpg',
    timestamp: '2026-10-04T10:16:00Z',
    hash: 'b12a884f09d3c52e4719aa3bc281907de1947e2c9183491f0a12e8b61c947012',
    processing_status: 'verified',
    relevance: 'high',
    linked_event_ids: ['EVT-001', 'EVT-002'],
    metadata: {
      file_size_kb: 128,
      location: 'Workstation Cubicle 14 (Desk Surface)',
      collector: 'Field Forensics Unit Lead',
      media_path: '/evidence/workstation_photo.jpg',
      opencv_analysis: {
        sharpness_laplacian_variance: 2293.76,
        is_blurry: false,
        detected_keypoints: 500,
        edge_pixels: 24414,
        mean_brightness: 52.08,
        contrast_std: 40.44
      },
      dimensions: { width: 1280, height: 720 },
      sha256_verified: true,
      raw_sample: 'EXIF: Nikon D850 | Exposure: 1/60s f/4.0 ISO 400 | Forensic Tag: CRIME-SCENE-PHOTO-01\nOpenCV Analysis: Edge Detection Canny + ORB Keypoints extracted'
    }
  },
  {
    evidence_id: 'EVD-007',
    case_id: 'CASE-001',
    filename: 'cctv_server_room.mp4',
    type: 'cctv_footage',
    source: 'cctv_server_room.mp4',
    timestamp: '2026-10-04T10:20:45Z',
    hash: 'c8491ef98231a47dfb2901a559281a4b12398571829471902837192837192837',
    processing_status: 'verified',
    relevance: 'high',
    linked_event_ids: ['EVT-003'],
    metadata: {
      file_size_kb: 248,
      location: 'Server Room Entrance Door (Hallway)',
      collector: 'Physical Access Control CAM-04',
      media_path: '/evidence/cctv_server_room.mp4',
      video_metadata: {
        camera_id: 'CAM-04',
        fps: 15.0,
        duration_seconds: 6.0,
        width: 854,
        height: 480,
        frame_count: 90
      },
      sha256_verified: true,
      raw_sample: 'SURVEILLANCE LOG: Camera 04 Hallway PTZ\nMotion triggered at 10:20:42. Badge swipe event matched user: employee01 at SRV-CORP-FILE security airlock.'
    }
  },
  {
    evidence_id: 'EVD-008',
    case_id: 'CASE-001',
    filename: 'tampered_usb_drive.jpg',
    type: 'physical_evidence',
    source: 'tampered_usb_drive.jpg',
    timestamp: '2026-10-04T10:17:15Z',
    hash: 'e8f4a1209b5523dc881a7042a19b882190018247192847192847192847192847',
    processing_status: 'verified',
    relevance: 'critical',
    linked_event_ids: ['EVT-002'],
    metadata: {
      file_size_kb: 98,
      location: 'Workstation Cubicle 14 (PC Tower USB Port 2)',
      collector: 'Hardware Evidence Specialist',
      media_path: '/evidence/tampered_usb_drive.jpg',
      physical_metadata: {
        asset_tag: 'PHYS-8821',
        capacity: '64GB',
        storage_locker: 'Evidence Vault Locker #12',
        tamper_seal_intact: true
      },
      sha256_verified: true,
      raw_sample: 'CHAIN OF CUSTODY SEAL #88219\nItem: SanDisk Ultra 64GB USB Flash Drive\nRecovered directly from rear USB 3.0 port of WORKSTATION-01. Contains staged PowerShell payloads.'
    }
  },
  {
    evidence_id: 'EVD-009',
    case_id: 'CASE-001',
    filename: 'forensic_intake_report.txt',
    type: 'document_evidence',
    source: 'forensic_intake_report.txt',
    timestamp: '2026-10-04T10:12:00Z',
    hash: '9128374918237491823749182374918237491823749182374918237491823749',
    processing_status: 'verified',
    relevance: 'medium',
    linked_event_ids: ['EVT-001'],
    metadata: {
      file_size_kb: 4,
      location: 'SOC Incident Queue (Terminal A)',
      collector: 'SOC Shift Supervisor',
      media_path: '/evidence/forensic_intake_report.txt',
      document_metadata: {
        title: 'Forensic Incident Intake & Custody Record',
        classification: 'INTERNAL USE ONLY',
        case_ref: 'CASE-001'
      },
      sha256_verified: true,
      raw_sample: 'INCIDENT INTAKE FORM: CASE-001\nReported: 2026-10-04 10:12 UTC by SIEM automated correlation rule #9021.\nDescription: Suspicious credential authentication on WORKSTATION-01.'
    }
  },
  {
    evidence_id: 'EVD-001',
    case_id: 'CASE-2026-0882',
    filename: 'auth_security_20261004.evtx',
    type: 'auth_log',
    source: 'WS-FIN-04.corp.local (C:\\Windows\\System32\\winevt\\Logs\\Security.evtx)',
    timestamp: '2026-10-04T02:14:10Z',
    hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    processing_status: 'verified',
    relevance: 'critical',
    linked_event_ids: ['EVT-101', 'EVT-102', 'EVT-104', 'EVT-110', 'EVT-111'],
    metadata: {
      file_size_kb: 4820,
      sensor_id: 'WIN-AUDIT-AGENT-09',
      log_format: 'Windows XML Event Log 2.0',
      extracted_records: 1240,
      sha256_verified: true,
      raw_sample: '<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event"><System><EventID>4625</EventID><TimeCreated SystemTime="2026-10-04T02:14:10.120Z"/></System><EventData><Data Name="TargetUserName">dev_user41</Data><Data Name="IpAddress">192.168.1.105</Data><Data Name="Status">0xC000006D</Data></EventData></Event>'
    }
  },
  {
    evidence_id: 'EVD-002',
    case_id: 'CASE-2026-0882',
    filename: 'sysmon_operational_ws04.evtx',
    type: 'sysmon',
    source: 'WS-FIN-04 (Microsoft-Windows-Sysmon/Operational)',
    timestamp: '2026-10-04T02:28:44Z',
    hash: 'a7c93e4d92bc103848a6df2314e82c19f5630a916723c0291e0a442751f891ab',
    processing_status: 'verified',
    relevance: 'critical',
    linked_event_ids: ['EVT-105', 'EVT-107'],
    metadata: {
      file_size_kb: 2150,
      sensor_id: 'SYSMON-V14-ENDPOINT',
      log_format: 'Sysmon XML',
      extracted_records: 620,
      sha256_verified: true,
      raw_sample: 'Sysmon Event 1: Process Create. Image: C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe. CommandLine: powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgA... ParentImage: explorer.exe. User: CORP\\dev_user41'
    }
  },
  {
    evidence_id: 'EVD-003',
    case_id: 'CASE-2026-0882',
    filename: 'corp_fileserver_audit.log',
    type: 'disk_artifact',
    source: 'FS-CORP-01 (D:\\Shares\\Finance\\Audit.log)',
    timestamp: '2026-10-04T02:35:12Z',
    hash: '5d41402abc4b2a76b9719d911017c592ef43c683b7f1e56b468571eb67727e02',
    processing_status: 'verified',
    relevance: 'high',
    linked_event_ids: ['EVT-106'],
    metadata: {
      file_size_kb: 890,
      sensor_id: 'FS-FILE-INTEGRITY-MONITOR',
      log_format: 'Standard Syslog RFC-5424',
      extracted_records: 310,
      sha256_verified: true,
      raw_sample: '2026-10-04T02:35:12Z FS-CORP-01 Audit[402]: READ customer_vault_q3.db BY USER dev_user41 (IP: 192.168.1.44) ACCESS_MASK: 0x120089'
    }
  },
  {
    evidence_id: 'EVD-004',
    case_id: 'CASE-2026-0882',
    filename: 'perimeter_firewall_oct04.pcap',
    type: 'pcap',
    source: 'PaloAlto-Edge-FW-01 (Interface eth0/1)',
    timestamp: '2026-10-04T02:46:05Z',
    hash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    processing_status: 'verified',
    relevance: 'critical',
    linked_event_ids: ['EVT-108', 'EVT-109'],
    metadata: {
      file_size_kb: 54100,
      sensor_id: 'ZEEK-PCAP-PROBE-01',
      log_format: 'libpcap format (TCP/IP flows)',
      extracted_records: 84500,
      sha256_verified: true,
      raw_sample: 'FRAME 1421: 192.168.1.44:54210 -> 198.51.100.42:8443 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 WS=256'
    }
  },
  {
    evidence_id: 'EVD-005',
    case_id: 'CASE-2026-0882',
    filename: 'memory_dump_ws_fin_04.raw',
    type: 'memory_dump',
    source: 'WS-FIN-04 (Volatile RAM Image Acquisition)',
    timestamp: '2026-10-04T03:10:00Z',
    hash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    processing_status: 'verified',
    relevance: 'high',
    linked_event_ids: ['EVT-105', 'EVT-110'],
    metadata: {
      file_size_kb: 16777216,
      sensor_id: 'WINPMM-ACQUISITION-TOOL',
      log_format: 'Raw Physical Memory Dump',
      extracted_records: 4,
      sha256_verified: true,
      raw_sample: 'Volatility 3 Analysis: PID 6412 injected memory regions detected. Injected thread pointing to unbacked VAD page at 0x7ffd190000.'
    }
  }
];

export const MOCK_EVENTS: NormalizedEvent[] = [
  {
    event_id: 'EVT-001',
    case_id: 'CASE-001',
    timestamp: '2026-10-04T10:15:00',
    event_type: 'suspicious_login',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    target_device: 'WORKSTATION-01',
    severity: 'high',
    evidence_id: 'EVD-001',
    evidence_line: '2026-10-04 10:15:00 auth.log sshd[12410]: Accepted password for employee01 from 192.168.1.20 port 44321 ssh2',
    is_suspicious: true,
    description: 'Adversary leveraged compromised employee credentials to gain initial access to enterprise infrastructure.',
    mitre_technique: 'Valid Accounts: Domain Accounts (T1078.002)',
    mitre_technique_id: 'T1078.002',
    mitre_technique_name: 'Valid Accounts: Domain Accounts',
    stage: 'Initial Access'
  },
  {
    event_id: 'EVT-002',
    case_id: 'CASE-001',
    timestamp: '2026-10-04T10:18:30',
    event_type: 'suspicious_process_spawn',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    target_device: 'WORKSTATION-01',
    severity: 'critical',
    evidence_id: 'EVD-002',
    evidence_line: '2026-10-04 10:18:30 [ENDPOINT] Host=WORKSTATION-01 User=employee01 Process=powershell.exe CommandLine="powershell.exe -enc SQBFAFgA" Action=suspicious_process_spawn PID=4912',
    is_suspicious: true,
    description: 'Execution of obfuscated commands via PowerShell on internal workstation.',
    mitre_technique: 'Command and Scripting Interpreter: PowerShell (T1059.001)',
    mitre_technique_id: 'T1059.001',
    mitre_technique_name: 'Command and Scripting Interpreter: PowerShell',
    stage: 'Execution'
  },
  {
    event_id: 'EVT-003',
    case_id: 'CASE-001',
    timestamp: '2026-10-04T10:21:05',
    event_type: 'internal_server_connection',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    target_device: 'SRV-CORP-FILE',
    severity: 'high',
    evidence_id: 'EVD-003',
    evidence_line: '2026-10-04 10:21:05 [SERVER] Host=SRV-CORP-FILE ClientIP=192.168.1.20 User=employee01 Service=SMB Action=session_connect Status=SUCCESS',
    is_suspicious: true,
    description: 'Adversary established lateral SMB session across internal network to target enterprise file server.',
    mitre_technique: 'Remote Services: SMB/Windows Admin Shares (T1021.002)',
    mitre_technique_id: 'T1021.002',
    mitre_technique_name: 'Remote Services: SMB/Windows Admin Shares',
    stage: 'Lateral Movement'
  },
  {
    event_id: 'EVT-004',
    case_id: 'CASE-001',
    timestamp: '2026-10-04T10:22:45',
    event_type: 'sensitive_file_access',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    target_device: 'SRV-CORP-FILE',
    severity: 'critical',
    evidence_id: 'EVD-004',
    evidence_line: '2026-10-04 10:22:45 [FILE_AUDIT] Host=SRV-CORP-FILE User=employee01 File="\\\\SRV-CORP-FILE\\confidential\\customer_data.csv" Access=READ Status=SUCCESS',
    is_suspicious: true,
    description: 'Adversary staged and accessed confidential customer files stored on internal network shares.',
    mitre_technique: 'Data from Network Shared Drive (T1039)',
    mitre_technique_id: 'T1039',
    mitre_technique_name: 'Data from Network Shared Drive',
    stage: 'Collection'
  },
  {
    event_id: 'EVT-005',
    case_id: 'CASE-001',
    timestamp: '2026-10-04T10:24:15',
    event_type: 'suspicious_network_connection',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    target_device: '198.51.100.24',
    destination_ip: '198.51.100.24',
    severity: 'high',
    evidence_id: 'EVD-005',
    evidence_line: '2026-10-04 10:24:15 [FIREWALL] PROTO=TCP SRC=192.168.1.20:49150 DST=198.51.100.24:443 ACTION=ALLOW',
    is_suspicious: true,
    description: 'Outbound command-and-control connection established from internal host to external suspect IP.',
    mitre_technique: 'Application Layer Protocol: Web Protocols (T1071.001)',
    mitre_technique_id: 'T1071.001',
    mitre_technique_name: 'Application Layer Protocol: Web Protocols',
    stage: 'Command and Control'
  },
  {
    event_id: 'EVT-006',
    case_id: 'CASE-001',
    timestamp: '2026-10-04T10:25:00',
    event_type: 'outbound_data_transfer',
    actor: 'employee01',
    source_device: 'WORKSTATION-01',
    source_ip: '192.168.1.20',
    target_device: '198.51.100.24',
    destination_ip: '198.51.100.24',
    severity: 'critical',
    evidence_id: 'EVD-005',
    evidence_line: '2026-10-04 10:25:00 [FIREWALL] PROTO=TCP SRC=192.168.1.20:49152 DST=198.51.100.24:443 ACTION=ALLOW BYTES_SENT=8452100 BYTES_RCVD=15200',
    is_suspicious: true,
    description: 'High volume data exfiltration from internal workstation to external adversary infrastructure.',
    mitre_technique: 'Exfiltration Over Alternative Protocol: Exfiltration Over Web Service (T1048.003)',
    mitre_technique_id: 'T1048.003',
    mitre_technique_name: 'Exfiltration Over Alternative Protocol: Exfiltration Over Web Service',
    stage: 'Exfiltration'
  },
  {
    event_id: 'EVT-101',
    case_id: 'CASE-2026-0882',
    timestamp: '2026-10-04T02:14:10Z',
    event_type: 'failed_login',
    actor: 'dev_user41',
    source_device: 'WS-UNKNOWN-PIVOT',
    source_ip: '192.168.1.105',
    target_device: 'WS-FIN-04',
    severity: 'medium',
    evidence_id: 'EVD-001',
    evidence_line: 'EventID 4625: An account failed to log on. Target: dev_user41, Workstation: WS-FIN-04, Status: Bad Password',
    is_suspicious: true,
    description: 'Rapid sequential authentication failures targeting user account dev_user41 across internal subnet.',
    mitre_technique: 'T1110.001 - Password Guessing / Brute Force'
  },
  {
    event_id: 'EVT-102',
    case_id: 'CASE-2026-0882',
    timestamp: '2026-10-04T02:17:42Z',
    event_type: 'successful_auth',
    actor: 'dev_user41',
    source_device: 'WS-FIN-04',
    source_ip: '192.168.1.105',
    target_device: 'WS-FIN-04',
    severity: 'high',
    evidence_id: 'EVD-001',
    evidence_line: 'EventID 4624: An account was successfully logged on. LogonType 10 (RemoteInteractive). User: dev_user41',
    is_suspicious: true,
    description: 'Successful Remote Interactive Logon (RDP/Type 10) outside normal business hours following multiple failure alerts.',
    mitre_technique: 'T1078.002 - Domain Accounts'
  },
  {
    event_id: 'EVT-103',
    case_id: 'CASE-2026-0882',
    timestamp: '2026-10-04T02:19:15Z',
    event_type: 'login',
    actor: 'dev_user41',
    source_device: 'WS-FIN-04',
    source_ip: '192.168.1.44',
    target_device: 'WS-FIN-04',
    severity: 'low',
    evidence_id: 'EVD-001',
    evidence_line: 'EventID 4648: A logon was attempted using explicit credentials. Subject: dev_user41, Target: WS-FIN-04',
    is_suspicious: false,
    description: 'Local desktop session initialized on workstation WS-FIN-04 under user profile dev_user41.',
    mitre_technique: 'T1078 - Valid Accounts'
  },
  {
    event_id: 'EVT-104',
    case_id: 'CASE-2026-0882',
    timestamp: '2026-10-04T02:23:08Z',
    event_type: 'privilege_escalation',
    actor: 'dev_user41 (Elevated to SYSTEM)',
    source_device: 'WS-FIN-04',
    source_ip: '192.168.1.44',
    target_device: 'WS-FIN-04',
    severity: 'critical',
    evidence_id: 'EVD-001',
    evidence_line: 'EventID 4672: Special privileges assigned to new logon. Privileges: SeDebugPrivilege, SeTcbPrivilege, SeSecurityPrivilege',
    is_suspicious: true,
    description: 'Special Administrative privileges assigned to standard developer account token via privilege abuse.',
    mitre_technique: 'T1068 - Exploitation for Privilege Escalation'
  },
  {
    event_id: 'EVT-105',
    case_id: 'CASE-2026-0882',
    timestamp: '2026-10-04T02:28:44Z',
    event_type: 'process_execution',
    actor: 'SYSTEM',
    source_device: 'WS-FIN-04',
    source_ip: '192.168.1.44',
    target_device: 'WS-FIN-04',
    process_name: 'powershell.exe (PID: 6412)',
    command_line: 'powershell.exe -NoP -NonI -W Hidden -Enc SQBFAFgA... (Invoking in-memory LSASS dump tool)',
    severity: 'critical',
    evidence_id: 'EVD-002',
    evidence_line: 'Sysmon Event 1: Process Create powershell.exe with hidden window flag and base64 encoded payload',
    is_suspicious: true,
    description: 'Hidden obfuscated PowerShell instance spawned to extract cached domain credentials and stage lateral access.',
    mitre_technique: 'T1059.001 - PowerShell & T1003.001 - OS Credential Dumping'
  },
  {
    event_id: 'EVT-106',
    case_id: 'CASE-2026-0882',
    timestamp: '2026-10-04T02:35:12Z',
    event_type: 'file_access',
    actor: 'dev_user41',
    source_device: 'WS-FIN-04',
    source_ip: '192.168.1.44',
    destination_ip: '10.0.4.15',
    target_device: 'FS-CORP-01',
    file: 'D:\\Shares\\Finance\\customer_vault_q3.db',
    severity: 'high',
    evidence_id: 'EVD-003',
    evidence_line: 'Audit[402]: Read operation on customer_vault_q3.db from host 192.168.1.44 over SMB2',
    is_suspicious: true,
    description: 'Lateral read access to restricted financial customer database file on FS-CORP-01.',
    mitre_technique: 'T1039 - Data from Network Shared Drive'
  },
  {
    event_id: 'EVT-107',
    case_id: 'CASE-2026-0882',
    timestamp: '2026-10-04T02:41:30Z',
    event_type: 'suspicious_command',
    actor: 'SYSTEM',
    source_device: 'WS-FIN-04',
    source_ip: '192.168.1.44',
    target_device: 'WS-FIN-04',
    process_name: 'tar.exe / 7z.exe',
    file: 'C:\\Users\\Public\\svchost_upd.zip',
    command_line: 'tar.exe -czf C:\\Users\\Public\\svchost_upd.zip \\\\FS-CORP-01\\Finance\\customer_vault_q3.db',
    severity: 'high',
    evidence_id: 'EVD-002',
    evidence_line: 'Sysmon Event 11: FileCreate C:\\Users\\Public\\svchost_upd.zip by tar.exe (Compressed DB Archive)',
    is_suspicious: true,
    description: 'Creation of encrypted compressed staging archive in public folder masquerading as system update.',
    mitre_technique: 'T1560.001 - Archive via Utility'
  },
  {
    event_id: 'EVT-108',
    case_id: 'CASE-2026-0882',
    timestamp: '2026-10-04T02:46:05Z',
    event_type: 'network_connection',
    actor: 'SYSTEM',
    source_device: 'WS-FIN-04',
    source_ip: '192.168.1.44',
    destination_ip: '198.51.100.42',
    severity: 'critical',
    evidence_id: 'EVD-004',
    evidence_line: 'Firewall flow: 192.168.1.44:54210 -> 198.51.100.42:8443 [TLSv1.3 Non-Standard Port]',
    is_suspicious: true,
    description: 'Outbound TCP connection established to suspicious external destination 198.51.100.42 over non-standard TLS port 8443.',
    mitre_technique: 'T1071.001 - Web Protocols (C2)'
  },
  {
    event_id: 'EVT-109',
    case_id: 'CASE-2026-0882',
    timestamp: '2026-10-04T02:48:22Z',
    event_type: 'data_exfiltration',
    actor: 'SYSTEM',
    source_device: 'WS-FIN-04',
    source_ip: '192.168.1.44',
    destination_ip: '198.51.100.42',
    file: 'svchost_upd.zip',
    severity: 'critical',
    evidence_id: 'EVD-004',
    evidence_line: 'Zeek conn.log: Outbound stream duration 134s, bytes_sent=44882190 (42.8 MB), resp_bytes=1042',
    is_suspicious: true,
    description: 'High-volume encrypted data exfiltration (42.8 MB) transmitted directly to external IP 198.51.100.42.',
    mitre_technique: 'T1041 - Exfiltration Over C2 Channel'
  },
  {
    event_id: 'EVT-110',
    case_id: 'CASE-2026-0882',
    timestamp: '2026-10-04T02:52:18Z',
    event_type: 'suspicious_command',
    actor: 'SYSTEM',
    source_device: 'WS-FIN-04',
    source_ip: '192.168.1.44',
    target_device: 'WS-FIN-04',
    process_name: 'wevtutil.exe',
    command_line: 'wevtutil.exe cl Security',
    severity: 'critical',
    evidence_id: 'EVD-001',
    evidence_line: 'EventID 1102: The audit log was cleared. Subject: dev_user41 (Elevated SYSTEM)',
    is_suspicious: true,
    description: 'Anti-forensic log wipe attempt: Windows Security Event Log cleared to eliminate forensic footprint.',
    mitre_technique: 'T1070.001 - Clear Windows Event Logs'
  },
  {
    event_id: 'EVT-111',
    case_id: 'CASE-2026-0882',
    timestamp: '2026-10-04T02:54:02Z',
    event_type: 'logout',
    actor: 'dev_user41',
    source_device: 'WS-FIN-04',
    source_ip: '192.168.1.44',
    target_device: 'WS-FIN-04',
    severity: 'low',
    evidence_id: 'EVD-001',
    evidence_line: 'EventID 4634: An account was logged off. Subject: dev_user41',
    is_suspicious: false,
    description: 'RDP session termination and disconnect from workstation WS-FIN-04.',
    mitre_technique: 'T1078 - Valid Accounts'
  }
];

export const MOCK_ENTITIES: Entity[] = [
  {
    entity_id: 'user:employee01',
    case_id: 'CASE-001',
    entity_type: 'user',
    name: 'employee01',
    is_compromised: true,
    metadata: {
      role: 'employee',
      first_seen: '2026-10-04T10:15:00',
      last_seen: '2026-10-04T10:22:45'
    }
  },
  {
    entity_id: 'device:WORKSTATION-01',
    case_id: 'CASE-001',
    entity_type: 'workstation',
    name: 'WORKSTATION-01',
    is_compromised: true,
    metadata: {
      os: 'Windows',
      first_seen: '2026-10-04T10:15:00',
      last_seen: '2026-10-04T10:22:45'
    }
  },
  {
    entity_id: 'ip:192.168.1.20',
    case_id: 'CASE-001',
    entity_type: 'ip_address',
    name: '192.168.1.20',
    is_compromised: false,
    is_external: false,
    metadata: {
      network: 'internal',
      first_seen: '2026-10-04T10:15:00',
      last_seen: '2026-10-04T10:25:00'
    }
  },
  {
    entity_id: 'file:powershell.exe',
    case_id: 'CASE-001',
    entity_type: 'file_object',
    name: 'powershell.exe',
    is_compromised: false,
    metadata: {
      path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      first_seen: '2026-10-04T10:18:30',
      last_seen: '2026-10-04T10:18:30'
    }
  },
  {
    entity_id: 'server:SRV-CORP-FILE',
    case_id: 'CASE-001',
    entity_type: 'server',
    name: 'SRV-CORP-FILE',
    is_compromised: false,
    metadata: {
      os: 'Windows Server',
      first_seen: '2026-10-04T10:21:05',
      last_seen: '2026-10-04T10:22:45'
    }
  },
  {
    entity_id: 'file:\\SRV-CORP-FILE\\confidential\\customer_data.csv',
    case_id: 'CASE-001',
    entity_type: 'file_object',
    name: 'customer_data.csv',
    is_compromised: true,
    metadata: {
      path: '\\SRV-CORP-FILE\\confidential\\customer_data.csv',
      first_seen: '2026-10-04T10:22:45',
      last_seen: '2026-10-04T10:22:45'
    }
  },
  {
    entity_id: 'ip:198.51.100.24',
    case_id: 'CASE-001',
    entity_type: 'ip_address',
    name: '198.51.100.24',
    is_compromised: false,
    is_external: true,
    metadata: {
      network: 'external',
      first_seen: '2026-10-04T10:24:15',
      last_seen: '2026-10-04T10:25:00'
    }
  },
  {
    entity_id: 'ENT-USER-01',
    case_id: 'CASE-2026-0882',
    entity_type: 'user',
    name: 'dev_user41',
    is_compromised: true,
    metadata: {
      role: 'Junior Financial Systems Developer',
      department: 'Finance Engineering',
      clearance: 'Level 2 - Restricted',
      email: 'dev_user41@corp.local',
      status: 'Account Locked by Security Operations'
    }
  },
  {
    entity_id: 'ENT-DEV-01',
    case_id: 'CASE-2026-0882',
    entity_type: 'workstation',
    name: 'WS-FIN-04',
    is_compromised: true,
    metadata: {
      ip: '192.168.1.44',
      os: 'Windows 11 Enterprise (Build 22631)',
      mac: '00:1A:2B:3C:4D:5E',
      subnet: '192.168.1.0/24 (Workstation VLAN 10)',
      isolation_status: 'Quarantined at Switch Port'
    }
  },
  {
    entity_id: 'ENT-SRV-01',
    case_id: 'CASE-2026-0882',
    entity_type: 'server',
    name: 'FS-CORP-01',
    is_compromised: false,
    metadata: {
      ip: '10.0.4.15',
      os: 'Windows Server 2022 Datacenter',
      role: 'Internal Financial Document Vault',
      services: 'SMB, Kerberos, DFS'
    }
  },
  {
    entity_id: 'ENT-IP-01',
    case_id: 'CASE-2026-0882',
    entity_type: 'ip_address',
    name: '192.168.1.105',
    is_compromised: true,
    is_external: false,
    metadata: {
      subnet: 'Internal Staging / Lab Subnet',
      device_name: 'WS-UNKNOWN-PIVOT',
      reputation: 'Untrusted Internal Pivot'
    }
  },
  {
    entity_id: 'ENT-IP-02',
    case_id: 'CASE-2026-0882',
    entity_type: 'ip_address',
    name: '198.51.100.42',
    is_compromised: false,
    is_external: true,
    metadata: {
      country: 'Seychelles (Offshore)',
      asn: 'AS-64512 UNREGISTERED-HOSTING',
      reputation: 'Known Bulletproof C2 / Exfiltration Sink',
      threat_intel_score: '98/100 (Critical Malicious)'
    }
  },
  {
    entity_id: 'ENT-FILE-01',
    case_id: 'CASE-2026-0882',
    entity_type: 'file_object',
    name: 'customer_vault_q3.db',
    is_compromised: true,
    metadata: {
      location: '\\\\FS-CORP-01\\Shares\\Finance\\customer_vault_q3.db',
      file_size_mb: 41.2,
      classification: 'HIGHLY CONFIDENTIAL / PII & Financial Records',
      records_count: 85200
    }
  },
  {
    entity_id: 'ENT-FILE-02',
    case_id: 'CASE-2026-0882',
    entity_type: 'file_object',
    name: 'svchost_upd.zip',
    is_compromised: true,
    metadata: {
      location: 'C:\\Users\\Public\\svchost_upd.zip',
      file_size_mb: 42.8,
      compression: 'AES-256 password encrypted ZIP',
      status: 'Staged Exfiltration Payload'
    }
  },
  {
    entity_id: 'ENT-PROC-01',
    case_id: 'CASE-2026-0882',
    entity_type: 'process',
    name: 'powershell.exe (PID: 6412)',
    is_compromised: true,
    metadata: {
      parent_pid: 2104,
      parent_image: 'explorer.exe',
      security_context: 'NT AUTHORITY\\SYSTEM',
      flags: '-NoP -NonI -W Hidden -Enc',
      injection_detected: true
    }
  }
];

export const MOCK_RELATIONSHIPS: Relationship[] = [
  {
    relationship_id: 'REL-001',
    case_id: 'CASE-001',
    source_entity_id: 'user:employee01',
    target_entity_id: 'device:WORKSTATION-01',
    relationship_type: 'AUTHENTICATED_TO',
    label: 'AUTHENTICATED_TO',
    evidence_ids: ['EVD-001'],
    timestamp: '2026-10-04T10:15:00',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-002',
    case_id: 'CASE-001',
    source_entity_id: 'device:WORKSTATION-01',
    target_entity_id: 'ip:192.168.1.20',
    relationship_type: 'RESOLVED_IP',
    label: 'RESOLVED_IP',
    evidence_ids: ['EVD-001'],
    timestamp: '2026-10-04T10:15:00',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-003',
    case_id: 'CASE-001',
    source_entity_id: 'user:employee01',
    target_entity_id: 'device:WORKSTATION-01',
    relationship_type: 'USES',
    label: 'USES',
    evidence_ids: ['EVD-002'],
    timestamp: '2026-10-04T10:18:30',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-004',
    case_id: 'CASE-001',
    source_entity_id: 'device:WORKSTATION-01',
    target_entity_id: 'file:powershell.exe',
    relationship_type: 'EXECUTED',
    label: 'EXECUTED',
    evidence_ids: ['EVD-002'],
    timestamp: '2026-10-04T10:18:30',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-005',
    case_id: 'CASE-001',
    source_entity_id: 'user:employee01',
    target_entity_id: 'device:WORKSTATION-01',
    relationship_type: 'USES',
    label: 'USES',
    evidence_ids: ['EVD-003'],
    timestamp: '2026-10-04T10:21:05',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-006',
    case_id: 'CASE-001',
    source_entity_id: 'device:WORKSTATION-01',
    target_entity_id: 'ip:192.168.1.20',
    relationship_type: 'RESOLVED_IP',
    label: 'RESOLVED_IP',
    evidence_ids: ['EVD-003'],
    timestamp: '2026-10-04T10:21:05',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-007',
    case_id: 'CASE-001',
    source_entity_id: 'device:WORKSTATION-01',
    target_entity_id: 'server:SRV-CORP-FILE',
    relationship_type: 'CONNECTED_TO',
    label: 'CONNECTED_TO',
    evidence_ids: ['EVD-003'],
    timestamp: '2026-10-04T10:21:05',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-008',
    case_id: 'CASE-001',
    source_entity_id: 'user:employee01',
    target_entity_id: 'device:WORKSTATION-01',
    relationship_type: 'USES',
    label: 'USES',
    evidence_ids: ['EVD-004'],
    timestamp: '2026-10-04T10:22:45',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-009',
    case_id: 'CASE-001',
    source_entity_id: 'device:WORKSTATION-01',
    target_entity_id: 'server:SRV-CORP-FILE',
    relationship_type: 'CONNECTED_TO',
    label: 'CONNECTED_TO',
    evidence_ids: ['EVD-004'],
    timestamp: '2026-10-04T10:22:45',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-010',
    case_id: 'CASE-001',
    source_entity_id: 'user:employee01',
    target_entity_id: 'file:\\SRV-CORP-FILE\\confidential\\customer_data.csv',
    relationship_type: 'ACCESSED',
    label: 'ACCESSED',
    evidence_ids: ['EVD-004'],
    timestamp: '2026-10-04T10:22:45',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-011',
    case_id: 'CASE-001',
    source_entity_id: 'user:employee01',
    target_entity_id: 'device:WORKSTATION-01',
    relationship_type: 'USES',
    label: 'USES',
    evidence_ids: ['EVD-005'],
    timestamp: '2026-10-04T10:24:15',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-012',
    case_id: 'CASE-001',
    source_entity_id: 'device:WORKSTATION-01',
    target_entity_id: 'ip:192.168.1.20',
    relationship_type: 'RESOLVED_IP',
    label: 'RESOLVED_IP',
    evidence_ids: ['EVD-005'],
    timestamp: '2026-10-04T10:24:15',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-013',
    case_id: 'CASE-001',
    source_entity_id: 'device:WORKSTATION-01',
    target_entity_id: 'ip:198.51.100.24',
    relationship_type: 'CONNECTED_TO',
    label: 'CONNECTED_TO',
    evidence_ids: ['EVD-005'],
    timestamp: '2026-10-04T10:24:15',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-014',
    case_id: 'CASE-001',
    source_entity_id: 'device:WORKSTATION-01',
    target_entity_id: 'ip:192.168.1.20',
    relationship_type: 'RESOLVED_IP',
    label: 'RESOLVED_IP',
    evidence_ids: ['EVD-005'],
    timestamp: '2026-10-04T10:25:00',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-015',
    case_id: 'CASE-001',
    source_entity_id: 'device:WORKSTATION-01',
    target_entity_id: 'ip:198.51.100.24',
    relationship_type: 'EXFILTRATED_TO',
    label: 'EXFILTRATED_TO',
    evidence_ids: ['EVD-005'],
    timestamp: '2026-10-04T10:25:00',
    is_suspicious: true
  },
  {
    relationship_id: 'REL-101',
    case_id: 'CASE-2026-0882',
    source_entity_id: 'ENT-IP-01',
    target_entity_id: 'ENT-USER-01',
    relationship_type: 'AUTHENTICATED_TO',
    label: 'Brute Force Attempts',
    evidence_ids: ['EVD-001'],
    is_suspicious: true
  },
  {
    relationship_id: 'REL-002',
    case_id: 'CASE-2026-0882',
    source_entity_id: 'ENT-USER-01',
    target_entity_id: 'ENT-DEV-01',
    relationship_type: 'AUTHENTICATED_TO',
    label: 'RDP Session Logon',
    evidence_ids: ['EVD-001'],
    is_suspicious: true
  },
  {
    relationship_id: 'REL-003',
    case_id: 'CASE-2026-0882',
    source_entity_id: 'ENT-DEV-01',
    target_entity_id: 'ENT-PROC-01',
    relationship_type: 'SPAWNED_PROCESS',
    label: 'Spawned Obfuscated PowerShell',
    evidence_ids: ['EVD-002', 'EVD-005'],
    is_suspicious: true
  },
  {
    relationship_id: 'REL-004',
    case_id: 'CASE-2026-0882',
    source_entity_id: 'ENT-PROC-01',
    target_entity_id: 'ENT-SRV-01',
    relationship_type: 'CONNECTED_TO',
    label: 'SMB Network Query',
    evidence_ids: ['EVD-003'],
    is_suspicious: true
  },
  {
    relationship_id: 'REL-005',
    case_id: 'CASE-2026-0882',
    source_entity_id: 'ENT-PROC-01',
    target_entity_id: 'ENT-FILE-01',
    relationship_type: 'ACCESSED_FILE',
    label: 'Read Database Records',
    evidence_ids: ['EVD-003'],
    is_suspicious: true
  },
  {
    relationship_id: 'REL-006',
    case_id: 'CASE-2026-0882',
    source_entity_id: 'ENT-DEV-01',
    target_entity_id: 'ENT-FILE-02',
    relationship_type: 'DOWNLOADED',
    label: 'Staged Archive svchost_upd.zip',
    evidence_ids: ['EVD-002'],
    is_suspicious: true
  },
  {
    relationship_id: 'REL-007',
    case_id: 'CASE-2026-0882',
    source_entity_id: 'ENT-DEV-01',
    target_entity_id: 'ENT-IP-02',
    relationship_type: 'CONNECTED_TO',
    label: 'Outbound Port 8443 TLS',
    evidence_ids: ['EVD-004'],
    is_suspicious: true
  },
  {
    relationship_id: 'REL-008',
    case_id: 'CASE-2026-0882',
    source_entity_id: 'ENT-FILE-02',
    target_entity_id: 'ENT-IP-02',
    relationship_type: 'EXFILTRATED_TO',
    label: 'Exfiltrated 42.8 MB Payload',
    evidence_ids: ['EVD-004'],
    is_suspicious: true
  }
];

export const MOCK_REPLAY_EVENTS: ReplayEvent[] = MOCK_EVENTS.map((evt, index) => {
  let action: ReplayEvent['playback_action'] = 'highlight_node';
  let activeEntities: string[] = ['device:WORKSTATION-01'];
  let stateDesc = 'Node interaction recorded';

  switch (evt.event_type) {
    case 'suspicious_login':
      action = 'draw_edge';
      activeEntities = ['user:employee01', 'device:WORKSTATION-01', 'ip:192.168.1.20'];
      stateDesc = 'Adversary logged in with valid employee01 credentials from 192.168.1.20';
      break;
    case 'suspicious_process_spawn':
      action = 'highlight_node';
      activeEntities = ['user:employee01', 'device:WORKSTATION-01', 'file:powershell.exe'];
      stateDesc = 'Adversary spawned obfuscated PowerShell process on WORKSTATION-01';
      break;
    case 'internal_server_connection':
      action = 'draw_edge';
      activeEntities = ['device:WORKSTATION-01', 'server:SRV-CORP-FILE'];
      stateDesc = 'Adversary pivoted laterally to SRV-CORP-FILE via SMB';
      break;
    case 'sensitive_file_access':
      action = 'spawn_alert';
      activeEntities = ['user:employee01', 'file:\\SRV-CORP-FILE\\confidential\\customer_data.csv'];
      stateDesc = 'Adversary read confidential customer_data.csv on SRV-CORP-FILE';
      break;
    case 'suspicious_network_connection':
      action = 'draw_edge';
      activeEntities = ['device:WORKSTATION-01', 'ip:198.51.100.24'];
      stateDesc = 'Outbound C2 connection initiated to 198.51.100.24:443';
      break;
    case 'outbound_data_transfer':
      action = 'data_burst';
      activeEntities = ['device:WORKSTATION-01', 'ip:198.51.100.24'];
      stateDesc = 'Exfiltrated 8.45MB customer data archive to external IP 198.51.100.24';
      break;
    case 'failed_login':
      action = 'spawn_alert';
      activeEntities = ['ENT-IP-01', 'ENT-USER-01'];
      stateDesc = 'Host 192.168.1.105 triggering failed password challenges against dev_user41';
      break;
    case 'successful_auth':
      action = 'draw_edge';
      activeEntities = ['ENT-USER-01', 'ENT-DEV-01'];
      stateDesc = 'Compromised credentials used to gain active RDP session on WS-FIN-04';
      break;
    case 'login':
      action = 'highlight_node';
      activeEntities = ['ENT-DEV-01', 'ENT-USER-01'];
      stateDesc = 'User desktop session initialized';
      break;
    case 'privilege_escalation':
      action = 'spawn_alert';
      activeEntities = ['ENT-USER-01', 'ENT-DEV-01'];
      stateDesc = 'Elevation to SYSTEM privileges on workstation WS-FIN-04';
      break;
    case 'process_execution':
      action = 'draw_edge';
      activeEntities = ['ENT-DEV-01', 'ENT-PROC-01'];
      stateDesc = 'Workstation spawns hidden PowerShell PID:6412 for memory harvesting';
      break;
    case 'file_access':
      action = 'draw_edge';
      activeEntities = ['ENT-PROC-01', 'ENT-SRV-01', 'ENT-FILE-01'];
      stateDesc = 'Process opens remote SMB file handle to customer_vault_q3.db on server FS-CORP-01';
      break;
    case 'suspicious_command':
      if (evt.event_id === 'EVT-107') {
        action = 'highlight_node';
        activeEntities = ['ENT-DEV-01', 'ENT-FILE-02'];
        stateDesc = 'Staging compressed archive svchost_upd.zip on local disk';
      } else {
        action = 'spawn_alert';
        activeEntities = ['ENT-DEV-01'];
        stateDesc = 'Anti-forensic command wevtutil executed to wipe Windows Security Event log';
      }
      break;
    case 'network_connection':
      action = 'draw_edge';
      activeEntities = ['ENT-DEV-01', 'ENT-IP-02'];
      stateDesc = 'Outbound TLS TCP handshake to external malicious IP 198.51.100.42:8443';
      break;
    case 'data_exfiltration':
      action = 'data_burst';
      activeEntities = ['ENT-FILE-02', 'ENT-IP-02', 'ENT-DEV-01'];
      stateDesc = '42.8 MB burst exfiltration packet transfer in progress to external C2';
      break;
    case 'logout':
      action = 'highlight_node';
      activeEntities = ['ENT-DEV-01', 'ENT-USER-01'];
      stateDesc = 'Threat actor disconnects session from workstation';
      break;
  }

  return {
    ...evt,
    sequence: index + 1,
    playback_action: action,
    active_entities: activeEntities,
    state_change_description: stateDesc
  };
});

export const MOCK_FINDINGS: Finding[] = [
  {
    finding_id: 'FND-001',
    case_id: 'CASE-001',
    title: 'Compromised Account and Workstation Execution',
    description: 'Adversary leveraged valid employee01 credentials to authenticate from 192.168.1.20, followed by obfuscated PowerShell execution on WORKSTATION-01.',
    severity: 'high',
    confidence: 0.95,
    event_ids: ['EVT-001', 'EVT-002'],
    evidence_ids: ['EVD-001', 'EVD-002'],
    mitre_tactics: ['Initial Access', 'Execution'],
    mitre_techniques: ['T1078.002 - Valid Accounts: Domain Accounts', 'T1059.001 - PowerShell'],
    affected_entities: ['employee01', 'WORKSTATION-01', '192.168.1.20', 'powershell.exe'],
    recommendation: 'Force password reset for employee01, isolate WORKSTATION-01, and enforce PowerShell Constrained Language Mode.'
  },
  {
    finding_id: 'FND-002',
    case_id: 'CASE-001',
    title: 'Lateral Movement and Sensitive Data Collection',
    description: 'Adversary pivoted laterally from WORKSTATION-01 via SMB to file server SRV-CORP-FILE and staged confidential customer records.',
    severity: 'high',
    confidence: 0.94,
    event_ids: ['EVT-003', 'EVT-004'],
    evidence_ids: ['EVD-003', 'EVD-004'],
    mitre_tactics: ['Lateral Movement', 'Collection'],
    mitre_techniques: ['T1021.002 - SMB/Windows Admin Shares', 'T1039 - Data from Network Shared Drive'],
    affected_entities: ['SRV-CORP-FILE', 'customer_data.csv', 'WORKSTATION-01'],
    recommendation: 'Audit SMB permissions on SRV-CORP-FILE, rotate network share credentials, and restrict internal lateral access.'
  },
  {
    finding_id: 'FND-003',
    case_id: 'CASE-001',
    title: 'External Command-and-Control and Data Exfiltration',
    description: 'Internal workstation 192.168.1.20 initiated external connection and transmitted 8.45MB of confidential records to 198.51.100.24:443.',
    severity: 'critical',
    confidence: 0.98,
    event_ids: ['EVT-005', 'EVT-006'],
    evidence_ids: ['EVD-005'],
    mitre_tactics: ['Command and Control', 'Exfiltration'],
    mitre_techniques: ['T1071.001 - Web Protocols', 'T1048.003 - Exfiltration Over Web Service'],
    affected_entities: ['198.51.100.24', 'WORKSTATION-01'],
    recommendation: 'Block IP 198.51.100.24 at perimeter firewall, inspect proxy logs, and assess breach impact under data protection protocol.'
  },
  {
    finding_id: 'FND-101',
    case_id: 'CASE-2026-0882',
    title: 'Credential Compromise via Subnet Brute Force',
    description: 'An attacker positioned on internal IP 192.168.1.105 executed repeated credential trials against account dev_user41 culminating in a successful interactive RDP logon at 02:17 UTC.',
    severity: 'high',
    confidence: 0.96,
    event_ids: ['EVT-101', 'EVT-102'],
    evidence_ids: ['EVD-001'],
    mitre_tactics: ['Initial Access', 'Credential Access'],
    mitre_techniques: ['T1110.001 - Password Guessing', 'T1078.002 - Domain Accounts'],
    affected_entities: ['dev_user41', '192.168.1.105', 'WS-FIN-04'],
    recommendation: 'Force immediate password reset and invalidate Kerberos ticket-granting tickets (TGT) for dev_user41; enforce MFA on internal RDP.'
  },
  {
    finding_id: 'FND-102',
    case_id: 'CASE-2026-0882',
    title: 'Obfuscated PowerShell Execution & Privilege Escalation',
    description: 'Process PowerShell (PID 6412) was executed with encoded Base64 parameters and assigned administrative token privileges (SeDebugPrivilege) to harvest memory and stage file operations.',
    severity: 'critical',
    confidence: 0.98,
    event_ids: ['EVT-104', 'EVT-105'],
    evidence_ids: ['EVD-001', 'EVD-002', 'EVD-005'],
    mitre_tactics: ['Privilege Escalation', 'Execution', 'Defense Evasion'],
    mitre_techniques: ['T1068 - Exploitation for Privilege Escalation', 'T1059.001 - PowerShell'],
    affected_entities: ['WS-FIN-04', 'powershell.exe (PID: 6412)'],
    recommendation: 'Enable PowerShell Constrained Language Mode and AppLocker execution prevention policies on all developer workstations.'
  },
  {
    finding_id: 'FND-103',
    case_id: 'CASE-2026-0882',
    title: 'Unauthorized Data Access & Lateral File Exfiltration',
    description: 'The threat actor accessed the restricted database customer_vault_q3.db on FS-CORP-01, compressed it into a staged masqueraded archive svchost_upd.zip, and exfiltrated 42.8 MB to external IP 198.51.100.42.',
    severity: 'critical',
    confidence: 0.99,
    event_ids: ['EVT-106', 'EVT-107', 'EVT-108', 'EVT-109'],
    evidence_ids: ['EVD-002', 'EVD-003', 'EVD-004'],
    mitre_tactics: ['Collection', 'Exfiltration', 'Command and Control'],
    mitre_techniques: ['T1039 - Data from Network Shared Drive', 'T1560.001 - Archive via Utility', 'T1041 - Exfiltration Over C2 Channel'],
    affected_entities: ['FS-CORP-01', 'customer_vault_q3.db', 'svchost_upd.zip', '198.51.100.42'],
    recommendation: 'Block external IP 198.51.100.42 at edge firewall; review database access control lists on FS-CORP-01; trigger incident response customer data notification procedure.'
  },
  {
    finding_id: 'FND-104',
    case_id: 'CASE-2026-0882',
    title: 'Anti-Forensic Log Tampering Attempt',
    description: 'Prior to session termination, the attacker executed wevtutil cl Security, wiping the Windows Security event log on workstation WS-FIN-04 in an attempt to hinder post-incident investigation.',
    severity: 'high',
    confidence: 0.94,
    event_ids: ['EVT-110'],
    evidence_ids: ['EVD-001'],
    mitre_tactics: ['Defense Evasion'],
    mitre_techniques: ['T1070.001 - Clear Windows Event Logs'],
    affected_entities: ['WS-FIN-04'],
    recommendation: 'Configure centralized forwarders (WEF / Syslog) so endpoint log clearing does not remove server-side forensic records.'
  }
];

export const MOCK_SUMMARY: InvestigationSummary = {
  case_id: 'CASE-001',
  total_evidence: 9,
  total_events: 6,
  suspicious_events: 6,
  compromised_entities: 7,
  attack_paths_count: 1,
  investigation_status: 'investigating',
  first_seen: '2026-10-04T10:15:00Z',
  last_seen: '2026-10-04T10:55:00Z',
  attack_vector: 'Credential Abuse -> Execution -> Lateral Movement -> Data Collection -> C2 & Exfiltration',
  kill_chain_progress: {
    initial_access: true,
    execution: true,
    persistence: true,
    privilege_escalation: true,
    lateral_movement: true,
    exfiltration: true
  }
};
