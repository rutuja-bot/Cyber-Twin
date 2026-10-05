import pytest
from app.services.hashing import calculate_sha256


def test_calculate_sha256_string():
    text = "Cyber Twin Digital Forensics"
    # Computed SHA-256 for this exact UTF-8 string
    expected_hash = "4a41e2c04746aca6744517f2c98c0a5db3af645209c1d4b9f96a593381045da0"
    assert calculate_sha256(text) == expected_hash


def test_calculate_sha256_bytes():
    raw_bytes = b"Cyber Twin Digital Forensics"
    expected_hash = "4a41e2c04746aca6744517f2c98c0a5db3af645209c1d4b9f96a593381045da0"
    assert calculate_sha256(raw_bytes) == expected_hash


def test_calculate_sha256_empty():
    assert calculate_sha256("") == "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"


def test_calculate_sha256_invalid_type():
    with pytest.raises(TypeError):
        calculate_sha256(12345)
