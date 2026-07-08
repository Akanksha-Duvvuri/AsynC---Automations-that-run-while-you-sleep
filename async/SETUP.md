# AsynC — Phase 2 Setup (auth + dashboard + encrypted credentials)

## 1. Install new dependencies

```bash
npm install next-auth bcryptjs zod drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit @types/bcryptjs
```

## 2. Merge these files into your project

Everything here sits alongside your Phase 1 landing page files.
`DotField.tsx` from Phase 1 is reused by the login/signup pages.

```
db/schema.ts                     ← tables: users, credentials, flows, runs
db/index.ts                      ← drizzle + neon client
drizzle.config.ts                ← project root
middleware.ts                    ← project root (protects /dashboard)
lib/auth.ts                      ← NextAuth options
lib/crypto.ts                    ← AES-256-GCM encrypt/decrypt  ★ read this one
lib/integrations.ts              ← the 7 supported platforms
app/api/auth/[...nextauth]/route.ts
app/api/signup/route.ts
app/api/credentials/route.ts     ← ★ and this one
app/api/flows/route.ts
app/login/page.tsx
app/signup/page.tsx
app/dashboard/layout.tsx
app/dashboard/page.tsx
app/dashboard/integrations/page.tsx
app/dashboard/flows/page.tsx
app/dashboard/settings/page.tsx
components/DashboardNav.tsx
```

## 3. Wrap the app in SessionProvider

The settings page uses `useSession()`, which needs a provider.
Create `components/Providers.tsx`:

```tsx
"use client";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

Then in `app/layout.tsx`, wrap children:

```tsx
<body className={...}>
  <Providers>{children}</Providers>
</body>
```

## 4. Environment variables — `.env.local`

```bash
# Neon — dashboard → connection string
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""   # generate: openssl rand -base64 32

# Credential encryption — MUST be exactly 32 bytes base64
ENCRYPTION_KEY=""    # generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 5. Push the schema to Neon

```bash
npx drizzle-kit push
```

This creates the four tables. Check the Neon dashboard to confirm.

## 6. Run it

```bash
npm run dev
```

Flow to test:
1. `/signup` → create account → lands in dashboard
2. `/dashboard/integrations` → connect AiSensy with any fake key
3. Check Neon: the `credentials.encrypted_key` column should be
   gibberish like `sGf3...==.9dKl...==.pQ2x...==` — never plain text
4. `/dashboard/flows` → create a flow → appears as `draft`
5. Log out → try opening `/dashboard` directly → redirected to login

## Reading order (core mechanics first)

1. `lib/crypto.ts` — how AES-GCM works, the iv.cipher.tag format
2. `app/api/credentials/route.ts` — session scoping + encryption in action
3. `lib/auth.ts` — how the user id travels: DB → JWT → session
4. `middleware.ts` + `dashboard/layout.tsx` — the protection layers

## What's intentionally NOT here (next phases)

- Password change + account deletion APIs (TODOs in settings page — good solo practice)
- Razorpay webhook receiver (Phase 3 — first FastAPI piece)
- The agent (Phase 4)
