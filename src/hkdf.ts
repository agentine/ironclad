import type { HashAlgorithm } from "./types.js";
import { getSubtle } from "./platform/detect.js";

/**
 * HKDF key expansion (RFC 5869).
 * Derives key material from input keying material (IKM).
 */
export async function expand(
  ikm: Uint8Array,
  length: number,
  info?: Uint8Array,
  salt?: Uint8Array,
  hash: HashAlgorithm = "SHA-256",
): Promise<Uint8Array> {
  const subtle = getSubtle();

  const baseKey = await subtle.importKey(
    "raw",
    ikm as unknown as ArrayBuffer,
    "HKDF",
    false,
    ["deriveBits"],
  );

  const bits = await subtle.deriveBits(
    {
      name: "HKDF",
      hash,
      salt: (salt ?? new Uint8Array(0)) as unknown as ArrayBuffer,
      info: (info ?? new Uint8Array(0)) as unknown as ArrayBuffer,
    },
    baseKey,
    length * 8,
  );

  return new Uint8Array(bits);
}