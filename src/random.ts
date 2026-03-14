import { getRandomValues } from "./platform/detect.js";
import { toHex } from "./encoding/hex.js";
import { toBase64 } from "./encoding/base64.js";

/** Generate cryptographically secure random bytes */
export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  return getRandomValues(bytes);
}

/** Generate random bytes as hex string */
export function randomHex(length: number): string {
  return toHex(randomBytes(length));
}

/** Generate random bytes as base64 string */
export function randomBase64(length: number): string {
  return toBase64(randomBytes(length));
}