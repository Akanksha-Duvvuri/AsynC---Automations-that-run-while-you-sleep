import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * AsynC database schema (Drizzle + Neon Postgres)
 *
 * users        — accounts (email + hashed password)
 * credentials  — encrypted API keys per user per platform
 * flows        — plain-English automations the user has created
 * runs         — every execution of a flow (the activity log, for later)
 */

export const platformEnum = pgEnum("platform", [
  "aisensy",
  "razorpay",
  "zoho_books",
  "nimbuspost",
  "brevo",
  "resend",
  "google_sheets",
]);

export const flowStatusEnum = pgEnum("flow_status", [
  "draft",    // created, agent not wired yet
  "active",
  "paused",
]);

export const runStatusEnum = pgEnum("run_status", ["success", "failed"]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const credentials = pgTable("credentials", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  platform: platformEnum("platform").notNull(),
  /**
   * The API key, AES-256-GCM encrypted before it ever touches the DB.
   * Stored as: iv.ciphertext.authTag (all base64, dot-separated).
   * See lib/crypto.ts — never store keys in plain text.
   */
  encryptedKey: text("encrypted_key").notNull(),
  /** Optional label, e.g. "production" vs "test" keys */
  label: text("label"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const flows = pgTable("flows", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  /** The plain-English instruction the user typed */
  instruction: text("instruction").notNull(),
  status: flowStatusEnum("status").default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const runs = pgTable("runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  flowId: uuid("flow_id")
    .notNull()
    .references(() => flows.id, { onDelete: "cascade" }),
  status: runStatusEnum("status").notNull(),
  /** Short human-readable result, e.g. "WhatsApp sent to +91..." */
  resultMessage: text("result_message"),
  ranAt: timestamp("ran_at").defaultNow().notNull(),
});
