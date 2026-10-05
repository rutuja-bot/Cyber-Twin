/**
 * Cyber Twin Visualization Data Adapter
 *
 * Modular adapter that bridges raw Backend v1 Events and the canonical
 * Incident Reconstruction API output to the Cyber Twin Visualization Layer:
 * - Chronologically ordered event timeline with MITRE ATT&CK stages
 * - Canonical visualization entities (User, Device/Workstation, IP, File, Server)
 * - Canonical directed visual relationships (AUTHENTICATED_TO, RESOLVED_IP, USES, EXECUTED, CONNECTED_TO, ACCESSED, EXFILTRATED_TO)
 * - Evidence traceability mappings linking back to evidence_id
 *
 * Functions:
 * - isValidBackendEvent(evt)
 * - sortEventsChronologically(events)
 * - deriveEntities(events)
 * - deriveRelationships(events)
 * - buildEvidenceMap(events, entities)
 * - createModelFromReconstruction(reconstructionData) [CANONICAL BACKEND ADAPTER]
 * - createCyberTwinDataModel(input) [POLYMORPHIC FACTORY: accepts events array OR reconstruction object]
 */

/**
 * Validates that an object adheres strictly to the Backend Event v1 contract.
 * @param {Object} evt - Event candidate
 * @returns {boolean}
 */
export function isValidBackendEvent(evt) {
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
export function sortEventsChronologically(events) {
  if (!Array.isArray(events)) return [];
  return [...events].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return (a.event_id || '').localeCompare(b.event_id || '');
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
export function deriveEntities(events) {
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
 * Derives visualization relationships from raw backend events.
 * @param {Array<Object>} events - Array of BackendEvent objects
 * @returns {Array<Object>} Array of VisualizationRelationship objects
 */
export function deriveRelationships(events) {
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
      evidence_ids: [evt.evidence_id],
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

    // 1. User -> Device
    if (userNode && deviceNode) {
      if (evt.event_type === 'suspicious_login' || evt.event_type === 'login') {
        addRel(userNode, deviceNode, 'AUTHENTICATED_TO', evt);
      } else {
        addRel(userNode, deviceNode, 'USES', evt);
      }
    }

    // 2. Device -> IP
    if (deviceNode && srcIpNode) {
      addRel(deviceNode, srcIpNode, 'RESOLVED_IP', evt);
    }

    // 3. Device -> Server
    if (deviceNode && serverNode) {
      addRel(deviceNode, serverNode, 'CONNECTED_TO', evt);
    }

    // 4. Device -> File / Process
    if (deviceNode && fileNode) {
      if ((evt.event_type || '').includes('process') || (evt.event_type || '').includes('spawn')) {
        addRel(deviceNode, fileNode, 'EXECUTED', evt);
      } else {
        addRel(deviceNode, fileNode, 'ACCESSED', evt);
      }
    } else if (userNode && fileNode) {
      addRel(userNode, fileNode, 'ACCESSED', evt);
    }

    // 5. Network Connections and Egress
    if (deviceNode && dstIpNode) {
      if ((evt.event_type || '').includes('transfer') || (evt.event_type || '').includes('exfil')) {
        addRel(deviceNode, dstIpNode, 'EXFILTRATED_TO', evt);
      } else {
        addRel(deviceNode, dstIpNode, 'CONNECTED_TO', evt);
      }
    } else if (srcIpNode && dstIpNode) {
      if ((evt.event_type || '').includes('transfer') || (evt.event_type || '').includes('exfil')) {
        addRel(srcIpNode, dstIpNode, 'EXFILTRATED_TO', evt);
      } else {
        addRel(srcIpNode, dstIpNode, 'CONNECTED_TO', evt);
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
export function buildEvidenceMap(events, entities) {
  const evidenceMap = {};

  for (const evt of events) {
    if (!evt.evidence_id) continue;
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

  for (const ent of (entities || [])) {
    for (const evId of (ent.evidence_ids || [])) {
      if (evidenceMap[evId] && !evidenceMap[evId].entity_ids.includes(ent.id)) {
        evidenceMap[evId].entity_ids.push(ent.id);
      }
    }
  }

  return evidenceMap;
}

/**
 * Canonical Adapter: Consumes the full Backend Incident Reconstruction payload
 * (from GET /cases/{case_id}/reconstruction) and prepares the unified CyberTwinDataModel.
 * Preserves backend graph nodes, canonical rich relationship types, timeline stages, and findings.
 *
 * @param {Object} reconstruction - Backend reconstruction payload
 * @returns {Object} CyberTwinDataModel
 */
export function createModelFromReconstruction(reconstruction) {
  if (!reconstruction || typeof reconstruction !== 'object') {
    throw new Error('createModelFromReconstruction requires a valid reconstruction object.');
  }

  const rawEvents = Array.isArray(reconstruction.events) ? reconstruction.events : [];
  const sortedEvents = sortEventsChronologically(rawEvents);
  const caseId = reconstruction.case_id || (sortedEvents[0]?.case_id) || 'UNKNOWN_CASE';

  // 1. Entities: Map from backend graph nodes if present, else fallback to event derivation
  let entities = [];
  if (reconstruction.graph && Array.isArray(reconstruction.graph.nodes) && reconstruction.graph.nodes.length > 0) {
    entities = reconstruction.graph.nodes.map(node => {
      let normType = node.type || 'device';
      if (normType === 'workstation') normType = 'device';
      if (normType === 'ip_address') normType = 'ip';
      if (normType === 'file_object') normType = 'file';

      // Correlate associated event IDs from reconstruction events
      const eventIds = sortedEvents
        .filter(evt => {
          return (
            (evt.user && `user:${evt.user}` === node.id) ||
            (evt.device && `device:${evt.device}` === node.id) ||
            (evt.source_ip && `ip:${evt.source_ip}` === node.id) ||
            (evt.destination_ip && `ip:${evt.destination_ip}` === node.id) ||
            (evt.file && `file:${evt.file}` === node.id) ||
            (evt.server && `server:${evt.server}` === node.id)
          );
        })
        .map(e => e.event_id);

      // Correlate associated evidence IDs
      const evidenceIds = sortedEvents
        .filter(e => eventIds.includes(e.event_id) && e.evidence_id)
        .map(e => e.evidence_id);

      return {
        id: node.id,
        name: node.label || node.id,
        type: normType,
        first_seen: node.first_seen || (sortedEvents[0]?.timestamp || ''),
        last_seen: node.last_seen || (sortedEvents[sortedEvents.length - 1]?.timestamp || ''),
        properties: node.properties || {},
        event_ids: Array.from(new Set(eventIds)),
        evidence_ids: Array.from(new Set(evidenceIds))
      };
    });
  } else {
    entities = deriveEntities(sortedEvents);
  }

  // 2. Relationships: Map from backend graph edges if present, preserving rich canonical types
  let relationships = [];
  if (reconstruction.graph && Array.isArray(reconstruction.graph.edges) && reconstruction.graph.edges.length > 0) {
    relationships = reconstruction.graph.edges.map(edge => {
      const evIds = Array.isArray(edge.evidence_ids) ? edge.evidence_ids : (edge.evidence_id ? [edge.evidence_id] : []);
      return {
        id: edge.relationship_id || edge.id,
        source_id: edge.source,
        target_id: edge.target,
        type: edge.type, // AUTHENTICATED_TO, RESOLVED_IP, USES, EXECUTED, CONNECTED_TO, ACCESSED, EXFILTRATED_TO
        event_id: edge.event_id,
        evidence_id: evIds[0] || '',
        evidence_ids: evIds,
        timestamp: edge.timestamp
      };
    });
  } else {
    relationships = deriveRelationships(sortedEvents);
  }

  // 3. Evidence Traceability Map
  const evidenceMap = buildEvidenceMap(sortedEvents, entities);

  // 4. Timeline items and attack progression from backend
  const timeline = Array.isArray(reconstruction.timeline) ? reconstruction.timeline : [];
  const attackProgression = Array.isArray(reconstruction.attack_progression) ? reconstruction.attack_progression : [];
  const findings = Array.isArray(reconstruction.findings) ? reconstruction.findings : [];

  return {
    case_id: caseId,
    title: reconstruction.title || 'Cyber Incident Investigation',
    status: reconstruction.status || 'reconstructed',
    summary: reconstruction.summary || '',
    total_events: reconstruction.total_events || sortedEvents.length,
    events: sortedEvents,
    timeline,
    attack_progression: attackProgression,
    findings,
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
    },
    getTimelineItemByEvent(eventId) {
      return timeline.find(item => item.event_id === eventId) || null;
    }
  };
}

/**
 * Polymorphic Master Factory: Creates the unified CyberTwinDataModel.
 * Accepts EITHER:
 * 1. Full Backend Reconstruction Object ({ case_id, graph, timeline, events, ... })
 * 2. Array of raw BackendEvent objects ([ { event_id, ... }, ... ])
 *
 * @param {Object|Array} input - Reconstruction object or raw events array
 * @returns {Object} CyberTwinDataModel
 */
export function createCyberTwinDataModel(input) {
  if (!input) {
    throw new Error('createCyberTwinDataModel requires an input object or events array.');
  }

  // If input is already a reconstruction object
  if (typeof input === 'object' && !Array.isArray(input)) {
    if (input.graph || input.timeline || input.case_id) {
      return createModelFromReconstruction(input);
    }
  }

  // If input is an array of events
  if (Array.isArray(input)) {
    for (const evt of input) {
      if (!isValidBackendEvent(evt)) {
        throw new Error(`Invalid event format detected: ${JSON.stringify(evt)}`);
      }
    }

    const sortedEvents = sortEventsChronologically(input);
    const entities = deriveEntities(sortedEvents);
    const relationships = deriveRelationships(sortedEvents);
    const evidenceMap = buildEvidenceMap(sortedEvents, entities);
    const caseId = sortedEvents.length > 0 ? sortedEvents[0].case_id : 'UNKNOWN_CASE';

    return {
      case_id: caseId,
      title: 'Cyber Incident Investigation',
      status: 'active',
      summary: '',
      total_events: sortedEvents.length,
      events: sortedEvents,
      timeline: [],
      attack_progression: [],
      findings: [],
      entities,
      relationships,
      evidence_map: evidenceMap,

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
      },
      getTimelineItemByEvent(eventId) {
        return null;
      }
    };
  }

  throw new Error('createCyberTwinDataModel requires a reconstruction object or an array of events.');
}

export default {
  isValidBackendEvent,
  sortEventsChronologically,
  deriveEntities,
  deriveRelationships,
  buildEvidenceMap,
  createModelFromReconstruction,
  createCyberTwinDataModel
};
