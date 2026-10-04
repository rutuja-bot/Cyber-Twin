/**
 * Cytoscape Element Builder and Stylesheet for Cyber Twin Relationship Graph
 * 
 * Transforms the generic CyberTwinDataModel into Cytoscape.js nodes and edges,
 * ensuring strict visual differentiation, entity type semantics, and evidence traceability.
 */

/**
 * Builds Cytoscape.js elements (nodes and edges) from a CyberTwinDataModel.
 * @param {Object} model - CyberTwinDataModel instance
 * @returns {Array<Object>} Cytoscape element definition objects
 */
function buildCytoscapeElements(model) {
  if (!model || !Array.isArray(model.entities) || !Array.isArray(model.relationships)) {
    throw new Error('buildCytoscapeElements requires a valid CyberTwinDataModel with entities and relationships arrays.');
  }

  const elements = [];

  // 1. Build Nodes from model.entities
  for (const entity of model.entities) {
    elements.push({
      group: 'nodes',
      data: {
        id: entity.id,
        label: entity.name,
        entityType: entity.type, // 'user' | 'device' | 'ip' | 'file' | 'server'
        firstSeen: entity.first_seen,
        lastSeen: entity.last_seen,
        eventIds: entity.event_ids || [],
        evidenceIds: entity.evidence_ids || []
      },
      classes: `entity-node entity-${entity.type}`
    });
  }

  // 2. Build Edges from model.relationships
  for (const rel of model.relationships) {
    elements.push({
      group: 'edges',
      data: {
        id: rel.id,
        source: rel.source_id,
        target: rel.target_id,
        label: rel.type,
        relationshipType: rel.type, // 'USES' | 'CONNECTED_TO' | 'ACCESSED'
        eventId: rel.event_id,
        evidenceId: rel.evidence_id,
        timestamp: rel.timestamp
      },
      classes: `relationship-edge rel-${rel.type.toLowerCase()}`
    });
  }

  return elements;
}

/**
 * Default Cytoscape stylesheet providing clear visual differentiation
 * across entity types and relationship categories for cyber incident analysis.
 * @returns {Array<Object>} Cytoscape stylesheet rules
 */
function getCytoscapeStylesheet() {
  return [
    // Base Node Style
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'color': '#0f172a',
        'font-family': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        'font-size': '11px',
        'font-weight': '600',
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 6,
        'text-outline-color': '#ffffff',
        'text-outline-width': 2,
        'width': 44,
        'height': 44,
        'border-width': 2,
        'border-color': '#334155',
        'transition-property': 'background-color, border-color, border-width, width, height',
        'transition-duration': '0.2s'
      }
    },

    // Entity: USER (Royal Blue Ellipse)
    {
      selector: 'node.entity-user',
      style: {
        'shape': 'ellipse',
        'background-color': '#2563EB',
        'border-color': '#1D4ED8',
        'border-width': 2.5
      }
    },

    // Entity: DEVICE / WORKSTATION (Teal Rounded Rectangle)
    {
      selector: 'node.entity-device',
      style: {
        'shape': 'round-rectangle',
        'background-color': '#0D9488',
        'border-color': '#0F766E',
        'border-width': 2.5,
        'corner-radius': 8
      }
    },

    // Entity: IP ADDRESS (Amber Diamond)
    {
      selector: 'node.entity-ip',
      style: {
        'shape': 'diamond',
        'background-color': '#D97706',
        'border-color': '#B45309',
        'border-width': 2.5,
        'width': 48,
        'height': 48
      }
    },

    // Entity: FILE (Purple Barrel / Document)
    {
      selector: 'node.entity-file',
      style: {
        'shape': 'barrel',
        'background-color': '#7C3AED',
        'border-color': '#6D28D9',
        'border-width': 2.5
      }
    },

    // Entity: SERVER (Red Octagon / Critical Asset)
    {
      selector: 'node.entity-server',
      style: {
        'shape': 'octagon',
        'background-color': '#DC2626',
        'border-color': '#B91C1C',
        'border-width': 3,
        'width': 50,
        'height': 50
      }
    },

    // Selected Node State
    {
      selector: 'node:selected',
      style: {
        'border-color': '#F59E0B',
        'border-width': 4,
        'shadow-blur': 16,
        'shadow-color': '#F59E0B',
        'shadow-opacity': 0.8
      }
    },

    // Base Edge Style (Directed Bezier)
    {
      selector: 'edge',
      style: {
        'curve-style': 'bezier',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 1.2,
        'width': 2,
        'line-color': '#94A3B8',
        'target-arrow-color': '#94A3B8',
        'label': 'data(label)',
        'font-family': 'system-ui, -apple-system, sans-serif',
        'font-size': '9px',
        'font-weight': '600',
        'color': '#475569',
        'text-rotation': 'autorotate',
        'text-background-opacity': 0.9,
        'text-background-color': '#ffffff',
        'text-background-padding': 2,
        'text-background-shape': 'roundrectangle',
        'transition-property': 'line-color, target-arrow-color, width',
        'transition-duration': '0.2s'
      }
    },

    // Relationship: USES (Blue solid)
    {
      selector: 'edge.rel-uses',
      style: {
        'line-color': '#2563EB',
        'target-arrow-color': '#2563EB',
        'width': 2.2
      }
    },

    // Relationship: CONNECTED_TO (Amber/Orange solid)
    {
      selector: 'edge.rel-connected_to',
      style: {
        'line-color': '#D97706',
        'target-arrow-color': '#D97706',
        'width': 2.5
      }
    },

    // Relationship: ACCESSED (Purple dashed)
    {
      selector: 'edge.rel-accessed',
      style: {
        'line-color': '#7C3AED',
        'target-arrow-color': '#7C3AED',
        'line-style': 'dashed',
        'line-dash-pattern': [6, 3],
        'width': 2
      }
    },

    // Selected Edge State
    {
      selector: 'edge:selected',
      style: {
        'line-color': '#EF4444',
        'target-arrow-color': '#EF4444',
        'width': 3.5,
        'color': '#EF4444',
        'font-weight': '700'
      }
    }
  ];
}

module.exports = {
  buildCytoscapeElements,
  getCytoscapeStylesheet
};

