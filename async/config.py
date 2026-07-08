"""
config.py — loads environment variables once, fails loudly if missing.

Required in backend/.env:
    DATABASE_URL       — same Neon connection string as the frontend
    ENCRYPTION_KEY     — the SAME base64 key as the Next.js .env.local
                         (this is what lets Python decrypt keys Node encrypted)
    ANTHROPIC_API_KEY  — the agent's brain (only needed for /flows/activate)
    RAZORPAY_WEBHOOK_SECRET — optional in dev; set it in production
"""

import os
from dotenv import load_dotenv

load_dotenv()


def require(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value


DATABASE_URL = require("DATABASE_URL")
ENCRYPTION_KEY_B64 = require("ENCRYPTION_KEY")

# Optional — endpoints that need these check at call time instead
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
