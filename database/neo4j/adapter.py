"""Neo4j Graph Database Adapter & Cypher Query Exporter.

Enables exporting the Cyber Twin entity-relationship graph, attack paths, and timeline
into production Neo4j Cypher statements for graph queries and visualization.
"""

import os
from pathlib import Path
from typing import Any, Dict, List


class Neo4jAdapter:
    """Manages Neo4j connectivity, Cypher statement compilation, and graph exports."""

    def __init__(self, uri: str = None, user: str = None, password: str = None):
        self.uri = uri or os.getenv("NEO4J_URI", "bolt://localhost:7687")
        self.user = user or os.getenv("NEO4J_USER", "neo4j")
        self.password = password or os.getenv("NEO4J_PASSWORD", "cyber_twin_secret")

    def check_connection(self) -> Dict[str, Any]:
        """Test Neo4j bolt driver availability."""
        try:
            from neo4j import GraphDatabase
            driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            with driver.session() as session:
                result = session.run("RETURN 1 AS test")
                record = result.single()
            driver.close()
            return {
                "driver": "neo4j_bolt",
                "uri": self.uri,
                "status": "connected",
                "message": "Successfully connected to Neo4j Graph Database cluster.",
            }
        except ImportError:
            return {
                "driver": "neo4j_cypher_exporter",
                "uri": self.uri,
                "status": "in_memory_cypher_generator",
                "message": "Neo4j driver not installed in local environment; Cypher export pipeline active for cluster ingestion.",
            }
        except Exception as e:
            return {
                "driver": "neo4j_bolt",
                "uri": self.uri,
                "status": "cluster_unreachable",
                "message": f"Neo4j service not responding at {self.uri}. In-memory STIX 2.1 graph running locally.",
                "error": str(e),
            }

    def generate_cypher(self, graph_data: Dict[str, Any], case_id: str = "CASE-001") -> str:
        """Compile Cyber Twin nodes and edges into executable Cypher statements."""
        nodes = graph_data.get("nodes", [])
        edges = graph_data.get("edges", [])

        statements: List[str] = [
            f"// Cyber Twin Incident Graph Export for Case: {case_id}",
            "CREATE CONSTRAINT IF NOT EXISTS FOR (e:CyberEntity) REQUIRE e.id IS UNIQUE;",
            "",
            "// 1. Create Nodes",
        ]

        for n in nodes:
            node_id = n.get("id", "").replace("'", "\\'")
            node_type = (n.get("type", "entity") or "entity").capitalize().replace(" ", "")
            label = n.get("label", node_id).replace("'", "\\'")
            first_seen = n.get("first_seen", "")
            last_seen = n.get("last_seen", "")

            stmt = (
                f"MERGE (n:CyberEntity:{node_type} {{id: '{node_id}'}}) "
                f"ON CREATE SET n.label = '{label}', n.first_seen = '{first_seen}', n.last_seen = '{last_seen}', n.case_id = '{case_id}';"
            )
            statements.append(stmt)

        statements.append("")
        statements.append("// 2. Create Directed Relationships")

        for e in edges:
            source = e.get("source", "").replace("'", "\\'")
            target = e.get("target", "").replace("'", "\\'")
            rel_type = e.get("type", "CONNECTED_TO").upper().replace("-", "_").replace(" ", "_")
            event_id = e.get("event_id", "")
            timestamp = e.get("timestamp", "")
            evidence_id = (e.get("evidence_ids") or [e.get("evidence_id", "")])[0]

            stmt = (
                f"MATCH (src:CyberEntity {{id: '{source}'}}), (dst:CyberEntity {{id: '{target}'}}) "
                f"MERGE (src)-[r:{rel_type} {{event_id: '{event_id}', timestamp: '{timestamp}', evidence_id: '{evidence_id}', case_id: '{case_id}'}}]->(dst);"
            )
            statements.append(stmt)

        return "\n".join(statements)

    def export_cypher_file(self, graph_data: Dict[str, Any], case_id: str = "CASE-001", output_path: str = None) -> str:
        """Export Cypher statements to file."""
        cypher = self.generate_cypher(graph_data, case_id)
        out_file = Path(output_path) if output_path else Path(f"data/processed/cyber_twin_{case_id}.cypher")
        out_file.parent.mkdir(parents=True, exist_ok=True)
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(cypher)
        return str(out_file)
