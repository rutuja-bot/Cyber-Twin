// Cyber Twin Incident Graph Export for Case: CASE-001
CREATE CONSTRAINT IF NOT EXISTS FOR (e:CyberEntity) REQUIRE e.id IS UNIQUE;

// 1. Create Nodes
MERGE (n:CyberEntity:User {id: 'user:employee01'}) ON CREATE SET n.label = 'employee01', n.first_seen = '2026-10-04T10:15:00', n.last_seen = '2026-10-04T10:22:45', n.case_id = 'CASE-001';
MERGE (n:CyberEntity:Workstation {id: 'device:WORKSTATION-01'}) ON CREATE SET n.label = 'WORKSTATION-01', n.first_seen = '2026-10-04T10:15:00', n.last_seen = '2026-10-04T10:22:45', n.case_id = 'CASE-001';
MERGE (n:CyberEntity:Ip_address {id: 'ip:192.168.1.20'}) ON CREATE SET n.label = '192.168.1.20', n.first_seen = '2026-10-04T10:15:00', n.last_seen = '2026-10-04T10:25:00', n.case_id = 'CASE-001';
MERGE (n:CyberEntity:File_object {id: 'file:powershell.exe'}) ON CREATE SET n.label = 'powershell.exe', n.first_seen = '2026-10-04T10:18:30', n.last_seen = '2026-10-04T10:18:30', n.case_id = 'CASE-001';
MERGE (n:CyberEntity:Server {id: 'server:SRV-CORP-FILE'}) ON CREATE SET n.label = 'SRV-CORP-FILE', n.first_seen = '2026-10-04T10:21:05', n.last_seen = '2026-10-04T10:22:45', n.case_id = 'CASE-001';
MERGE (n:CyberEntity:File_object {id: 'file:\SRV-CORP-FILE\confidential\customer_data.csv'}) ON CREATE SET n.label = 'customer_data.csv', n.first_seen = '2026-10-04T10:22:45', n.last_seen = '2026-10-04T10:22:45', n.case_id = 'CASE-001';
MERGE (n:CyberEntity:Ip_address {id: 'ip:198.51.100.24'}) ON CREATE SET n.label = '198.51.100.24', n.first_seen = '2026-10-04T10:24:15', n.last_seen = '2026-10-04T10:25:00', n.case_id = 'CASE-001';

// 2. Create Directed Relationships
MATCH (src:CyberEntity {id: 'user:employee01'}), (dst:CyberEntity {id: 'device:WORKSTATION-01'}) MERGE (src)-[r:AUTHENTICATED_TO {event_id: 'EVT-001', timestamp: '2026-10-04T10:15:00', evidence_id: 'EVD-001', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'device:WORKSTATION-01'}), (dst:CyberEntity {id: 'ip:192.168.1.20'}) MERGE (src)-[r:RESOLVED_IP {event_id: 'EVT-001', timestamp: '2026-10-04T10:15:00', evidence_id: 'EVD-001', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'user:employee01'}), (dst:CyberEntity {id: 'device:WORKSTATION-01'}) MERGE (src)-[r:USES {event_id: 'EVT-002', timestamp: '2026-10-04T10:18:30', evidence_id: 'EVD-002', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'device:WORKSTATION-01'}), (dst:CyberEntity {id: 'file:powershell.exe'}) MERGE (src)-[r:EXECUTED {event_id: 'EVT-002', timestamp: '2026-10-04T10:18:30', evidence_id: 'EVD-002', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'user:employee01'}), (dst:CyberEntity {id: 'device:WORKSTATION-01'}) MERGE (src)-[r:USES {event_id: 'EVT-003', timestamp: '2026-10-04T10:21:05', evidence_id: 'EVD-003', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'device:WORKSTATION-01'}), (dst:CyberEntity {id: 'ip:192.168.1.20'}) MERGE (src)-[r:RESOLVED_IP {event_id: 'EVT-003', timestamp: '2026-10-04T10:21:05', evidence_id: 'EVD-003', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'device:WORKSTATION-01'}), (dst:CyberEntity {id: 'server:SRV-CORP-FILE'}) MERGE (src)-[r:CONNECTED_TO {event_id: 'EVT-003', timestamp: '2026-10-04T10:21:05', evidence_id: 'EVD-003', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'user:employee01'}), (dst:CyberEntity {id: 'device:WORKSTATION-01'}) MERGE (src)-[r:USES {event_id: 'EVT-004', timestamp: '2026-10-04T10:22:45', evidence_id: 'EVD-004', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'device:WORKSTATION-01'}), (dst:CyberEntity {id: 'server:SRV-CORP-FILE'}) MERGE (src)-[r:CONNECTED_TO {event_id: 'EVT-004', timestamp: '2026-10-04T10:22:45', evidence_id: 'EVD-004', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'user:employee01'}), (dst:CyberEntity {id: 'file:\SRV-CORP-FILE\confidential\customer_data.csv'}) MERGE (src)-[r:ACCESSED {event_id: 'EVT-004', timestamp: '2026-10-04T10:22:45', evidence_id: 'EVD-004', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'user:employee01'}), (dst:CyberEntity {id: 'device:WORKSTATION-01'}) MERGE (src)-[r:USES {event_id: 'EVT-005', timestamp: '2026-10-04T10:24:15', evidence_id: 'EVD-005', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'device:WORKSTATION-01'}), (dst:CyberEntity {id: 'ip:192.168.1.20'}) MERGE (src)-[r:RESOLVED_IP {event_id: 'EVT-005', timestamp: '2026-10-04T10:24:15', evidence_id: 'EVD-005', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'device:WORKSTATION-01'}), (dst:CyberEntity {id: 'ip:198.51.100.24'}) MERGE (src)-[r:CONNECTED_TO {event_id: 'EVT-005', timestamp: '2026-10-04T10:24:15', evidence_id: 'EVD-005', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'device:WORKSTATION-01'}), (dst:CyberEntity {id: 'ip:192.168.1.20'}) MERGE (src)-[r:RESOLVED_IP {event_id: 'EVT-006', timestamp: '2026-10-04T10:25:00', evidence_id: 'EVD-005', case_id: 'CASE-001'}]->(dst);
MATCH (src:CyberEntity {id: 'device:WORKSTATION-01'}), (dst:CyberEntity {id: 'ip:198.51.100.24'}) MERGE (src)-[r:EXFILTRATED_TO {event_id: 'EVT-006', timestamp: '2026-10-04T10:25:00', evidence_id: 'EVD-005', case_id: 'CASE-001'}]->(dst);