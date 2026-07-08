"""
agent/parser.py — the "AI" part of AsynC, and it's smaller than you think.

The LLM is used ONCE, at flow-creation time. It reads the user's
plain-English instruction and outputs a structured JSON plan.
After that, the plan is saved and the runtime never calls the LLM —
webhooks execute deterministic code.

Instruction in:
    "when someone pays on razorpay, whatsapp them a confirmation"

Plan out:
    {
        "trigger": {"platform": "razorpay", "event": "payment.captured"},
        "actions": [
            {
                "tool": "send_whatsapp",
                "campaign_name": "<ASK_USER>",
                "template_params_from": ["payment.amount"]
            }
        ]
    }
"""

import json

import anthropic

from config import ANTHROPIC_API_KEY

SYSTEM_PROMPT = """You convert automation instructions into JSON plans.

Supported triggers:
- razorpay: payment.captured

Supported action tools:
- send_whatsapp: fields = campaign_name (string or "<ASK_USER>" if the user
  didn't name a template), template_params_from (list of payload paths like
  "payment.amount", "payment.contact")

Rules:
- Respond with ONLY valid JSON. No markdown fences, no explanation.
- Shape: {"trigger": {"platform": ..., "event": ...}, "actions": [...]}
- If the instruction mentions anything unsupported (email, invoices,
  shipping), include it in "unsupported": ["..."] so the app can tell
  the user what's coming later.
- If the instruction is not an automation at all, respond:
  {"error": "not_an_automation"}"""


def parse_instruction(instruction: str) -> dict:
    """Plain English → structured plan. Raises on unparseable output."""
    if not ANTHROPIC_API_KEY:
        raise RuntimeError("ANTHROPIC_API_KEY not set")

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": instruction}],
    )

    raw = message.content[0].text.strip()

    # Defensive: strip fences in case the model wraps anyway
    if raw.startswith("```"):
        raw = raw.strip("`").removeprefix("json").strip()

    return json.loads(raw)
