"""Blender / 3D Scene Pipeline — Generates and exports investigation_scene.glb.

Builds a valid GLTF 2.0 Binary (GLB) file representing the spatial investigation environment
(Corporate Office, Workstation Cubicle, Server Room / Datacenter, Perimeter Corridor)
with real vertex buffers, normal vectors, materials, and scene hierarchy.
"""

import json
import struct
from pathlib import Path


def create_box_mesh(min_x, min_y, min_z, max_x, max_y, max_z):
    """Generate vertex positions, normals, and indices for an axis-aligned box."""
    # 8 vertices
    vertices = [
        # Front face
        min_x, min_y, max_z,  max_x, min_y, max_z,  max_x, max_y, max_z,  min_x, max_y, max_z,
        # Back face
        max_x, min_y, min_z,  min_x, min_y, min_z,  min_x, max_y, min_z,  max_x, max_y, min_z,
        # Top face
        min_x, max_y, max_z,  max_x, max_y, max_z,  max_x, max_y, min_z,  min_x, max_y, min_z,
        # Bottom face
        min_x, min_y, min_z,  max_x, min_y, min_z,  max_x, min_y, max_z,  min_x, min_y, max_z,
        # Right face
        max_x, min_y, max_z,  max_x, min_y, min_z,  max_x, max_y, min_z,  max_x, max_y, max_z,
        # Left face
        min_x, min_y, min_z,  min_x, min_y, max_z,  min_x, max_y, max_z,  min_x, max_y, min_z,
    ]
    normals = [
        # Front
        0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
        # Back
        0, 0, -1,  0, 0, -1,  0, 0, -1,  0, 0, -1,
        # Top
        0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
        # Bottom
        0, -1, 0,  0, -1, 0,  0, -1, 0,  0, -1, 0,
        # Right
        1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
        # Left
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ]
    indices = []
    for i in range(6):
        base = i * 4
        indices.extend([base, base + 1, base + 2, base, base + 2, base + 3])
    return vertices, normals, indices


def build_investigation_glb() -> bytes:
    """Compile multi-room investigation scene into a binary GLB container."""
    # Combine geometry for:
    # 1. Main Floor (gray)
    # 2. Server Room Floor (blue-dark)
    # 3. Workstation Desk (wood/dark)
    # 4. Server Rack (dark metallic)
    # 5. Partition Walls (slate)
    boxes = [
        # Floor 1 (Office Area)
        (-10, -0.2, -6, 2, 0.0, 6),
        # Floor 2 (Server Room)
        (2.2, -0.2, -6, 10, 0.0, 6),
        # Workstation Desk 14 (Cubicle)
        (-6.0, 0.0, -1.0, -3.0, 0.8, 1.5),
        # Desk Monitor
        (-4.8, 0.8, -0.2, -4.2, 1.6, 0.8),
        # Server Rack SRV-CORP-FILE
        (5.0, 0.0, -2.0, 7.0, 2.8, 0.0),
        # Server Rack Backup
        (5.0, 0.0, 1.0, 7.0, 2.8, 3.0),
        # Boundary wall between Office and Server Room with doorway
        (2.0, 0.0, -6.0, 2.2, 3.0, -1.0),
        (2.0, 0.0, 1.0, 2.2, 3.0, 6.0),
        # Firewall Network Gateway Pedestal
        (-0.5, 0.0, -4.5, 0.5, 1.2, -3.5),
    ]

    all_positions = []
    all_normals = []
    all_indices = []

    index_offset = 0
    for box in boxes:
        v, n, idx = create_box_mesh(*box)
        all_positions.extend(v)
        all_normals.extend(n)
        for i in idx:
            all_indices.append(i + index_offset)
        index_offset += len(v) // 3

    # Pack binary buffers
    pos_bytes = struct.pack(f"<{len(all_positions)}f", *all_positions)
    norm_bytes = struct.pack(f"<{len(all_normals)}f", *all_normals)
    idx_bytes = struct.pack(f"<{len(all_indices)}H", *all_indices)

    # Pad each buffer chunk to 4-byte alignment
    def pad(b):
        return b + b"\x00" * ((4 - len(b) % 4) % 4)

    bin_data = pad(idx_bytes) + pad(pos_bytes) + pad(norm_bytes)

    idx_offset = 0
    idx_len = len(idx_bytes)
    pos_offset = len(pad(idx_bytes))
    pos_len = len(pos_bytes)
    norm_offset = pos_offset + len(pad(pos_bytes))
    norm_len = len(norm_bytes)

    min_x = min(all_positions[0::3])
    max_x = max(all_positions[0::3])
    min_y = min(all_positions[1::3])
    max_y = max(all_positions[1::3])
    min_z = min(all_positions[2::3])
    max_z = max(all_positions[2::3])

    gltf_dict = {
        "asset": {"version": "2.0", "generator": "Cyber-Twin 3D Scene Exporter"},
        "scenes": [{"nodes": [0]}],
        "nodes": [{"name": "InvestigationEnvironment", "mesh": 0}],
        "meshes": [
            {
                "name": "InvestigationSceneGeometry",
                "primitives": [
                    {
                        "attributes": {"POSITION": 1, "NORMAL": 2},
                        "indices": 0,
                        "mode": 4,
                        "material": 0,
                    }
                ],
            }
        ],
        "materials": [
            {
                "name": "CyberSceneMaterial",
                "pbrMetallicRoughness": {
                    "baseColorFactor": [0.22, 0.28, 0.36, 1.0],
                    "metallicFactor": 0.4,
                    "roughnessFactor": 0.6,
                },
                "emissiveFactor": [0.03, 0.08, 0.12],
            }
        ],
        "accessors": [
            {
                "bufferView": 0,
                "byteOffset": 0,
                "componentType": 5123,  # UNSIGNED_SHORT
                "count": len(all_indices),
                "type": "SCALAR",
                "max": [max(all_indices)],
                "min": [min(all_indices)],
            },
            {
                "bufferView": 1,
                "byteOffset": 0,
                "componentType": 5126,  # FLOAT
                "count": len(all_positions) // 3,
                "type": "VEC3",
                "max": [max_x, max_y, max_z],
                "min": [min_x, min_y, min_z],
            },
            {
                "bufferView": 2,
                "byteOffset": 0,
                "componentType": 5126,  # FLOAT
                "count": len(all_normals) // 3,
                "type": "VEC3",
                "max": [1.0, 1.0, 1.0],
                "min": [-1.0, -1.0, -1.0],
            },
        ],
        "bufferViews": [
            {"buffer": 0, "byteOffset": idx_offset, "byteLength": idx_len, "target": 34963},
            {"buffer": 0, "byteOffset": pos_offset, "byteLength": pos_len, "target": 34962},
            {"buffer": 0, "byteOffset": norm_offset, "byteLength": norm_len, "target": 34962},
        ],
        "buffers": [{"byteLength": len(bin_data)}],
    }

    json_str = json.dumps(gltf_dict, separators=(",", ":"))
    json_bytes = json_str.encode("utf-8")
    # Pad JSON to 4-byte alignment with spaces (0x20)
    json_bytes += b" " * ((4 - len(json_bytes) % 4) % 4)

    # GLB Header: magic=0x46546C67 ('glTF'), version=2, total_length
    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
    header = struct.pack("<4sII", b"glTF", 2, total_len)

    # JSON Chunk
    json_chunk_header = struct.pack("<II", len(json_bytes), 0x4E4F534A)  # 'JSON'
    # BIN Chunk
    bin_chunk_header = struct.pack("<II", len(bin_data), 0x004E4942)  # 'BIN\0'

    return header + json_chunk_header + json_bytes + bin_chunk_header + bin_data


def export_glb_to_files():
    """Build and save investigation_scene.glb to 3d-reconstruction and frontend/public."""
    glb_bytes = build_investigation_glb()

    out_paths = [
        Path("3d-reconstruction/models/investigation_scene.glb"),
        Path("frontend/public/models/investigation_scene.glb"),
    ]

    for p in out_paths:
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "wb") as f:
            f.write(glb_bytes)
        print(f"[OK] Exported GLB ({len(glb_bytes)} bytes) to {p}")


if __name__ == "__main__":
    export_glb_to_files()
