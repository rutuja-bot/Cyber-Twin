"""Ingestion module for forensic logs."""

from .models import RawRecord
from .reader import DEFAULT_EVIDENCE_MAP, LogIngester

__all__ = ["RawRecord", "LogIngester", "DEFAULT_EVIDENCE_MAP"]
