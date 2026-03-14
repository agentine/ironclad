import type { HashAlgorithm } from "./types.js";
import { getSubtle } from "./platform/detect.js";
import { isNode } from "./platform/detect.js";

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
 * Compute a hash digest using the specified algorithm.
 * Delegates to Web Crypto API (crypto.subtle).
 */
export async function digest(algorithm: HashAlgorithm, input: string | Uint8Array): Promise<string> {
  const data = toBytes(input);
  const subtle = getSubtle();
  // Cast needed: @types/node Uint8Array uses ArrayBufferLike, Web Crypto expects ArrayBuffer
  const buffer = await subtle.digest(algorithm, data as unknown as ArrayBuffer);
  return bytesToHex(new Uint8Array(buffer));
}

/** SHA-256 hash, returns hex string */
export async function sha256(input: string | Uint8Array): Promise<string> {
  return digest("SHA-256", input);
}

/** SHA-384 hash, returns hex string */
export async function sha384(input: string | Uint8Array): Promise<string> {
  return digest("SHA-384", input);
}

/** SHA-512 hash, returns hex string */
export async function sha512(input: string | Uint8Array): Promise<string> {
  return digest("SHA-512", input);
}

/** SHA-1 hash, returns hex string. Legacy — prefer SHA-256+. */
export async function sha1(input: string | Uint8Array): Promise<string> {
  return digest("SHA-1", input);
}

/**
 * MD5 hash, returns hex string.
 * Legacy — MD5 is cryptographically broken. Use SHA-256+ for security.
 * Uses Node.js crypto on Node, pure-JS fallback on browser.
 */
let _md5Warned = false;
export async function md5(input: string | Uint8Array): Promise<string> {
  if (!_md5Warned) {
    console.warn("[ironclad] MD5 is cryptographically broken. Use sha256() for security.");
    _md5Warned = true;
  }
  const data = toBytes(input);
  if (isNode()) {
    const { md5Node } = await import("./platform/node.js");
    return bytesToHex(md5Node(data));
  }
  const { md5Browser } = await import("./platform/browser.js");
  return bytesToHex(md5Browser(data));
}