"""
db.py — talks to the SAME Neon Postgres the Next.js app uses.
Same tables, same rows. The frontend writes credentials/flows,
this backend reads them.

psycopg3 (sync) is used deliberately — simpler to read while learning.
FastAPI runs sync endpoint code in a threadpool, so this is fine
at v1 scale. Swap to async later if it ever matters.
"""

import json
from contextlib import contextmanager

import psycopg
from psycopg.rows import dict_row

from config import DATABASE_URL


@contextmanager
def get_conn():
    """One connection per request — simple and safe for v1."""
    conn = psycopg.connect(DATABASE_URL, row_factory=dict_row)
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


# ---------- credentials ----------

def get_credential(user_id: str, platform: str) -> str | None:
    """Returns the ENCRYPTED key for a user+platform, or None."""
    with get_conn() as conn:
        row = conn.execute(
            "SELECT encrypted_key FROM credentials WHERE user_id = %s AND platform = %s",
            (user_id, platform),
        ).fetchone()
        return row["encrypted_key"] if row else None


# ---------- flows ----------

def get_flow(flow_id: str) -> dict | None:
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM flows WHERE id = %s", (flow_id,)
        ).fetchone()


def get_active_flows_for_user(user_id: str) -> list[dict]:
    with get_conn() as conn:
        return conn.execute(
            "SELECT * FROM flows WHERE user_id = %s AND status = 'active'",
            (user_id,),
        ).fetchall()


def save_plan_and_activate(flow_id: str, plan: dict) -> None:
    """Store the agent's parsed plan and flip status draft → active."""
    with get_conn() as conn:
        conn.execute(
            "UPDATE flows SET plan = %s, status = 'active' WHERE id = %s",
            (json.dumps(plan), flow_id),
        )


# ---------- runs (the activity log) ----------

def log_run(flow_id: str, status: str, message: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO runs (flow_id, status, result_message) VALUES (%s, %s, %s)",
            (flow_id, status, message),
        )
