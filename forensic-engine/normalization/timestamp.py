"""Timestamp normalization utilities for standardizing heterogeneous log dates."""

from datetime import datetime
import re
from typing import Optional


MONTH_MAP = {
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "may": 5, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "oct": 10, "nov": 11, "dec": 12,
}


def normalize_timestamp(raw_timestamp: str, default_year: int = 2026) -> str:
    """Normalize any supported timestamp string into standardized ISO 8601 (YYYY-MM-DDTHH:MM:SS).

    Supported formats:
    - 2026-10-04 10:15:00
    - 2026-10-04T10:15:00
    - 2026-10-04T10:15:00Z
    - 2026-10-04T10:15:00.123456
    - Oct 04 10:15:00 / Oct  4 10:15:00 (Syslog)
    - 2026/10/04 10:15:00
    - Epoch timestamp (e.g. 1791108900)
    """
    cleaned = raw_timestamp.strip()

    # 1. ISO 8601 format: 2026-10-04T10:15:00 or 2026-10-04 10:15:00
    iso_match = re.match(r"^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$", cleaned)
    if iso_match:
        year, month, day, hour, minute, second = iso_match.groups()
        return f"{year}-{month}-{day}T{hour}:{minute}:{second}"

    # 2. Slash format: 2026/10/04 10:15:00
    slash_match = re.match(r"^(\d{4})/(\d{2})/(\d{2})[T ](\d{2}):(\d{2}):(\d{2})$", cleaned)
    if slash_match:
        year, month, day, hour, minute, second = slash_match.groups()
        return f"{year}-{month}-{day}T{hour}:{minute}:{second}"

    # 3. Syslog format: Oct 04 10:15:00 or Oct  4 10:15:00
    syslog_match = re.match(r"^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{2}):(\d{2}):(\d{2})$", cleaned)
    if syslog_match:
        month_str, day_str, hour, minute, second = syslog_match.groups()
        month_num = MONTH_MAP.get(month_str.lower(), 1)
        day_num = int(day_str)
        return f"{default_year:04d}-{month_num:02d}-{day_num:02d}T{hour}:{minute}:{second}"

    # 4. Fallback to datetime.fromisoformat
    try:
        dt = datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%dT%H:%M:%S")
    except Exception:
        pass

    # 5. Fallback numeric epoch
    try:
        epoch = float(cleaned)
        dt = datetime.fromtimestamp(epoch)
        return dt.strftime("%Y-%m-%dT%H:%M:%S")
    except Exception:
        pass

    raise ValueError(f"Unable to parse timestamp: '{raw_timestamp}'")
