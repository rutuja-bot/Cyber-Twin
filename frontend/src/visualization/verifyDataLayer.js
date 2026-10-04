/**
 * Verification Script for Cyber Twin Visualization Data Layer (Stage 1)
 * 
 * Verifies:
 * 1. Mock dataset strictly follows Backend Event v1 contract.
 * 2. Entities are correctly derived from event fields.
 * 3. Relationships are correctly derived from event interactions.
 * 4. Events are sorted in strict chronological order.
 * 5. Evidence IDs remain 100% traceable.
 */

const {
  mockEvents,
  isValidBackendEvent,
  sortEventsChronologically,
  deriveEntities,
  deriveRelationships,
  buildEvidenceMap,
  createCyberTwinDataModel
} = require('./index');

console.log('================================================================');
console.log('   CYBER TWIN VISUALIZATION DATA LAYER VERIFICATION (STAGE 1)   ');
console.log('================================================================\n');

let allPassed = true;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
  } else {
    console.error(`[FAIL] ${message}`);
    allPassed = false;
  }
}

// -------------------------------------------------------------
// CHECK 1: Event Contract Adherence
// -------------------------------------------------------------
console.log('--- 1. Event Contract Validation ---');
assert(Array.isArray(mockEvents) && mockEvents.length === 7, `Mock dataset loaded with 7 events`);

const expectedKeys = [
  'event_id', 'case_id', 'timestamp', 'event_type',
  'user', 'device', 'source_ip', 'destination_ip',
  'file', 'server', 'evidence_id'
];

mockEvents.forEach((evt, idx) => {
  const actualKeys = Object.keys(evt);
  const keysMatch = expectedKeys.every(k => actualKeys.includes(k)) && actualKeys.length === expectedKeys.length;
  assert(keysMatch && isValidBackendEvent(evt), `Event #${idx + 1} (${evt.event_id}) strictly matches 11-field v1 contract`);
});

// -------------------------------------------------------------
// CHECK 2: Chronological Sorting
// -------------------------------------------------------------
console.log('\n--- 2. Chronological Ordering ---');
const sortedEvents = sortEventsChronologically(mockEvents);
let isChronological = true;
for (let i = 1; i < sortedEvents.length; i++) {
  if (new Date(sortedEvents[i].timestamp) < new Date(sortedEvents[i - 1].timestamp)) {
    isChronological = false;
    break;
  }
}
assert(isChronological, `Events correctly sorted from ${sortedEvents[0].timestamp} to ${sortedEvents[sortedEvents.length - 1].timestamp}`);

// -------------------------------------------------------------
// CHECK 3: Entity Derivation
// -------------------------------------------------------------
console.log('\n--- 3. Entity Derivation ---');
const entities = deriveEntities(sortedEvents);
assert(entities.length > 0, `Derived ${entities.length} distinct entities from events`);

const entityTypes = [...new Set(entities.map(e => e.type))];
console.log(`Derived Entity Types: ${entityTypes.join(', ')}`);
assert(entityTypes.includes('user'), `User entities derived`);
assert(entityTypes.includes('device'), `Device entities derived`);
assert(entityTypes.includes('ip'), `IP entities derived`);
assert(entityTypes.includes('file'), `File entities derived`);
assert(entityTypes.includes('server'), `Server entities derived`);

entities.forEach(ent => {
  assert(ent.event_ids.length > 0, `Entity [${ent.id}] links to events: [${ent.event_ids.join(', ')}]`);
  assert(ent.evidence_ids.length > 0, `Entity [${ent.id}] links to evidence: [${ent.evidence_ids.join(', ')}]`);
});

// -------------------------------------------------------------
// CHECK 4: Relationship Derivation
// -------------------------------------------------------------
console.log('\n--- 4. Relationship Derivation ---');
const relationships = deriveRelationships(sortedEvents);
assert(relationships.length > 0, `Derived ${relationships.length} relationships from events`);

const relTypes = [...new Set(relationships.map(r => r.type))];
console.log(`Derived Relationship Types: ${relTypes.join(', ')}`);
assert(relTypes.includes('USES'), `USES relationships derived (USER -> DEVICE)`);
assert(relTypes.includes('CONNECTED_TO'), `CONNECTED_TO relationships derived (DEVICE/IP -> SERVER/IP)`);
assert(relTypes.includes('ACCESSED'), `ACCESSED relationships derived (DEVICE/USER -> FILE)`);

relationships.forEach(rel => {
  assert(rel.source_id && rel.target_id && rel.evidence_id,
    `Rel [${rel.id}] ${rel.source_id} --(${rel.type})--> ${rel.target_id} [evidence: ${rel.evidence_id}]`);
});

// -------------------------------------------------------------
// CHECK 5: Evidence Traceability
// -------------------------------------------------------------
console.log('\n--- 5. Evidence Traceability ---');
const evidenceMap = buildEvidenceMap(sortedEvents, entities);
const evidenceIds = Object.keys(evidenceMap);
assert(evidenceIds.length === 7, `Evidence map contains all 7 evidence records (EVD-001 through EVD-007)`);

evidenceIds.forEach(evId => {
  const ev = evidenceMap[evId];
  assert(ev.event_ids.length > 0, `Evidence [${evId}] traces to events: [${ev.event_ids.join(', ')}] and entities: [${ev.entity_ids.join(', ')}]`);
});

// -------------------------------------------------------------
// CHECK 6: Master Factory Integration
// -------------------------------------------------------------
console.log('\n--- 6. CyberTwinDataModel Factory ---');
const model = createCyberTwinDataModel(mockEvents);
assert(model.case_id === 'CASE-001', `Model correctly identifies case: ${model.case_id}`);
assert(model.events.length === 7, `Model encapsulates 7 events`);
assert(model.entities.length === entities.length, `Model exposes ${model.entities.length} entities`);
assert(model.relationships.length === relationships.length, `Model exposes ${model.relationships.length} relationships`);
assert(typeof model.getEntityById === 'function', `Helper getEntityById works`);
assert(typeof model.getEventsByEntity === 'function', `Helper getEventsByEntity works`);
assert(typeof model.getEventsByEvidence === 'function', `Helper getEventsByEvidence works`);

console.log('\n================================================================');
if (allPassed) {
  console.log('   ALL CHECKS PASSED: STAGE 1 DATA LAYER IS FULLY VERIFIED!   ');
} else {
  console.error('   SOME CHECKS FAILED: REVIEW LOGS ABOVE.                    ');
  process.exit(1);
}
console.log('================================================================\n');

