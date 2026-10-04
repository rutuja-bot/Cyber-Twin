"""Registry and dispatcher for log format parsers."""

from typing import List, Optional

from ingestion.models import RawRecord
from .auth_parser import AuthLogParser
from .base import BaseLogParser, ParsedRecord
from .endpoint_parser import EndpointLogParser
from .file_access_parser import FileAccessLogParser
from .firewall_parser import FirewallLogParser
from .server_parser import ServerLogParser


class ParserRegistry:
    """Maintains available parsers and routes raw records to appropriate parsers."""

    def __init__(self, parsers: Optional[List[BaseLogParser]] = None):
        self.parsers: List[BaseLogParser] = parsers or [
            AuthLogParser(),
            EndpointLogParser(),
            ServerLogParser(),
            FileAccessLogParser(),
            FirewallLogParser(),
        ]

    def register(self, parser: BaseLogParser) -> None:
        """Register a new custom parser."""
        self.parsers.insert(0, parser)

    def parse_record(self, record: RawRecord) -> Optional[ParsedRecord]:
        """Find a capable parser and parse the raw record."""
        for parser in self.parsers:
            if parser.can_parse(record):
                parsed = parser.parse(record)
                if parsed is not None:
                    return parsed
        return None

    def parse_all(self, records: List[RawRecord]) -> List[ParsedRecord]:
        """Parse a collection of raw records."""
        parsed_records: List[ParsedRecord] = []
        for record in records:
            result = self.parse_record(record)
            if result is not None:
                parsed_records.append(result)
        return parsed_records
