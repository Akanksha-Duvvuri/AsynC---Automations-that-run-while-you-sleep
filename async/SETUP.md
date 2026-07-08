# AsynC Backend — Setup

## 0. One schema change first (frontend repo)

The agent stores its parsed plan on the flow. Add this column:

**db/schema.ts** — add to the `flows` table:
```ts
import { jsonb } from "drizzle-orm/pg-core";  // add to the existing import

// inside flows table:
plan: jsonb("plan"),
```

Then push it:
```bash
npx drizzle-kit push
```

## 1. Backend environment

```bash
cd backend
python -m venv venv
source venv/bin/activate        # you're on Arch, so this just works
pip install -r requirements.txt
```

Create `backend/.env`:
```bash
DATABASE_URL="postgresql://..."   # SAME Neon string as frontend
ENCRYPTION_KEY=""                 # SAME base64 key as frontend .env.local — this is the bridge
ANTHROPIC_API_KEY=""              # console.anthropic.com → API keys
RAZORPAY_WEBHOOK_SECRET=""        # leave empty for local dev
```

⚠️ ENCRYPTION_KEY must be IDENTICAL to the frontend's. Node encrypted
the credentials; Python decrypts them with the same key. Different
keys = InvalidTag errors everywhere.

## 2. Run it

```bash
uvicorn main:app --reload --port 8000
```

Check: http://localhost:8000/health → `{"status":"operational"}`
Bonus: http://localhost:8000/docs → FastAPI gives you free interactive API docs.

## 3. Test the full Day-1 pipe WITHOUT Razorpay

Simulate a payment webhook with curl (grab your user id from the
Neon users table):

```bash
curl -X POST http://localhost:8000/webhooks/razorpay/YOUR_USER_ID \
  -H "Content-Type: application/json" \
  -d '{
    "event": "payment.captured",
    "payload": { "payment": { "entity": {
      "contact": "+91XXXXXXXXXX",
      "amount": 5900
    }}}
  }'
```

Expected on first try: `{"ok": true, "executed": []}` — empty because
your flow is still `draft` with no plan. That's correct behavior.

## 4. Activate a flow (Day 2 — needs ANTHROPIC_API_KEY)

```bash
# flow id from the Neon flows table
curl -X POST http://localhost:8000/flows/YOUR_FLOW_ID/activate
```

You'll get back the parsed plan. Look at it — this is the LLM's only
job in the whole system. If campaign_name says "<ASK_USER>", edit the
plan row in Neon and put your real AiSensy campaign name (building the
UI for this is a later task).

Re-run the curl from step 3 — this time `executed` should contain your
flow id, a real WhatsApp should arrive, and the runs table gets a row.

## 5. Real Razorpay webhooks (when ready)

Local tunneling: `ngrok http 8000`, then in the Razorpay dashboard add
webhook URL `https://xxx.ngrok.io/webhooks/razorpay/YOUR_USER_ID`,
event `payment.captured`, set a secret, and put that secret in .env.

## Reading order

1. security.py       — the Node↔Python encryption bridge (smallest, most important)
2. main.py           — the webhook execution path, top to bottom
3. agent/parser.py   — the entire "AI" in ~40 lines
4. db.py             — plain SQL, no ORM, so you see exactly what runs
