"""
main.py — the AsynC backend.

Endpoints:
    GET  /health                        — is the server alive
    POST /flows/{flow_id}/activate      — LLM parses instruction → plan (Day 2)
    POST /webhooks/razorpay/{user_id}   — payment events trigger flows (Day 1)

Run locally:
    uvicorn main:app --reload --port 8000

The execution path when a real payment happens:
    Razorpay → webhook → verify signature → find user's active flows
    → for each flow whose trigger matches → decrypt AiSensy key
    → send WhatsApp → log the run. No LLM anywhere in this path.
"""

import json

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

import db
from agent.parser import parse_instruction
from config import RAZORPAY_WEBHOOK_SECRET
from integrations.aisensy import send_whatsapp
from integrations.razorpay_verify import verify_signature
from security import decrypt

app = FastAPI(title="AsynC backend")

# Allow the Next.js dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "operational"}


# ---------------------------------------------------------------
# Day 2 — activate a flow: instruction → LLM → plan → status active
# ---------------------------------------------------------------

@app.post("/flows/{flow_id}/activate")
def activate_flow(flow_id: str):
    flow = db.get_flow(flow_id)
    if not flow:
        raise HTTPException(404, "Flow not found")

    try:
        plan = parse_instruction(flow["instruction"])
    except json.JSONDecodeError:
        raise HTTPException(502, "Agent returned unparseable plan — try rewording")

    if plan.get("error") == "not_an_automation":
        raise HTTPException(400, "That doesn't look like an automation instruction")

    db.save_plan_and_activate(flow_id, plan)
    return {"ok": True, "plan": plan}


# ---------------------------------------------------------------
# Day 1 — the Razorpay webhook that runs flows
# ---------------------------------------------------------------

@app.post("/webhooks/razorpay/{user_id}")
async def razorpay_webhook(user_id: str, request: Request):
    raw_body = await request.body()

    # --- 1. verify it's really Razorpay ---
    # v1 shortcut: one global webhook secret (you're the only tenant).
    # Multi-tenant version stores a webhook secret per user.
    if RAZORPAY_WEBHOOK_SECRET:
        signature = request.headers.get("x-razorpay-signature", "")
        if not verify_signature(raw_body, signature, RAZORPAY_WEBHOOK_SECRET):
            raise HTTPException(401, "Invalid webhook signature")
    # If no secret set (local dev), we accept unsigned — never do this in prod.

    payload = json.loads(raw_body)
    event = payload.get("event", "")

    # v1 only reacts to captured payments
    if event != "payment.captured":
        return {"ok": True, "skipped": event}

    payment = payload["payload"]["payment"]["entity"]
    contact = str(payment.get("contact", "")).lstrip("+")   # "919876543210"
    amount_rupees = f"₹{payment.get('amount', 0) / 100:.0f}"

    # --- 2. find this user's active flows with a matching trigger ---
    flows = db.get_active_flows_for_user(user_id)
    executed = []

    for flow in flows:
        plan = flow.get("plan")
        if isinstance(plan, str):
            plan = json.loads(plan)
        if not plan:
            continue

        trigger = plan.get("trigger", {})
        if trigger.get("platform") != "razorpay":
            continue

        # --- 3. run each action in the plan ---
        for action in plan.get("actions", []):
            if action.get("tool") != "send_whatsapp":
                continue  # only tool in v1

            encrypted = db.get_credential(user_id, "aisensy")
            if not encrypted:
                db.log_run(flow["id"], "failed", "AiSensy not connected")
                continue

            api_key = decrypt(encrypted)  # ← the Node-encrypted key, in Python

            try:
                send_whatsapp(
                    api_key=api_key,
                    campaign_name=action.get("campaign_name", ""),
                    destination=contact,
                    template_params=[amount_rupees],
                )
                db.log_run(flow["id"], "success", f"WhatsApp sent to {contact}")
                executed.append(flow["id"])
            except Exception as e:
                db.log_run(flow["id"], "failed", f"AiSensy error: {e}")

    return {"ok": True, "executed": executed}
