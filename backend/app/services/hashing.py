import hashlib
from typing import Union


def calculate_sha256(content: Union[str, bytes]) -> str:
    """Calculate the SHA-256 cryptographic hash of string or raw bytes content.

    Args:
        content: String or byte data to hash.

    Returns:
        Hexadecimal SHA-256 hash string.
    """
    if isinstance(content, str):
        content_bytes = content.encode("utf-8")
    elif isinstance(content, bytes):
        content_bytes = content
    else:
        raise TypeError("Content must be either bytes or str")

    return hashlib.sha256(content_bytes).hexdigest()
