import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Box, Layers, MapPin, Eye, RotateCcw } from 'lucide-react';
import { get3DSceneData } from '../../api/evidence';

interface Marker3D {
  marker_id: string;
  evidence_id: string;
  label: string;
  zone: string;
  color: string;
  position: [number, number, number];
  source?: string;
  type?: string;
  hash?: string;
}

interface Investigation3DSceneProps {
  caseId?: string;
  selectedEvidenceId?: string | null;
  onSelectEvidence?: (evidenceId: string) => void;
  height?: string | number;
  width?: string | number;
}

export const Investigation3DScene: React.FC<Investigation3DSceneProps> = ({
  caseId = 'CASE-001',
  selectedEvidenceId = null,
  onSelectEvidence,
  height = '520px',
  width = '100%'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const markersGroupRef = useRef<any>(null);
  const glbModelGroupRef = useRef<any>(null);

  const [markers, setMarkers] = useState<Marker3D[]>([]);
  const [hoveredMarker, setHoveredMarker] = useState<Marker3D | null>(null);
  const [activeMarker, setActiveMarker] = useState<Marker3D | null>(null);
  const [isGlbLoaded, setIsGlbLoaded] = useState<boolean>(false);
  const [sceneStats, setSceneStats] = useState<{ zonesCount: number; markersCount: number }>({
    zonesCount: 3,
    markersCount: 9
  });

  // Orbit state
  const orbitStateRef = useRef({
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    theta: Math.PI / 3,
    phi: Math.PI / 4,
    radius: 22
  });

  const updateCamera = useCallback(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const { theta, phi, radius } = orbitStateRef.current;
    camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, 1.2, 0);
  }, []);

  const handleResetCamera = useCallback(() => {
    orbitStateRef.current.theta = Math.PI / 3;
    orbitStateRef.current.phi = Math.PI / 4.2;
    orbitStateRef.current.radius = 22;
    updateCamera();
  }, [updateCamera]);

  // Fetch markers and zones from backend
  useEffect(() => {
    let mounted = true;
    get3DSceneData(caseId)
      .then((data: any) => {
        if (!mounted) return;
        if (data && data.markers) {
          setMarkers(data.markers);
          setSceneStats({
            zonesCount: data.zones?.length || 3,
            markersCount: data.markers.length
          });
        }
      })
      .catch((err: any) => {
        console.warn('Fallback to local markers:', err);
        // Fallback default markers
        const defaultMarkers: Marker3D[] = [
          { marker_id: 'MKR-EVD-001', evidence_id: 'EVD-001', label: 'Auth Log (Ingress)', zone: 'Perimeter Gateway', color: '#00f0ff', position: [-6, 1.2, -4] },
          { marker_id: 'MKR-EVD-002', evidence_id: 'EVD-002', label: 'Sysmon Process Spawn', zone: 'Cubicle 14 Desk', color: '#ff0055', position: [-5, 1.4, 0] },
          { marker_id: 'MKR-EVD-003', evidence_id: 'EVD-003', label: 'PCAP Internal SMB', zone: 'Distribution Switch', color: '#ffb700', position: [0, 1.2, 1] },
          { marker_id: 'MKR-EVD-004', evidence_id: 'EVD-004', label: 'Disk Audit Log', zone: 'Server Rack A-01', color: '#a855f7', position: [5.5, 1.4, -1] },
          { marker_id: 'MKR-EVD-005', evidence_id: 'EVD-005', label: 'Memory Dump Artifact', zone: 'Workstation Terminal', color: '#00ff88', position: [-4.5, 1.2, 1.5] },
          { marker_id: 'MKR-EVD-006', evidence_id: 'EVD-006', label: 'Scene Photo (Workstation)', zone: 'Cubicle 14 Desk', color: '#00e5ff', position: [-5.2, 1.8, -0.5] },
          { marker_id: 'MKR-EVD-007', evidence_id: 'EVD-007', label: 'CCTV Camera CAM-SR-04', zone: 'Server Room Entrance', color: '#10b981', position: [4.0, 2.5, 3.0] },
          { marker_id: 'MKR-EVD-008', evidence_id: 'EVD-008', label: 'Tampered USB Flash Drive', zone: 'Workstation Rear Port', color: '#f59e0b', position: [-4.8, 0.9, 0.4] },
          { marker_id: 'MKR-EVD-009', evidence_id: 'EVD-009', label: 'Forensic Intake Report', zone: 'Investigator Terminal', color: '#8b5cf6', position: [0, 1.0, -3.5] },
        ];
        setMarkers(defaultMarkers);
      });

    return () => {
      mounted = false;
    };
  }, [caseId]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080e22);
    scene.fog = new THREE.FogExp2(0x080e22, 0.025);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCamera();

    let renderer: any;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch (e) {
      console.error('WebGL init error:', e);
      return;
    }

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00b7ff, 1.2);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    const purpleLight = new THREE.PointLight(0x8b5cf6, 2.0, 30);
    purpleLight.position.set(6, 6, 2);
    scene.add(purpleLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x00b7ff, 0x1e2d4a);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Group for GLB model
    const glbGroup = new THREE.Group();
    scene.add(glbGroup);
    glbModelGroupRef.current = glbGroup;

    // Procedural Fallback Environment
    const buildProceduralScene = () => {
      // Room 1: Cubicle 14 Floor (Teal)
      const cubicleGeo = new THREE.PlaneGeometry(8, 8);
      const cubicleMat = new THREE.MeshBasicMaterial({ color: 0x0e2a47, side: THREE.DoubleSide });
      const cubicleMesh = new THREE.Mesh(cubicleGeo, cubicleMat);
      cubicleMesh.rotation.x = -Math.PI / 2;
      cubicleMesh.position.set(-5, 0, 0);
      glbGroup.add(cubicleMesh);

      // Desk Box
      const deskGeo = new THREE.BoxGeometry(3, 1, 1.8);
      const deskMat = new THREE.MeshLambertMaterial({ color: 0x152238 });
      const desk = new THREE.Mesh(deskGeo, deskMat);
      desk.position.set(-5, 0.5, 0);
      glbGroup.add(desk);

      // Workstation Monitor
      const monGeo = new THREE.BoxGeometry(1.2, 0.8, 0.1);
      const monMat = new THREE.MeshBasicMaterial({ color: 0x00b7ff });
      const monitor = new THREE.Mesh(monGeo, monMat);
      monitor.position.set(-5, 1.4, 0);
      glbGroup.add(monitor);

      // Room 2: Server Room Floor (Purple)
      const serverRoomGeo = new THREE.PlaneGeometry(8, 8);
      const serverRoomMat = new THREE.MeshBasicMaterial({ color: 0x1c1038, side: THREE.DoubleSide });
      const serverRoomMesh = new THREE.Mesh(serverRoomGeo, serverRoomMat);
      serverRoomMesh.rotation.x = -Math.PI / 2;
      serverRoomMesh.position.set(6, 0, 0);
      glbGroup.add(serverRoomMesh);

      // Server Racks
      for (let i = 0; i < 3; i++) {
        const rackGeo = new THREE.BoxGeometry(1.2, 3.2, 1.2);
        const rackMat = new THREE.MeshLambertMaterial({ color: 0x2d1b4e });
        const rack = new THREE.Mesh(rackGeo, rackMat);
        rack.position.set(5.0 + i * 1.5, 1.6, -1.0 + (i % 2) * 2.0);
        glbGroup.add(rack);
      }

      // Room 3: Network Distribution Corridor
      const corridorGeo = new THREE.PlaneGeometry(4, 12);
      const corridorMat = new THREE.MeshBasicMaterial({ color: 0x0a1626, side: THREE.DoubleSide });
      const corridor = new THREE.Mesh(corridorGeo, corridorMat);
      corridor.rotation.x = -Math.PI / 2;
      corridor.position.set(0.5, 0, 0);
      glbGroup.add(corridor);
    };

    // Load binary GLB model
    const loader = new GLTFLoader();
    loader.load(
      '/models/investigation_scene.glb',
      (gltf: any) => {
        glbGroup.add(gltf.scene);
        setIsGlbLoaded(true);
      },
      undefined,
      (err: any) => {
        console.warn('GLB load error; falling back to procedural Three.js scene:', err);
        buildProceduralScene();
      }
    );

    // Group for Markers
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate floating markers
      if (markersGroupRef.current) {
        markersGroupRef.current.children.forEach((child: any, idx: number) => {
          child.position.y += Math.sin(elapsedTime * 2.5 + idx) * 0.002;
          child.rotation.y += 0.015;
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (rendererRef.current && rendererRef.current.domElement) {
        container.removeChild(rendererRef.current.domElement);
      }
    };
  }, [updateCamera]);

  // Rebuild 3D markers when markers list updates
  useEffect(() => {
    const group = markersGroupRef.current;
    if (!group) return;

    // Clear previous marker meshes
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    markers.forEach((m) => {
      const isSelected = selectedEvidenceId === m.evidence_id;
      const colorNum = parseInt(m.color.replace('#', '0x'), 16) || 0x00b7ff;

      const markerNode = new THREE.Group();
      markerNode.position.set(m.position[0], m.position[1], m.position[2]);
      markerNode.userData = { markerData: m };

      // Core Diamond / Octahedron
      const geo = new THREE.OctahedronGeometry(isSelected ? 0.45 : 0.35);
      const mat = new THREE.MeshStandardMaterial({
        color: colorNum,
        emissive: colorNum,
        emissiveIntensity: isSelected ? 0.9 : 0.5,
        roughness: 0.2,
        metalness: 0.8
      });
      const mesh = new THREE.Mesh(geo, mat);
      markerNode.add(mesh);

      // Glowing Base Ring
      const ringGeo = new THREE.RingGeometry(0.4, 0.55, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorNum,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -0.3;
      markerNode.add(ring);

      group.add(markerNode);
    });
  }, [markers, selectedEvidenceId]);

  // Raycasting / Mouse click handler
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    orbitStateRef.current.isDragging = true;
    orbitStateRef.current.prevMouseX = e.clientX;
    orbitStateRef.current.prevMouseY = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (orbitStateRef.current.isDragging) {
      const deltaX = e.clientX - orbitStateRef.current.prevMouseX;
      const deltaY = e.clientY - orbitStateRef.current.prevMouseY;
      orbitStateRef.current.prevMouseX = e.clientX;
      orbitStateRef.current.prevMouseY = e.clientY;

      orbitStateRef.current.theta -= deltaX * 0.008;
      orbitStateRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, orbitStateRef.current.phi - deltaY * 0.008));
      updateCamera();
      return;
    }

    // Raycast hover detection
    if (!containerRef.current || !cameraRef.current || !markersGroupRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), cameraRef.current);
    const intersects = raycaster.intersectObjects(markersGroupRef.current.children, true);

    if (intersects.length > 0) {
      let topObj: any = intersects[0].object;
      while (topObj && !topObj.userData?.markerData && topObj.parent) {
        topObj = topObj.parent;
      }
      if (topObj && topObj.userData?.markerData) {
        setHoveredMarker(topObj.userData.markerData);
        return;
      }
    }
    setHoveredMarker(null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const wasDragging =
      Math.abs(e.clientX - orbitStateRef.current.prevMouseX) > 4 ||
      Math.abs(e.clientY - orbitStateRef.current.prevMouseY) > 4;
    orbitStateRef.current.isDragging = false;

    if (!wasDragging && hoveredMarker) {
      setActiveMarker(hoveredMarker);
      if (onSelectEvidence) {
        onSelectEvidence(hoveredMarker.evidence_id);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    orbitStateRef.current.radius = Math.max(6, Math.min(45, orbitStateRef.current.radius + e.deltaY * 0.02));
    updateCamera();
  };

  return (
    <div
      style={{
        position: 'relative',
        height,
        width,
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#080E22',
        border: '1px solid #24315C'
      }}
    >
      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        style={{
          width: '100%',
          height: '100%',
          cursor: orbitStateRef.current.isDragging ? 'grabbing' : 'grab'
        }}
      />

      {/* Top Overlay Bar */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'auto' }}>
          <Badge variant="verified">
            <Box size={13} style={{ marginRight: '4px' }} />
            3D Crime Scene Model ({isGlbLoaded ? 'Binary GLTF 2.0 Loaded' : 'Interactive Mesh Scene'})
          </Badge>
          <Badge variant="info">
            <MapPin size={13} style={{ marginRight: '4px' }} />
            {sceneStats.markersCount} Spatial Evidence Markers
          </Badge>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', pointerEvents: 'auto' }}>
          <Button size="sm" variant="outline" onClick={handleResetCamera}>
            <RotateCcw size={13} style={{ marginRight: '4px' }} /> Reset Camera
          </Button>
        </div>
      </div>

      {/* Hover Tooltip Overlay */}
      {hoveredMarker && (
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(16, 25, 54, 0.95)',
            border: '1px solid #00B7FF',
            borderRadius: '8px',
            padding: '0.85rem 1.15rem',
            boxShadow: '0 8px 30px rgba(0, 183, 255, 0.25)',
            pointerEvents: 'auto',
            maxWidth: '320px',
            animation: 'fadeIn 0.15s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#00B7FF', fontWeight: 700, fontSize: '0.85rem' }}>
              {hoveredMarker.marker_id}
            </span>
            <Badge variant="default" size="sm">{hoveredMarker.evidence_id}</Badge>
          </div>
          <div style={{ fontWeight: 700, color: '#F5F7FF', fontSize: '0.9rem' }}>
            {hoveredMarker.label}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#93C5FD', marginTop: '0.2rem' }}>
            Zone: {hoveredMarker.zone}
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '0.72rem', color: '#4DEBFF', fontWeight: 600 }}>
              Click marker to inspect evidence artifact →
            </span>
          </div>
        </div>
      )}

      {/* Bottom Zone Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(8, 14, 34, 0.85)',
          border: '1px solid #24315C',
          borderRadius: '6px',
          padding: '0.4rem 0.75rem',
          display: 'flex',
          gap: '0.85rem',
          fontSize: '0.72rem',
          pointerEvents: 'none'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00B7FF' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00B7FF' }} />
          Cubicle 14
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#8B5CF6' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8B5CF6' }} />
          Server Room B-12
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10B981' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
          Corridor Tap
        </span>
      </div>
    </div>
  );
};
