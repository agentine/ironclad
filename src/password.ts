import { deriveKey } from "./pbkdf2.js";
import { randomBytes } from "./random.js";
import { toBase64, fromBase64 } from "./encoding/base64.js";

const SALT_LENGTH = 16;
const HASH_LENGTH = 32;
const ITERATIONS = 600_000;
const VERSION = "v1";
const PREFIX = "ironclad";

/**
 * Hash a password using PBKDF2 with secure defaults.
 * Returns an encoded string: "ironclad:v1:iterations:base64(salt):base64(hash)"
 */
export async function hash(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derived = await deriveKey(password, salt, ITERATIONS, HASH_LENGTH, "SHA-256");
  return `${PREFIX}:${VERSION}:${ITERATIONS}:${toBase64(salt)}:${toBase64(derived)}`;
}

/**
 * Verify a password against a hash string.
 * Uses constant-time comparison to prevent timing attacks.
 */
export async function verify(password: string, hashStr: string): Promise<boolean> {
  const parts = hashStr.split(":");
  if (parts.length !== 5 || parts[0] !== PREFIX || parts[1] !== VERSION) {
    return false;
  }
  const iterations = parseInt(parts[2]!, 10);
  if (Number.isNaN(iterations) || iterations <= 0) return false;

  const salt = fromBase64(parts[3]!);
  const expectedHash = fromBase64(parts[4]!);
  const derived = await deriveKey(password, salt, iterations, expectedHash.length, "SHA-256");

  return timingSafeEqual(derived, expectedHash);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i]! ^ b[i]!;
  }
  return result === 0;
}