/**
 * Cyber Twin Visualization Data Adapter
 * 
 * Modular adapter that ingests raw Backend v1 Events and derives:
 * - Chronologically ordered event timeline
 * - Unique visualization entities (User, Device, IP, File, Server)
 * - Directed visual relationships (USES, CONNECTED_TO, ACCESSED)
 * - Evidence traceability mappings linking back to evidence_id
 * 
 * Designed to be modular so it can be swapped if the backend later exposes
 * explicit graph endpoints.
 */

/**
 * Validates that an object adheres strictly to the Backend Event v1 contract.
 * @param {Object} evt - Event candidate
 * @returns {boolean}
 */
function isValidBackendEvent(evt) {
  if (!evt || typeof evt !== 'object') return false;
  return (
    typeof evt.event_id === 'string' &&
    typeof evt.case_id === 'string' &&
    typeof evt.timestamp === 'string' &&
    typeof evt.event_type === 'string' &&
    typeof evt.evidence_id === 'string'
  );
}

/**
 * Sorts raw backend events in strict chronological order.
 * @param {Array<Object>} events - Array of BackendEvent objects
 * @returns {Array<Object>} Sorted copy of events
 */
function sortEventsChronologically(events) {
  return [...events].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return a.event_id.localeCompare(b.event_id);
  });
}

/**
 * Helper to register or update an entity record.
 */
function registerEntity(entityMap, type, name, eventId, evidenceId, timestamp) {
  if (!name) return null;
  const id = `${type}:${name}`;
  if (!entityMap.has(id)) {
    entityMap.set(id, {
      id,
      name,
      type,
      first_seen: timestamp,
      last_seen: timestamp,
      event_ids: [eventId],
      evidence_ids: [evidenceId]
    });
  } else {
    const record = entityMap.get(id);
    if (!record.event_ids.includes(eventId)) {
      record.event_ids.push(eventId);
    }
    if (!record.evidence_ids.includes(evidenceId)) {
      record.evidence_ids.push(evidenceId);
    }
    if (new Date(timestamp) < new Date(record.first_seen)) {
      record.first_seen = timestamp;
    }
    if (new Date(timestamp) > new Date(record.last_seen)) {
      record.last_seen = timestamp;
    }
  }
  return id;
}

/**
 * Derives unique visualization entities from backend events.
 * @param {Array<Object>} events - Array of BackendEvent objects
 * @returns {Array<Object>} Array of VisualizationEntity objects
 */
function deriveEntities(events) {
  const entityMap = new Map();

  for (const evt of events) {
    if (evt.user) {
      registerEntity(entityMap, 'user', evt.user, evt.event_id, evt.evidence_id, evt.timestamp);
    }
    if (evt.device) {
      registerEntity(entityMap, 'device', evt.device, evt.event_id, evt.evidence_id, evt.timestamp);
    }
    if (evt.source_ip) {
      registerEntity(entityMap, 'ip', evt.source_ip, evt.event_id, evt.evidence_id, evt.timestamp);
    }
    if (evt.destination_ip) {
      registerEntity(entityMap, 'ip', evt.destination_ip, evt.event_id, evt.evidence_id, evt.timestamp);
    }
    if (evt.file) {
      registerEntity(entityMap, 'file', evt.file, evt.event_id, evt.evidence_id, evt.timestamp);
    }
    if (evt.server) {
      registerEntity(entityMap, 'server', evt.server, evt.event_id, evt.evidence_id, evt.timestamp);
    }
  }

  return Array.from(entityMap.values());
}

/**
 * Derives visualization relationships from backend events based on domain semantics.
 * Relationships derived:
 * - USER -> USES -> DEVICE
 * - DEVICE -> CONNECTED_TO -> SERVER
 * - DEVICE -> CONNECTED_TO -> IP
 * - IP -> CONNECTED_TO -> IP
 * - DEVICE / USER -> ACCESSED -> FILE
 * 
 * @param {Array<Object>} events - Array of BackendEvent objects
 * @returns {Array<Object>} Array of VisualizationRelationship objects
 */
function deriveRelationships(events) {
  const relationships = [];
  const relDedupe = new Set();

  function addRel(sourceId, targetId, type, evt) {
    if (!sourceId || !targetId || sourceId === targetId) return;
    const dedupeKey = `${evt.event_id}:${sourceId}:${type}:${targetId}`;
    if (relDedupe.has(dedupeKey)) return;
    relDedupe.add(dedupeKey);

    relationships.push({
      id: `rel_${relationships.length + 1}_${evt.event_id}`,
      source_id: sourceId,
      target_id: targetId,
      type,
      event_id: evt.event_id,
      evidence_id: evt.evidence_id,
      timestamp: evt.timestamp
    });
  }

  for (const evt of events) {
    const userNode = evt.user ? `user:${evt.user}` : null;
    const deviceNode = evt.device ? `device:${evt.device}` : null;
    const srcIpNode = evt.source_ip ? `ip:${evt.source_ip}` : null;
    const dstIpNode = evt.destination_ip ? `ip:${evt.destination_ip}` : null;
    const fileNode = evt.file ? `file:${evt.file}` : null;
    const serverNode = evt.server ? `server:${evt.server}` : null;

    // 1. USER -> USES -> DEVICE
    if (userNode && deviceNode) {
      addRel(userNode, deviceNode, 'USES', evt);
    }

    // 2. DEVICE -> CONNECTED_TO -> SERVER
    if (deviceNode && serverNode) {
      addRel(deviceNode, serverNode, 'CONNECTED_TO', evt);
    }

    // 3. DEVICE -> CONNECTED_TO -> IP (Destination or Source)
    if (deviceNode && dstIpNode) {
      addRel(deviceNode, dstIpNode, 'CONNECTED_TO', evt);
    } else if (deviceNode && srcIpNode && !dstIpNode) {
      addRel(deviceNode, srcIpNode, 'CONNECTED_TO', evt);
    }

    // 4. IP -> CONNECTED_TO -> IP (Network hops / Remote exfiltration)
    if (srcIpNode && dstIpNode) {
      addRel(srcIpNode, dstIpNode, 'CONNECTED_TO', evt);
    }

    // 5. DEVICE / USER -> ACCESSED -> FILE
    if (fileNode) {
      if (deviceNode) {
        addRel(deviceNode, fileNode, 'ACCESSED', evt);
      } else if (userNode) {
        addRel(userNode, fileNode, 'ACCESSED', evt);
      }
    }
  }

  return relationships;
}

/**
 * Builds an evidence traceability index mapping evidence_id to related events, entities, and timestamps.
 * @param {Array<Object>} events - Sorted BackendEvent objects
 * @param {Array<Object>} entities - Derived VisualizationEntity objects
 * @returns {Object} Evidence traceability dictionary
 */
function buildEvidenceMap(events, entities) {
  const evidenceMap = {};

  for (const evt of events) {
    if (!evidenceMap[evt.evidence_id]) {
      evidenceMap[evt.evidence_id] = {
        evidence_id: evt.evidence_id,
        event_ids: [],
        entity_ids: [],
        timestamps: []
      };
    }
    const entry = evidenceMap[evt.evidence_id];
    if (!entry.event_ids.includes(evt.event_id)) {
      entry.event_ids.push(evt.event_id);
    }
    if (!entry.timestamps.includes(evt.timestamp)) {
      entry.timestamps.push(evt.timestamp);
    }
  }

  for (const ent of entities) {
    for (const evId of ent.evidence_ids) {
      if (evidenceMap[evId] && !evidenceMap[evId].entity_ids.includes(ent.id)) {
        evidenceMap[evId].entity_ids.push(ent.id);
      }
    }
  }

  return evidenceMap;
}

/**
 * Master Factory: Creates the unified CyberTwinDataModel from raw Backend v1 Events.
 * @param {Array<Object>} rawEvents - Array of raw BackendEvent objects
 * @returns {Object} CyberTwinDataModel
 */
function createCyberTwinDataModel(rawEvents) {
  if (!Array.isArray(rawEvents)) {
    throw new Error('createCyberTwinDataModel requires an array of raw events.');
  }

  for (const evt of rawEvents) {
    if (!isValidBackendEvent(evt)) {
      throw new Error(`Invalid event format detected: ${JSON.stringify(evt)}`);
    }
  }

  const sortedEvents = sortEventsChronologically(rawEvents);
  const entities = deriveEntities(sortedEvents);
  const relationships = deriveRelationships(sortedEvents);
  const evidenceMap = buildEvidenceMap(sortedEvents, entities);

  const caseId = sortedEvents.length > 0 ? sortedEvents[0].case_id : 'UNKNOWN_CASE';

  return {
    case_id: caseId,
    events: sortedEvents,
    entities,
    relationships,
    evidence_map: evidenceMap,

    // Query helper functions
    getEntityById(id) {
      return entities.find(e => e.id === id) || null;
    },
    getEventsByEntity(entityId) {
      return sortedEvents.filter(evt => {
        const entIds = [
          evt.user ? `user:${evt.user}` : null,
          evt.device ? `device:${evt.device}` : null,
          evt.source_ip ? `ip:${evt.source_ip}` : null,
          evt.destination_ip ? `ip:${evt.destination_ip}` : null,
          evt.file ? `file:${evt.file}` : null,
          evt.server ? `server:${evt.server}` : null
        ];
        return entIds.includes(entityId);
      });
    },
    getEventsByEvidence(evidenceId) {
      return sortedEvents.filter(evt => evt.evidence_id === evidenceId);
    },
    getRelationshipsByEvent(eventId) {
      return relationships.filter(rel => rel.event_id === eventId);
    }
  };
}

module.exports = {
  isValidBackendEvent,
  sortEventsChronologically,
  deriveEntities,
  deriveRelationships,
  buildEvidenceMap,
  createCyberTwinDataModel
};

