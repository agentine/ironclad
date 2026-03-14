import type { HmacAlgorithm } from "./types.js";
import { getSubtle } from "./platform/detect.js";

const encoder = new TextEncoder();

function toBytes(input: string | Uint8Array): Uint8Array {
  return typeof input === "string" ? encoder.encode(input) : input;
}

function bytesToHex(bytes: Uint8Array): string {
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i]!.toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Compute HMAC using the specified algorithm.
 * Returns hex-encoded MAC.
 */
export async function hmac(
  algorithm: HmacAlgorithm,
  key: string | Uint8Array,
  data: string | Uint8Array,
): Promise<string> {
  const subtle = getSubtle();
  const keyBytes = toBytes(key);
  const dataBytes = toBytes(data);

  // Casts needed: @types/node Uint8Array uses ArrayBufferLike, Web Crypto expects ArrayBuffer
  const cryptoKey = await subtle.importKey(
    "raw",
    keyBytes as unknown as ArrayBuffer,
    { name: "HMAC", hash: algorithm },
    false,
    ["sign"],
  );
  const signature = await subtle.sign("HMAC", cryptoKey, dataBytes as unknown as ArrayBuffer);
  return bytesToHex(new Uint8Array(signature));
}

/** HMAC-SHA256, returns hex string */
export async function hmacSha256(key: string | Uint8Array, data: string | Uint8Array): Promise<string> {
  return hmac("SHA-256", key, data);
}

/** HMAC-SHA384, returns hex string */
export async function hmacSha384(key: string | Uint8Array, data: string | Uint8Array): Promise<string> {
  return hmac("SHA-384", key, data);
}

/** HMAC-SHA512, returns hex string */
export async function hmacSha512(key: string | Uint8Array, data: string | Uint8Array): Promise<string> {
  return hmac("SHA-512", key, data);
}

/**
 * Verify an HMAC using timing-safe comparison.
 * Returns true if the computed MAC matches the expected hex string.
 */
export async function verify(
  algorithm: HmacAlgorithm,
  key: string | Uint8Array,
  data: string | Uint8Array,
  expectedHex: string,
): Promise<boolean> {
  const computed = await hmac(algorithm, key, data);
  return timingSafeEqual(computed, expectedHex);
}

/** Constant-time string comparison to prevent timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}