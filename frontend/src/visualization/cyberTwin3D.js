/**
 * Cyber Twin 3D Infrastructure Layout & Transformation Helper
 *
 * Maps the CyberTwinDataModel (entities, relationships, and events) into a
 * spatial 3D cyber infrastructure topology adhering to CYBER_TWIN_REPLAY_SPEC.md:
 * - Zone 1 (External Ingress/Egress): Internet Gateway, Adversary Ingress IP, C2 Egress
 * - Zone 2 (Corporate Workstation Subnet): User Endpoints, Workstation devices, local payloads/files
 * - Zone 3 (Restricted Data Center): High-value databases, internal servers, vault assets
 *
 * Provides deterministic 3D layout coordinates, primitive geometry specs, and threat beam definitions.
 */

// Zone Identifiers
export const ZONE_EXTERNAL = 'zone_external';
export const ZONE_CORP_LAN = 'zone_corp_lan';
export const ZONE_RESTRICTED_DC = 'zone_restricted_dc';

/**
 * Returns static definitions for enterprise cyber infrastructure zones.
 * @returns {Array<Object>}
 */
export function getZoneDefinitions() {
  return [
    {
      id: ZONE_EXTERNAL,
      name: 'External Internet / Attacker Zone',
      subnet: 'WAN / Public Ingress & Egress',
      color: 0xef4444, // Red
      center: { x: -20, y: -0.2, z: -6 },
      size: { width: 14, depth: 22 }
    },
    {
      id: ZONE_CORP_LAN,
      name: 'Corporate LAN Subnet',
      subnet: '192.168.1.0/24',
      color: 0x0ea5e9, // Teal / Blue
      center: { x: 0, y: -0.2, z: 0 },
      size: { width: 16, depth: 22 }
    },
    {
      id: ZONE_RESTRICTED_DC,
      name: 'Restricted Data Center Subnet',
      subnet: '192.168.2.0/24',
      color: 0x8b5cf6, // Purple
      center: { x: 20, y: -0.2, z: 6 },
      size: { width: 14, depth: 22 }
    }
  ];
}

/**
 * Classifies an entity into an enterprise infrastructure zone.
 * Generic and deterministic; evaluates entity type and network naming/IP patterns.
 *
 * @param {Object} entity - VisualizationEntity
 * @returns {string} Zone ID
 */
export function classifyEntityZone(entity) {
  if (!entity) return ZONE_CORP_LAN;

  const type = entity.type || '';
  const name = (entity.name || '').toLowerCase();
  const id = (entity.id || '').toLowerCase();

  // 1. Servers and Data Center Assets -> Restricted Data Center
  if (type === 'server' || name.includes('server') || name.includes('srv-') || name.includes('db-') || name.includes('vault') || name.includes('dc-')) {
    return ZONE_RESTRICTED_DC;
  }

  // 2. IP Addresses: check subnets
  if (type === 'ip' || type === 'ip_address') {
    if (name.startsWith('192.168.2.') || name.startsWith('10.10.2.') || name.startsWith('172.16.2.')) {
      return ZONE_RESTRICTED_DC;
    }
    if (name.startsWith('192.168.1.') || name.startsWith('10.10.1.') || name.startsWith('10.0.')) {
      return ZONE_CORP_LAN;
    }
    // Public / external IPs (e.g. 198.51.100.*, 203.0.113.*, or other non-RFC1918)
    return ZONE_EXTERNAL;
  }

  // 3. User, Device, Workstation, and local files -> Corporate LAN
  if (type === 'device' || type === 'workstation' || type === 'user') {
    return ZONE_CORP_LAN;
  }

  if (type === 'file' || type === 'file_object') {
    // If file is associated with database/vault/server share, place in DC, else Corp LAN
    if (name.includes('srv-') || name.includes('vault') || name.includes('database')) {
      return ZONE_RESTRICTED_DC;
    }
    return ZONE_CORP_LAN;
  }

  return ZONE_CORP_LAN;
}

/**
 * Assigns 3D primitive geometry attributes based on entity type.
 *
 * @param {Object} entity
 * @returns {Object} { geometryType, dimensions, baseColor, emissiveColor }
 */
export function getEntity3DSpec(entity) {
  const type = entity.type || 'device';

  switch (type) {
    case 'server':
      return {
        geometryType: 'box',
        dimensions: [2.0, 3.4, 2.0], // Tall server rack
        baseColor: 0xdc2626, // Crimson Red
        emissiveColor: 0x7f1d1d,
        label: entity.name
      };
    case 'device':
    case 'workstation':
      return {
        geometryType: 'box',
        dimensions: [1.8, 1.4, 1.8], // Workstation / host box
        baseColor: 0x0d9488, // Teal
        emissiveColor: 0x0f766e,
        label: entity.name
      };
    case 'user':
      return {
        geometryType: 'cylinder',
        dimensions: [0.75, 0.75, 1.8, 16], // Operator capsule / cylinder
        baseColor: 0x2563eb, // Royal Blue
        emissiveColor: 0x1d4ed8,
        label: entity.name
      };
    case 'ip':
    case 'ip_address': {
      const isExternal = classifyEntityZone(entity) === ZONE_EXTERNAL;
      return {
        geometryType: 'octahedron',
        dimensions: [1.1, 0], // Network node diamond
        baseColor: isExternal ? 0xe11d48 : 0xd97706, // Rose Red for external, Amber for internal
        emissiveColor: isExternal ? 0x9f1239 : 0xb45309,
        label: entity.name
      };
    }
    case 'file':
    case 'file_object':
      return {
        geometryType: 'cylinder',
        dimensions: [0.8, 0.8, 1.2, 12], // Floating artifact barrel
        baseColor: 0x7c3aed, // Purple
        emissiveColor: 0x5b21b6,
        label: entity.name,
        elevation: 3.2 // Floats above workstation
      };
    default:
      return {
        geometryType: 'box',
        dimensions: [1.5, 1.5, 1.5],
        baseColor: 0x64748b,
        emissiveColor: 0x334155,
        label: entity.name
      };
  }
}

/**
 * Transforms a CyberTwinDataModel into 3D scene elements with deterministic coordinates.
 *
 * @param {Object} model - CyberTwinDataModel
 * @param {Object} [options] - Optional layout configuration
 * @returns {Object} { nodes: Array<Object>, links: Array<Object>, zones: Array<Object>, summary: Object }
 */
export function transformModelTo3DScene(model, options = {}) {
  const entities = (model && Array.isArray(model.entities)) ? model.entities : [];
  const relationships = (model && Array.isArray(model.relationships)) ? model.relationships : [];
  const events = (model && Array.isArray(model.events)) ? model.events : [];

  const zones = getZoneDefinitions();
  const zoneMap = new Map(zones.map(z => [z.id, z]));

  // Group entities by zone to distribute them evenly within zone boundaries
  const entitiesByZone = new Map([
    [ZONE_EXTERNAL, []],
    [ZONE_CORP_LAN, []],
    [ZONE_RESTRICTED_DC, []]
  ]);

  for (const ent of entities) {
    const zoneId = classifyEntityZone(ent);
    if (!entitiesByZone.has(zoneId)) {
      entitiesByZone.set(zoneId, []);
    }
    entitiesByZone.get(zoneId).push(ent);
  }

  const nodes3D = [];
  const nodePositionMap = new Map();

  // Position nodes within their respective zones
  for (const [zoneId, zoneEntities] of entitiesByZone.entries()) {
    const zone = zoneMap.get(zoneId) || zones[1];
    const count = zoneEntities.length;

    zoneEntities.forEach((ent, idx) => {
      const spec = getEntity3DSpec(ent);

      // Calculate layout coordinates within the zone bounds
      let x = zone.center.x;
      let y = spec.elevation || (spec.dimensions[1] ? spec.dimensions[1] / 2 : 1);
      let z = zone.center.z;

      if (count === 1) {
        // Center position
      } else if (count === 2) {
        z += (idx === 0 ? -4 : 4);
      } else if (count <= 4) {
        const row = Math.floor(idx / 2);
        const col = idx % 2;
        x += (col === 0 ? -3.5 : 3.5);
        z += (row === 0 ? -4.5 : 4.5);
      } else {
        // Multi-node distribution along an elliptical/grid pattern
        const angle = (idx / count) * Math.PI * 2;
        const radiusX = Math.min(5.5, zone.size.width * 0.35);
        const radiusZ = Math.min(7.5, zone.size.depth * 0.35);
        x += Math.cos(angle) * radiusX;
        z += Math.sin(angle) * radiusZ;
      }

      // If file entity, float directly above ground
      if (ent.type === 'file' || ent.type === 'file_object') {
        y = 3.6;
      }

      const node3D = {
        id: ent.id,
        name: ent.name,
        type: ent.type,
        zone: zoneId,
        position: { x, y, z },
        spec,
        eventIds: ent.event_ids || [],
        evidenceIds: ent.evidence_ids || []
      };

      nodes3D.push(node3D);
      nodePositionMap.set(ent.id, node3D.position);
    });
  }

  // Generate 3D links connecting nodes
  const links3D = [];
  for (const rel of relationships) {
    const startPos = nodePositionMap.get(rel.source_id);
    const endPos = nodePositionMap.get(rel.target_id);

    if (startPos && endPos) {
      links3D.push({
        id: rel.id,
        sourceId: rel.source_id,
        targetId: rel.target_id,
        type: rel.type,
        eventId: rel.event_id,
        evidenceId: rel.evidence_id,
        evidenceIds: rel.evidence_ids || (rel.evidence_id ? [rel.evidence_id] : []),
        timestamp: rel.timestamp,
        startPosition: startPos,
        endPosition: endPos
      });
    }
  }

  return {
    zones,
    nodes: nodes3D,
    links: links3D,
    summary: {
      totalNodes: nodes3D.length,
      totalLinks: links3D.length,
      totalZones: zones.length,
      entitiesInExternalZone: (entitiesByZone.get(ZONE_EXTERNAL) || []).length,
      entitiesInCorpZone: (entitiesByZone.get(ZONE_CORP_LAN) || []).length,
      entitiesInDcZone: (entitiesByZone.get(ZONE_RESTRICTED_DC) || []).length
    }
  };
}

export default {
  ZONE_EXTERNAL,
  ZONE_CORP_LAN,
  ZONE_RESTRICTED_DC,
  getZoneDefinitions,
  classifyEntityZone,
  getEntity3DSpec,
  transformModelTo3DScene
};
