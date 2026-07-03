import { getServerSession } from "next-auth";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { credentials, flows } from "@/db/schema";

/**
 * Dashboard home — server component, reads counts directly from the DB.
 * Overview cards + quick actions. Activity feed comes later (Phase 4+).
 */

export default async function DashboardHome() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id as string;

  const connected = await db
    .select({ platform: credentials.platform })
    .from(credentials)
    .where(eq(credentials.userId, userId));

  const userFlows = await db
    .select({ id: flows.id })
    .from(flows)
    .where(eq(flows.userId, userId));

  const firstName =
    session?.user?.name?.split(" ")[0] ??
    session?.user?.email?.split("@")[0] ??
    "user";

  return (
    <div className="space-y-8">
      <div>
        <p className="font-mono text-sm text-accent">$ whoami</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          welcome back, {firstName}
        </h1>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass rounded-xl px-5 py-6">
          <p className="font-mono text-xs text-dim">connected tools</p>
          <p className="mt-2 font-mono text-3xl font-bold">
            {connected.length}
            <span className="text-sm text-white/30"> / 7</span>
          </p>
        </div>
        <div className="glass rounded-xl px-5 py-6">
          <p className="font-mono text-xs text-dim">flows created</p>
          <p className="mt-2 font-mono text-3xl font-bold">{userFlows.length}</p>
        </div>
        <div className="glass rounded-xl px-5 py-6">
          <p className="font-mono text-xs text-dim">agent status</p>
          <p className="mt-2 font-mono text-sm text-amber-400">
            ● offline <span className="text-white/30">(phase 4)</span>
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/integrations"
          className="glass group rounded-xl px-6 py-8 transition-all hover:-translate-y-1 hover:glow-accent"
        >
          <p className="font-mono text-sm text-accent">01</p>
          <h2 className="mt-2 text-lg font-semibold">connect your tools</h2>
          <p className="mt-1 font-mono text-xs text-dim">
            paste your API keys — encrypted before they touch the database
          </p>
          <p className="mt-4 font-mono text-sm text-white/50 transition-colors group-hover:text-white">
            open integrations →
          </p>
        </Link>

        <Link
          href="/dashboard/flows"
          className="glass group rounded-xl px-6 py-8 transition-all hover:-translate-y-1 hover:glow-accent"
        >
          <p className="font-mono text-sm text-accent">02</p>
          <h2 className="mt-2 text-lg font-semibold">create a flow</h2>
          <p className="mt-1 font-mono text-xs text-dim">
            describe what you want in plain english — the agent handles the rest
          </p>
          <p className="mt-4 font-mono text-sm text-white/50 transition-colors group-hover:text-white">
            open flows →
          </p>
        </Link>
      </div>
    </div>
  );
}
