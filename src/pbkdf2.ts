import type { HashAlgorithm } from "./types.js";
import { getSubtle } from "./platform/detect.js";

const encoder = new TextEncoder();

function toBytes(input: string | Uint8Array): Uint8Array {
  return typeof input === "string" ? encoder.encode(input) : input;
}

/** OWASP 2023 recommended minimum iterations for PBKDF2-SHA256 */
const DEFAULT_ITERATIONS = 600_000;
const DEFAULT_KEY_LENGTH = 32; // 256 bits
const DEFAULT_HASH: HashAlgorithm = "SHA-256";

/**
 * Derive a key from a password using PBKDF2.
 */
export async function deriveKey(
  password: string | Uint8Array,
  salt: Uint8Array,
  iterations: number,
  keyLength: number,
  hash: HashAlgorithm = DEFAULT_HASH,
): Promise<Uint8Array> {
  const subtle = getSubtle();
  const passwordBytes = toBytes(password);

  const baseKey = await subtle.importKey(
    "raw",
    passwordBytes as unknown as ArrayBuffer,
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as unknown as ArrayBuffer,
      iterations,
      hash,
    },
    baseKey,
    keyLength * 8,
  );

  return new Uint8Array(bits);
}

/**
 * Derive a key with OWASP 2023 secure defaults:
 * PBKDF2-SHA256, 600K iterations, 32 bytes output.
 */
export async function defaultDeriveKey(
  password: string | Uint8Array,
  salt: Uint8Array,
): Promise<Uint8Array> {
  return deriveKey(password, salt, DEFAULT_ITERATIONS, DEFAULT_KEY_LENGTH, DEFAULT_HASH);
}