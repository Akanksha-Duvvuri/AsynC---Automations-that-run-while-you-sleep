"""
security.py — decrypts credentials that the Next.js side encrypted.

This is the mirror of lib/crypto.ts. The Node side stores keys as:

    iv.ciphertext.authTag        (each base64, dot-separated)

AES-256-GCM detail worth knowing: Node gives you the auth tag as a
separate value, but Python's `cryptography` library expects
ciphertext and tag CONCATENATED. That's the little join you see below —
miss it and you get InvalidTag errors that look like key mismatches.
"""

import base64

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from config import ENCRYPTION_KEY_B64

_key = base64.b64decode(ENCRYPTION_KEY_B64)
if len(_key) != 32:
    raise RuntimeError("ENCRYPTION_KEY must decode to exactly 32 bytes")


def decrypt(stored: str) -> str:
    """Decrypt a value produced by lib/crypto.ts encrypt()."""
    try:
        iv_b64, data_b64, tag_b64 = stored.split(".")
    except ValueError:
        raise ValueError("Malformed encrypted value (expected iv.data.tag)")

    iv = base64.b64decode(iv_b64)
    ciphertext = base64.b64decode(data_b64)
    tag = base64.b64decode(tag_b64)

    aesgcm = AESGCM(_key)
    # cryptography wants ciphertext+tag as one blob
    plaintext = aesgcm.decrypt(iv, ciphertext + tag, None)
    return plaintext.decode("utf-8")
