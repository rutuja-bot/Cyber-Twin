"""Test suite for Cyber Twin forensic engine."""

from pathlib import Path
import sys
import types

REPO_ROOT = Path(__file__).resolve().parent.parent
FORENSIC_DIR = REPO_ROOT / "forensic-engine"

if str(FORENSIC_DIR) not in sys.path:
    sys.path.insert(0, str(FORENSIC_DIR))

if "evidence_mapping" not in sys.modules:
    _pkg = types.ModuleType("evidence_mapping")
    _pkg.__path__ = [str(FORENSIC_DIR / "evidence-mapping")]
    _pkg.__file__ = str(FORENSIC_DIR / "evidence-mapping" / "__init__.py")
    sys.modules["evidence_mapping"] = _pkg
