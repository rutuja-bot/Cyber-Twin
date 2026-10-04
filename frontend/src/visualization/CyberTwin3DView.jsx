import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { transformModelTo3DScene } from './cyberTwin3D';

/**
 * CyberTwin3DView Component for Cyber Twin
 * 
 * Lightweight 3D spatial reconstruction of enterprise cyber infrastructure using Three.js:
 * - Enterprise network zones (External Ingress/Egress, Corporate LAN, Restricted Data Center)
 * - 3D primitive representations (Servers -> Towers, Workstations -> Boxes, Users -> Cylinders, IPs -> Octahedrons, Files -> Floaters)
 * - Interactive camera orbit (drag to rotate, scroll to zoom, reset button)
 * - Attack Path Isolation (dims benign background infrastructure, elevates adversary vectors)
 * - Replay Engine Synchronization (smoothly highlights active event hosts and vectors)
 * - Animated threat beams showing lateral movement, C2 transmission, and data exfiltration
 * - Complete memory cleanup on unmount
 * 
 * Props:
 * - model: CyberTwinDataModel (required)
 * - selectedEventId: string | null (optional controlled focus)
 * - attackPathOnly: boolean (optional attack path isolation mode)
 * - attackPathNodeIds: Array<string> | null (optional)
 * - attackPathEdgeIds: Array<string> | null (optional)
 * - onNodeSelect: (nodeData: Object) => void (optional callback)
 * - height: string | number (default: '100%')
 * - width: string | number (default: '100%')
 */
export function CyberTwin3DView({
  model,
  selectedEventId = null,
  attackPathOnly = false,
  attackPathNodeIds = null,
  attackPathEdgeIds = null,
  onNodeSelect,
  height = '100%',
  width = '100%'
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const nodeMeshesRef = useRef(new Map());
  const linkLinesRef = useRef([]);
  const threatPulseRef = useRef([]);

  // Selected node hover/click tooltip
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isWebGlAvailable, setIsWebGlAvailable] = useState(true);

  // Derive 3D scene elements deterministically from model
  const sceneData = useMemo(() => {
    return transformModelTo3DScene(model);
  }, [model]);

  // Camera Orbit State
  const orbitStateRef = useRef({
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    theta: Math.PI / 2, // Azimuth angle
    phi: Math.PI / 4,    // Elevation angle
    radius: 46           // Camera distance from center
  });

  const updateCameraPosition = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const { theta, phi, radius } = orbitStateRef.current;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 1.5, 0);
  }, []);

  const handleResetCamera = useCallback(() => {
    orbitStateRef.current.theta = Math.PI / 2;
    orbitStateRef.current.phi = Math.PI / 4.2;
    orbitStateRef.current.radius = 48;
    updateCameraPosition();
  }, [updateCameraPosition]);

  // Initialize Three.js Scene and Renderer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const renderWidth = rect.width > 0 ? rect.width : 500;
    const renderHeight = rect.height > 0 ? rect.height : 450;

    // Detect WebGL capability
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    } catch (e) {
      console.warn('WebGL unavailable in current environment; falling back to canvas safe view.', e);
      setIsWebGlAvailable(false);
      return;
    }

    renderer.setSize(renderWidth, renderHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x090d16, 1);
    renderer.shadowMap.enabled = false; // Keep lightweight
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, renderWidth / renderHeight, 0.5, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // Lighting (ambient + directional key + central cyber pointlight)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight.position.set(20, 35, 25);
    scene.add(dirLight);

    const cyberPointLight = new THREE.PointLight(0x38bdf8, 0.7, 80);
    cyberPointLight.position.set(0, 12, 0);
    scene.add(cyberPointLight);

    // Floor Grid Helper
    const gridHelper = new THREE.GridHelper(64, 32, 0x334155, 0x1e293b);
    gridHelper.position.y = -0.3;
    scene.add(gridHelper);

    // 1. Build Zone Ground Planes
    for (const zone of sceneData.zones) {
      const planeGeo = new THREE.PlaneGeometry(zone.size.width, zone.size.depth);
      const planeMat = new THREE.MeshBasicMaterial({
        color: zone.color,
        transparent: true,
        opacity: 0.12,
        side: THREE.DoubleSide
      });
      const planeMesh = new THREE.Mesh(planeGeo, planeMat);
      planeMesh.rotation.x = Math.PI / 2;
      planeMesh.position.set(zone.center.x, zone.center.y, zone.center.z);
      scene.add(planeMesh);

      // Zone Boundary Wireframe Outline
      const edges = new THREE.EdgesGeometry(planeGeo);
      const lineMat = new THREE.LineBasicMaterial({ color: zone.color, transparent: true, opacity: 0.45 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.rotation.x = Math.PI / 2;
      wireframe.position.copy(planeMesh.position);
      scene.add(wireframe);
    }

    // 2. Build Infrastructure Node Meshes
    const nodeMeshMap = new Map();
    for (const node of sceneData.nodes) {
      let geo;
      const d = node.spec.dimensions;

      if (node.spec.geometryType === 'box') {
        geo = new THREE.BoxGeometry(d[0], d[1], d[2]);
      } else if (node.spec.geometryType === 'cylinder') {
        geo = new THREE.CylinderGeometry(d[0], d[1], d[2], d[3] || 16);
      } else if (node.spec.geometryType === 'octahedron') {
        geo = new THREE.OctahedronGeometry(d[0], d[1] || 0);
      } else {
        geo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: node.spec.baseColor,
        roughness: 0.35,
        metalness: 0.15,
        emissive: node.spec.emissiveColor,
        emissiveIntensity: 0.25,
        transparent: true,
        opacity: 1.0
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(node.position.x, node.position.y, node.position.z);
      mesh.userData = { nodeId: node.id, nodeData: node };

      scene.add(mesh);
      nodeMeshMap.set(node.id, { mesh, material: mat, baseColor: node.spec.baseColor, spec: node.spec, node });
    }
    nodeMeshesRef.current = nodeMeshMap;

    // 3. Build Infrastructure Links & Threat Beams
    const linkLines = [];
    const threatPulses = [];

    for (const link of sceneData.links) {
      const start = new THREE.Vector3(link.startPosition.x, link.startPosition.y, link.startPosition.z);
      const end = new THREE.Vector3(link.endPosition.x, link.endPosition.y, link.endPosition.z);

      // Arc curve so lines arch gracefully across 3D zones
      const mid = new THREE.Vector3(
        (start.x + end.x) / 2,
        Math.max(start.y, end.y) + 2.5 + Math.min(6, start.distanceTo(end) * 0.15),
        (start.z + end.z) / 2
      );
      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      const points = curve.getPoints(24);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);

      const lineMat = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.45
      });

      const lineMesh = new THREE.Line(lineGeo, lineMat);
      lineMesh.userData = { linkId: link.id, eventId: link.eventId, sourceId: link.sourceId, targetId: link.targetId };
      scene.add(lineMesh);

      linkLines.push({ lineMesh, lineMat, linkData: link, curve });

      // Threat beam animated transmission particle
      const pulseGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.position.copy(start);
      scene.add(pulseMesh);

      threatPulses.push({
        pulseMesh,
        pulseMat,
        curve,
        linkData: link,
        progress: Math.random() // Stagger animation start
      });
    }

    linkLinesRef.current = linkLines;
    threatPulseRef.current = threatPulses;

    // 4. Mouse Drag & Wheel Interaction Event Handlers
    const onPointerDown = (e) => {
      orbitStateRef.current.isDragging = true;
      orbitStateRef.current.prevMouseX = e.clientX;
      orbitStateRef.current.prevMouseY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!orbitStateRef.current.isDragging) {
        // Optional Raycasting for node hover
        const rect = container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);
        const meshes = Array.from(nodeMeshMap.values()).map(item => item.mesh);
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
          const hitNode = intersects[0].object.userData.nodeData;
          setHoveredNode(hitNode || null);
          container.style.cursor = 'pointer';
        } else {
          setHoveredNode(null);
          container.style.cursor = 'grab';
        }
        return;
      }

      const deltaX = e.clientX - orbitStateRef.current.prevMouseX;
      const deltaY = e.clientY - orbitStateRef.current.prevMouseY;
      orbitStateRef.current.prevMouseX = e.clientX;
      orbitStateRef.current.prevMouseY = e.clientY;

      orbitStateRef.current.theta -= deltaX * 0.007;
      orbitStateRef.current.phi = Math.max(0.12, Math.min(Math.PI / 2.05, orbitStateRef.current.phi - deltaY * 0.007));
      updateCameraPosition();
    };

    const onPointerUp = () => {
      orbitStateRef.current.isDragging = false;
      container.style.cursor = 'grab';
    };

    const onWheel = (e) => {
      e.preventDefault();
      orbitStateRef.current.radius = Math.max(16, Math.min(75, orbitStateRef.current.radius + e.deltaY * 0.035));
      updateCameraPosition();
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElement.addEventListener('wheel', onWheel, { passive: false });

    // Handle Container Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && rendererRef.current && cameraRef.current) {
          cameraRef.current.aspect = w / h;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    // 5. Animation Render Loop
    let lastTime = performance.now();
    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Animate threat beam pulses along active attack connections
      for (const item of threatPulseRef.current) {
        if (item.pulseMat.opacity > 0) {
          item.progress = (item.progress + delta * 0.45) % 1.0;
          const point = item.curve.getPoint(item.progress);
          item.pulseMesh.position.copy(point);
        }
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animFrameIdRef.current = requestAnimationFrame(animate);

    // Cleanup resources on unmount
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      resizeObserver.disconnect();
      domElement.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElement.removeEventListener('wheel', onWheel);

      // Dispose Geometries and Materials
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
      nodeMeshesRef.current.clear();
      linkLinesRef.current = [];
      threatPulseRef.current = [];
    };
  }, [sceneData, updateCameraPosition]);

  // Synchronize dynamic visual state (selectedEventId & attackPathOnly) without recreating scene
  useEffect(() => {
    const nodeMeshes = nodeMeshesRef.current;
    const linkLines = linkLinesRef.current;
    const threatPulses = threatPulseRef.current;
    if (nodeMeshes.size === 0) return;

    const attackNodesSet = new Set(attackPathNodeIds || []);
    const attackEdgesSet = new Set(attackPathEdgeIds || []);

    // 1. Update Infrastructure Nodes
    for (const [nodeId, item] of nodeMeshes.entries()) {
      const isSelectedEventHost = selectedEventId && item.node.eventIds.includes(selectedEventId);
      const isAttackNode = attackNodesSet.has(nodeId);

      if (attackPathOnly) {
        if (isAttackNode) {
          item.material.opacity = 1.0;
          item.material.emissiveIntensity = isSelectedEventHost ? 0.95 : 0.45;
          item.material.emissive.setHex(isSelectedEventHost ? 0xf59e0b : 0xdc2626);
          item.mesh.scale.set(isSelectedEventHost ? 1.3 : 1.05, isSelectedEventHost ? 1.3 : 1.05, isSelectedEventHost ? 1.3 : 1.05);
        } else {
          // Dim non-attack infrastructure
          item.material.opacity = 0.15;
          item.material.emissiveIntensity = 0.05;
          item.mesh.scale.set(0.9, 0.9, 0.9);
        }
      } else {
        // Normal Infrastructure View
        if (isSelectedEventHost) {
          item.material.opacity = 1.0;
          item.material.emissiveIntensity = 0.9;
          item.material.emissive.setHex(0xf59e0b); // Gold highlight ring
          item.mesh.scale.set(1.3, 1.3, 1.3);
        } else {
          item.material.opacity = 1.0;
          item.material.emissiveIntensity = 0.25;
          item.material.emissive.setHex(item.spec.emissiveColor);
          item.mesh.scale.set(1.0, 1.0, 1.0);
        }
      }
    }

    // 2. Update Infrastructure Links & Animated Threat Beams
    for (const item of linkLines) {
      const isAttackEdge = attackEdgesSet.has(item.linkData.id);
      const isSelectedLink = selectedEventId && item.linkData.eventId === selectedEventId;

      if (attackPathOnly) {
        if (isAttackEdge) {
          item.lineMat.color.setHex(isSelectedLink ? 0xf59e0b : 0xef4444);
          item.lineMat.opacity = isSelectedLink ? 1.0 : 0.85;
        } else {
          item.lineMat.opacity = 0.05;
        }
      } else {
        if (isSelectedLink) {
          item.lineMat.color.setHex(0xef4444);
          item.lineMat.opacity = 0.95;
        } else {
          item.lineMat.color.setHex(0x475569);
          item.lineMat.opacity = 0.4;
        }
      }
    }

    // 3. Update Threat Beam Particles
    for (const item of threatPulses) {
      const isAttackEdge = attackEdgesSet.has(item.linkData.id);
      const isSelectedLink = selectedEventId && item.linkData.eventId === selectedEventId;

      if (attackPathOnly && isAttackEdge) {
        item.pulseMat.opacity = 0.95;
        item.pulseMat.color.setHex(isSelectedLink ? 0xf59e0b : 0xef4444);
      } else if (isSelectedLink) {
        item.pulseMat.opacity = 0.95;
        item.pulseMat.color.setHex(0xef4444);
      } else {
        item.pulseMat.opacity = 0;
      }
    }
  }, [selectedEventId, attackPathOnly, attackPathNodeIds, attackPathEdgeIds]);

  return (
    <div
      role="region"
      aria-label="3D Cyber Twin infrastructure visualization"
      style={{
        position: 'relative',
        width,
        height,
        backgroundColor: '#090d16',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* 3D Viewport Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        color: '#f8fafc',
        fontSize: '12px',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px' }}>🌐</span>
          <strong style={{ letterSpacing: '-0.01em', color: '#38bdf8' }}>3D Cyber Twin</strong>
          <span style={{
            fontSize: '10px',
            padding: '2px 6px',
            backgroundColor: '#1e293b',
            color: '#94a3b8',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            Zones: {sceneData.zones.length} | Nodes: {sceneData.nodes.length} | Links: {sceneData.links.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {attackPathOnly ? (
            <span style={{
              fontSize: '10px',
              padding: '2px 8px',
              backgroundColor: '#450a0a',
              border: '1px solid #dc2626',
              color: '#fca5a5',
              borderRadius: '4px',
              fontWeight: 700
            }}>
              ⚡ Threat Beams Active
            </span>
          ) : (
            <span style={{
              fontSize: '10px',
              padding: '2px 6px',
              backgroundColor: '#1e293b',
              color: '#64748b',
              borderRadius: '4px'
            }}>
              Infrastructure View
            </span>
          )}

          <button
            onClick={handleResetCamera}
            aria-label="Reset 3D camera view"
            title="Reset 3D camera to default isometric overview"
            style={{
              padding: '3px 8px',
              backgroundColor: '#1e293b',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Reset View ⟲
          </button>
        </div>
      </div>

      {/* Three.js Canvas Mount Container */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          position: 'relative',
          cursor: 'grab'
        }}
      >
        {!isWebGlAvailable && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0b0f19',
            color: '#94a3b8',
            padding: '20px',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>🌐</span>
            <strong style={{ color: '#f8fafc' }}>3D Cyber Twin Spatial Topology</strong>
            <p style={{ fontSize: '12px', maxWidth: '340px', marginTop: '6px' }}>
              External Ingress &bull; Corporate LAN (192.168.1.0/24) &bull; Restricted Data Center (192.168.2.0/24)
            </p>
          </div>
        )}

        {/* Hover / Tooltip HUD */}
        {hoveredNode && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            padding: '6px 10px',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid #334155',
            borderRadius: '6px',
            color: '#f8fafc',
            fontSize: '11px',
            pointerEvents: 'none',
            zIndex: 20,
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}>
            <div><strong>{hoveredNode.name}</strong> ({hoveredNode.type.toUpperCase()})</div>
            <div style={{ color: '#94a3b8', fontSize: '10px', marginTop: '2px' }}>
              Zone: {hoveredNode.zone.replace('zone_', '').toUpperCase()} | Events: {hoveredNode.eventIds.length}
            </div>
          </div>
        )}

        {/* Navigation Legend HUD */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '10px',
          fontSize: '10px',
          color: '#64748b',
          pointerEvents: 'none',
          zIndex: 10,
          display: 'flex',
          gap: '10px'
        }}>
          <span>🖱️ Drag: Rotate</span>
          <span>📜 Scroll: Zoom</span>
        </div>
      </div>
    </div>
  );
}

export default CyberTwin3DView;

