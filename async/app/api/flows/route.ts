import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { flows } from "@/db/schema";

/**
 * /api/flows
 * GET  — list the user's flows, newest first
 * POST — create a flow from a plain-English instruction.
 *        Status starts as "draft" — the agent (Phase 4) will
 *        interpret and activate these later.
 */

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select()
    .from(flows)
    .where(eq(flows.userId, userId))
    .orderBy(desc(flows.createdAt));

  return NextResponse.json({ flows: rows });
}

const createSchema = z.object({
  instruction: z.string().min(10, "Describe the flow in a bit more detail").max(1000),
});

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const [flow] = await db
    .insert(flows)
    .values({ userId, instruction: parsed.data.instruction })
    .returning();

  return NextResponse.json({ flow }, { status: 201 });
}
