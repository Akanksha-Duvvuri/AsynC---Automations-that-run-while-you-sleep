import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

/**
 * Single shared Drizzle client, same pattern as Bluprynt.
 * DATABASE_URL comes from your Neon dashboard → Connection string.
 */

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
