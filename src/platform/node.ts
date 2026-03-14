import { createHash } from "node:crypto";

/**
 * Compute MD5 hash using Node.js crypto module.
 * MD5 is not available in Web Crypto API, so we need a Node.js fallback.
 */
export function md5Node(data: Uint8Array): Uint8Array {
  const hash = createHash("md5");
  hash.update(data);
  return new Uint8Array(hash.digest());
}

/** Check if Node.js crypto createHash is available */
export function hasNodeCrypto(): boolean {
  try {
    createHash("md5");
    return true;
  } catch {
    return false;
  }
}