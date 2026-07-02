<div align="center">

# `AsynC_`

**Automation that runs while you sleep.**

*AI-powered workflow automation for Indian startups — BYOK, plain English, zero code.*

`[ status: building v1 ]` · `[ stack: next.js + fastapi ]` · `[ location: hyderabad ]`

</div>

---

## `$ cat about.md`

So what is AsynC? as the name states - automations that run while you sleep, Automations that run while you do your work and busy with other things. 
Small startups in India run their operations across a patchwork of tools - for example, Aisensy for Whatsapp messages, Razorpay for payments (or Stripe), Zoho Book for invoicing, NimbusPost or Raidshyp for shipping and many more. This tool helps you automate all of that without the need of someone to bridge the gap between your needs and the software required. 


I was that developer. I built this exact stack manually for a funded beverage startup — every webhook, every integration, every edge case. AsynC is that experience turned into a product.

**The idea:** a founder logs in, connects the tools they already use or require, and describes what they want in plain English:

```
user@async:~$ when someone pays on razorpay, whatsapp them a confirmation with the following message "describe your message here..... " and generate a zoho invoice
> analyzing workflow...
> ✓ flow created — running in background
```

An AI agent interprets the instruction, builds the flow, and runs it. No Zapier logic trees. No developer on retainer. It just runs — asynchronously, in the background, while they do their actual work. Hence the name.

## `$ cat business-model.md`

**BYOK — Bring Your Own Keys.** Users already pay AiSensy, Razorpay, Brevo etc. directly. They paste their API keys into AsynC once (stored encrypted and safe), and AsynC becomes the intelligence layer that connects everything.

We never resell platform access, never touch their billing with those platforms, and never act as a payment middleman. What users pay for is the agent, the dashboard, and the hours they stop spending on manual ops.

| Package | Price | Includes | (tbd)
|---|---|---|
| `starter.pkg` | ₹2,000/mo | WhatsApp (AiSensy) · Email (Brevo) · Google Sheets |
| `growth.pkg` | ₹4,500/mo | + Razorpay payments · Zoho Books invoicing |
| `scale.pkg` | ₹8,000/mo | + NimbusPost shipping · custom flows · priority support |

## `$ tree ./architecture`

```
async/
├── frontend/            # Next.js 15 (App Router) + TypeScript + Tailwind v4
│   ├── landing page     # dot field, decrypt animations, terminal aesthetic
│   ├── auth             # NextAuth — email + password
│   └── dashboard        # integrations, flows, settings
│
├── backend/             # FastAPI (Python)
│   ├── credentials      # Fernet-encrypted API key storage
│   ├── webhooks         # Razorpay events in, automations out
│   └── agent/           # LangChain — tools + agent pattern
│       ├── send_whatsapp      (AiSensy)
│       ├── send_email         (Brevo / Resend)
│       ├── create_invoice     (Zoho Books)
│       ├── create_shipment    (NimbusPost)
│       └── sheets_read_write  (Google Sheets)
│
└── db/                  # PostgreSQL (Neon)
    └── users · credentials · flows · runs
```

**Why two servers?** Next.js API routes run on serverless functions — fine for CRUD, wrong for long-running agent executions with multiple sequential tool calls. The FastAPI backend runs as a persistent process (Railway/Render) and the frontend talks to it over HTTP.

**Why Python for the agent?** The AI tooling ecosystem (LangChain, LLM SDKs) is Python-first. The agent takes a plain-English instruction, decides which tools to call, executes them with the user's decrypted credentials, and logs the run.

## `$ cat roadmap.md`

- [x] **Phase 0** — idea, business model, architecture
- [x] **Phase 1** — landing page (intro screen, dot field, packages, workflow matcher)
- [ ] **Phase 2** — auth + dashboard shell + encrypted credential storage
- [ ] **Phase 3** — first real integration: Razorpay webhook → AiSensy WhatsApp
- [ ] **Phase 4** — the agent: plain English → LangChain tools → running flows
- [ ] **Phase 5** — email, Zoho, NimbusPost, Sheets integrations
- [ ] **Phase 6** — first user onboarded (pilot with a real startup)
- [ ] **Phase 7** — landing customers beyond the pilot (target - due 19th July)

**v1 success metric:** one person sets up one automation flow without my help. Everything else is secondary.

```

## `$ whoami`

Built by **Akanksha Duvvuri**. Converting experience into products.
---

<div align="center">

`all systems operational`

</div>