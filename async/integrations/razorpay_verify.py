"""
integrations/razorpay_verify.py — webhook authenticity check.

Razorpay signs every webhook: HMAC-SHA256 of the RAW request body,
keyed with the webhook secret you set in their dashboard, sent in
the X-Razorpay-Signature header.

Why this matters: without verification, anyone who discovers your
webhook URL can POST fake "payment captured" events and trigger
your automations. Never skip this in production.
"""

import hashlib
import hmac


def verify_signature(raw_body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    # compare_digest prevents timing attacks vs plain ==
    return hmac.compare_digest(expected, signature)
