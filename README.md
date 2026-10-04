# Cyber-Twin
Cyber Twin — Interactive Cyber Incident Reconstruction & Replay for Digital Forensic Investigation

## Repository Structure

```text
Cyber-Twin/
├── frontend/                 # React web application, Three.js visualization & investigation UI
├── backend/                  # FastAPI backend server & REST APIs
├── forensic-engine/          # Digital forensics pipeline
│   ├── ingestion/            # Evidence collection & log ingestion
│   ├── parsing/              # Security and forensic log parsing
│   ├── normalization/        # Schema & timestamp normalization
│   ├── correlation/          # Multi-entity incident correlation
│   ├── evidence-processing/  # Metadata extraction & OpenCV image processing
│   └── evidence-linking/     # Evidence mapping & relationship linking
├── data/                     # Incident datasets
│   ├── sample/               # Simulated cyber logs for prototype evaluation
│   ├── raw/                  # Raw, unparsed evidence artifacts
│   └── processed/            # Cleaned, normalized forensic records
├── database/                 # Database engines
│   ├── postgresql/           # Structured metadata, audit logs, and system state
│   └── neo4j/                # Graph database for entities, relationships & attack paths
├── 3d-reconstruction/        # 3D scene reconstruction
│   ├── blender/              # Blender automation scripts & scene pipelines
│   ├── models/               # 3D models and evidence markers
│   └── assets/               # Textures, materials, and environment assets
├── docs/                     # Project documentation
│   ├── architecture/         # System architecture and technical specifications
│   ├── workflows/            # Forensic workflows and investigation procedures
│   ├── api/                  # API endpoint contracts and specifications
│   └── screenshots/          # UI mockups, screenshots, and diagrams
├── reports/                  # Forensic investigation reports & export templates
├── docker/                   # Docker & Docker Compose deployment configurations
├── README.md
└── .gitignore
```
