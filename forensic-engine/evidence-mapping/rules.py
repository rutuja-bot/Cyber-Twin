"""Rule definitions for mapping normalized events to MITRE ATT&CK techniques."""

from dataclasses import dataclass
from typing import Callable, Optional

from normalization.models import NormalizedEvent
from .models import MitreTechnique


@dataclass
class MappingRule:
    """A threat intelligence mapping rule linking an event pattern to a MITRE ATT&CK technique."""

    rule_id: str
    name: str
    condition: Callable[[NormalizedEvent], bool]
    mitre_technique: MitreTechnique
    confidence: float
    description: str


STANDARD_MITRE_RULES = [
    # 1. Initial Access: Compromised Credentials / Suspicious Logon
    MappingRule(
        rule_id="RULE-MAP-001",
        name="Valid Accounts - Compromised Domain Logon",
        condition=lambda e: e.event_type in ("suspicious_login", "login") and (e.user == "employee01" or e.source_ip == "192.168.1.20"),
        mitre_technique=MitreTechnique(
            technique_id="T1078.002",
            technique_name="Valid Accounts: Domain Accounts",
            tactic="Initial Access",
            subtechnique_id="T1078.002",
            url="https://attack.mitre.org/techniques/T1078/002/",
        ),
        confidence=0.95,
        description="Adversary leveraged compromised employee credentials to gain initial access to enterprise infrastructure.",
    ),
    # 2. Execution: Suspicious Process Spawning / PowerShell
    MappingRule(
        rule_id="RULE-MAP-002",
        name="Command and Scripting Interpreter - PowerShell",
        condition=lambda e: e.event_type in ("suspicious_process_spawn", "process_spawn") and (
            e.file is not None and "powershell" in e.file.lower()
        ),
        mitre_technique=MitreTechnique(
            technique_id="T1059.001",
            technique_name="Command and Scripting Interpreter: PowerShell",
            tactic="Execution",
            subtechnique_id="T1059.001",
            url="https://attack.mitre.org/techniques/T1059/001/",
        ),
        confidence=0.98,
        description="Execution of obfuscated commands via PowerShell on internal workstation.",
    ),
    # 3. Lateral Movement: Remote Services / SMB Admin Shares
    MappingRule(
        rule_id="RULE-MAP-003",
        name="Remote Services - SMB/Windows Admin Shares",
        condition=lambda e: e.event_type in ("internal_server_connection", "server_connection"),
        mitre_technique=MitreTechnique(
            technique_id="T1021.002",
            technique_name="Remote Services: SMB/Windows Admin Shares",
            tactic="Lateral Movement",
            subtechnique_id="T1021.002",
            url="https://attack.mitre.org/techniques/T1021/002/",
        ),
        confidence=0.92,
        description="Adversary established lateral SMB session across internal network to target enterprise file server.",
    ),
    # 4. Collection: Data from Network Shared Drive
    MappingRule(
        rule_id="RULE-MAP-004",
        name="Data from Network Shared Drive",
        condition=lambda e: e.event_type in ("sensitive_file_access", "file_access") or (
            e.file is not None and any(term in e.file.lower() for term in ("confidential", "secret", "customer"))
        ),
        mitre_technique=MitreTechnique(
            technique_id="T1039",
            technique_name="Data from Network Shared Drive",
            tactic="Collection",
            subtechnique_id=None,
            url="https://attack.mitre.org/techniques/T1039/",
        ),
        confidence=0.96,
        description="Adversary staged and accessed confidential customer files stored on internal network shares.",
    ),
    # 5. Command and Control: Application Layer Web Protocol
    MappingRule(
        rule_id="RULE-MAP-005",
        name="Application Layer Protocol - Web Protocols",
        condition=lambda e: e.event_type in ("suspicious_network_connection", "network_connection") or (
            e.destination_ip is not None and "transfer" not in e.event_type.lower()
        ),
        mitre_technique=MitreTechnique(
            technique_id="T1071.001",
            technique_name="Application Layer Protocol: Web Protocols",
            tactic="Command and Control",
            subtechnique_id="T1071.001",
            url="https://attack.mitre.org/techniques/T1071/001/",
        ),
        confidence=0.88,
        description="Outbound command-and-control connection established from internal host to external suspect IP.",
    ),
    # 6. Exfiltration: Exfiltration Over C2 / Alternative Protocol
    MappingRule(
        rule_id="RULE-MAP-006",
        name="Exfiltration Over Alternative Protocol",
        condition=lambda e: e.event_type in ("outbound_data_transfer", "data_transfer", "data_exfiltration") or (
            "transfer" in e.event_type.lower() or "exfil" in e.event_type.lower()
        ),
        mitre_technique=MitreTechnique(
            technique_id="T1048.003",
            technique_name="Exfiltration Over Alternative Protocol: Exfiltration Over Web Service",
            tactic="Exfiltration",
            subtechnique_id="T1048.003",
            url="https://attack.mitre.org/techniques/T1048/003/",
        ),
        confidence=0.97,
        description="High volume data exfiltration from internal workstation to external adversary infrastructure.",
    ),
]
