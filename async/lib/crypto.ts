import crypto from "crypto";

/**
 * Credential encryption — AES-256-GCM
 *
 * Why GCM: it's authenticated encryption. Along with the ciphertext it
 * produces an auth tag, so if anyone tampers with the stored value,
 * decryption fails loudly instead of returning garbage.
 *
 * Storage format:  iv.ciphertext.authTag   (each base64, dot-separated)
 *
 * ENCRYPTION_KEY must be exactly 32 bytes, base64-encoded in .env:
 *   node -e "console.log(crypto.randomBytes(32).toString('base64'))"
 *
 * NOTE: Python can decrypt this too (cryptography.hazmat AESGCM),
 * so the FastAPI agent will read these same values later.
 */

const ALGO = "aes-256-gcm";

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY is not set");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes (base64)");
  return key;
}

export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(12); // 12-byte IV is the GCM standard
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    encrypted.toString("base64"),
    authTag.toString("base64"),
  ].join(".");
}

export function decrypt(stored: string): string {
  const [ivB64, dataB64, tagB64] = stored.split(".");
  if (!ivB64 || !dataB64 || !tagB64) throw new Error("Malformed encrypted value");

  const decipher = crypto.createDecipheriv(
    ALGO,
    getKey(),
    Buffer.from(ivB64, "base64")
  );
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

/**
 * For displaying in the UI — never send the real key back to the client.
 * "sk_live_abc123xyz" → "sk_l••••••••3xyz"
 */
export function maskKey(key: string): string {
  if (key.length <= 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}
