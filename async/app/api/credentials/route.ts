import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { credentials, platformEnum } from "@/db/schema";
import { encrypt } from "@/lib/crypto";

/**
 * /api/credentials
 *
 * GET  — list which platforms the user has connected (never returns keys)
 * POST — save/replace an API key for a platform (encrypted before insert)
 * DELETE — disconnect a platform
 *
 * Every query is scoped to the session user id. This is the single most
 * important security rule in the whole app: users can only ever touch
 * their own rows.
 */

async function requireUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string })?.id ?? null;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db
    .select({
      platform: credentials.platform,
      label: credentials.label,
      createdAt: credentials.createdAt,
    })
    .from(credentials)
    .where(eq(credentials.userId, userId));

  return NextResponse.json({ connected: rows });
}

const saveSchema = z.object({
  platform: z.enum(platformEnum.enumValues),
  apiKey: z.string().min(4).max(4096),
  label: z.string().max(60).optional(),
});

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { platform, apiKey, label } = parsed.data;

  // One credential per platform per user — replace if it exists
  await db
    .delete(credentials)
    .where(and(eq(credentials.userId, userId), eq(credentials.platform, platform)));

  await db.insert(credentials).values({
    userId,
    platform,
    encryptedKey: encrypt(apiKey), // ← the key is encrypted right here
    label,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

const deleteSchema = z.object({
  platform: z.enum(platformEnum.enumValues),
});

export async function DELETE(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
  }

  await db
    .delete(credentials)
    .where(
      and(
        eq(credentials.userId, userId),
        eq(credentials.platform, parsed.data.platform)
      )
    );

  return NextResponse.json({ ok: true });
}
