import urllib.request
import json
import sys

base_api = 'http://127.0.0.1:8000'
base_fe = 'http://127.0.0.1:5173'

def get_json(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'CyberTwin-Smoke/1.0'})
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode('utf-8'))

print("1. Health check:")
health = get_json(f"{base_api}/health")
print("   ->", health)
assert health["status"] == "ok"

print("2. Cases check:")
cases = get_json(f"{base_api}/cases")
c_ids = [c["case_id"] for c in cases]
print(f"   -> {len(cases)} cases found: {c_ids}")
assert "CASE-001" in c_ids

print("3. Evidence check:")
evidence = get_json(f"{base_api}/cases/CASE-001/evidence")
e_ids = [e["evidence_id"] for e in evidence]
print(f"   -> {len(evidence)} evidence items found: {e_ids}")
assert len(evidence) >= 5
for core_id in ["EVD-001", "EVD-002", "EVD-003", "EVD-004", "EVD-005"]:
    assert core_id in e_ids, f"Core evidence {core_id} missing!"

print("4. Events check:")
events = get_json(f"{base_api}/cases/CASE-001/events")
ev_ids = [ev["event_id"] for ev in events]
print(f"   -> {len(events)} events found: {ev_ids}")
assert len(events) == 6
assert ev_ids == ["EVT-001", "EVT-002", "EVT-003", "EVT-004", "EVT-005", "EVT-006"]

print("5. Findings check:")
findings = get_json(f"{base_api}/cases/CASE-001/findings")
f_ids = [f["finding_id"] for f in findings]
print(f"   -> {len(findings)} findings found: {f_ids}")
assert len(findings) == 3
assert f_ids == ["FND-001", "FND-002", "FND-003"]

print("6. Reconstruction check:")
recon = get_json(f"{base_api}/cases/CASE-001/reconstruction")
nodes = recon["graph"]["nodes"]
edges = recon["graph"]["edges"]
stages = recon["attack_progression"]
print(f"   -> Events: {len(recon['events'])}, Entities: {len(nodes)}, Relationships: {len(edges)}, Stages: {len(stages)}, Findings: {len(recon['findings'])}")
assert len(recon["events"]) == 6
assert len(nodes) == 7
assert len(edges) == 15
assert len(stages) == 6
assert len(recon["findings"]) == 3

print("7. 3D Scene check:")
scene = get_json(f"{base_api}/cases/CASE-001/reconstruction/3d-scene")
print(f"   -> Model: {scene['model_asset_url']}, Zones: {len(scene['zones'])}, Markers: {len(scene['markers'])}")
assert len(scene["markers"]) >= 5

print("8. Forensic Report check:")
report = get_json(f"{base_api}/cases/CASE-001/reconstruction/report")
print(f"   -> Report ID: {report['report_id']}, Title: {report['title']}, Custody Items: {len(report['evidence_chain_of_custody'])}")
assert len(report["evidence_chain_of_custody"]) >= 5

print("9. Database Status check:")
db_status = get_json(f"{base_api}/cases/CASE-001/reconstruction/database/status")
print(f"   -> Relational: {db_status['relational_storage']['active_driver']}, Graph: {db_status['graph_database']['status']}")

print("10. Frontend Dev Server check:")
req_fe = urllib.request.Request(base_fe, headers={'User-Agent': 'CyberTwin-Smoke/1.0'})
with urllib.request.urlopen(req_fe) as res:
    fe_html = res.read().decode('utf-8')
    assert '<div id="root"></div>' in fe_html
    print("   -> Frontend HTTP 200 OK, root mount element verified.")

print("\n============================================================")
print("SUCCESS: ALL 10 RUNTIME E2E SMOKE CHECKS PASSED FLAWLESSLY!")
print("============================================================")
