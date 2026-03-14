const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const CHARS_URL = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** Convert bytes to Base64 string */
export function toBase64(bytes: Uint8Array): string {
  let result = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const a = bytes[i]!;
    const b = i + 1 < len ? bytes[i + 1]! : 0;
    const c = i + 2 < len ? bytes[i + 2]! : 0;
    result += CHARS[(a >> 2)!]!;
    result += CHARS[((a & 3) << 4) | (b >> 4)]!;
    result += i + 1 < len ? CHARS[((b & 15) << 2) | (c >> 6)]! : "=";
    result += i + 2 < len ? CHARS[c & 63]! : "=";
  }
  return result;
}

/** Convert Base64 string to bytes */
export function fromBase64(b64: string): Uint8Array {
  const clean = b64.replace(/[\s=]/g, "");
  const lookup = new Map<string, number>();
  for (let i = 0; i < CHARS.length; i++) lookup.set(CHARS[i]!, i);

  const byteLen = Math.floor((clean.length * 3) / 4);
  const bytes = new Uint8Array(byteLen);
  let pos = 0;

  for (let i = 0; i < clean.length; i += 4) {
    const a = lookup.get(clean[i]!) ?? 0;
    const b = lookup.get(clean[i + 1]!) ?? 0;
    const c = i + 2 < clean.length ? (lookup.get(clean[i + 2]!) ?? 0) : 0;
    const d = i + 3 < clean.length ? (lookup.get(clean[i + 3]!) ?? 0) : 0;

    bytes[pos++] = (a << 2) | (b >> 4);
    if (i + 2 < clean.length) bytes[pos++] = ((b & 15) << 4) | (c >> 2);
    if (i + 3 < clean.length) bytes[pos++] = ((c & 3) << 6) | d;
  }

  return bytes.slice(0, pos);
}

/** Convert bytes to URL-safe Base64 (no padding) */
export function toBase64Url(bytes: Uint8Array): string {
  let result = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const a = bytes[i]!;
    const b = i + 1 < len ? bytes[i + 1]! : 0;
    const c = i + 2 < len ? bytes[i + 2]! : 0;
    result += CHARS_URL[(a >> 2)!]!;
    result += CHARS_URL[((a & 3) << 4) | (b >> 4)]!;
    if (i + 1 < len) result += CHARS_URL[((b & 15) << 2) | (c >> 6)]!;
    if (i + 2 < len) result += CHARS_URL[c & 63]!;
  }
  return result;
}

/** Convert URL-safe Base64 string (no padding) to bytes */
export function fromBase64Url(b64url: string): Uint8Array {
  // Convert URL-safe to standard base64 then decode
  const standard = b64url.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding
  const padded = standard + "=".repeat((4 - (standard.length % 4)) % 4);
  return fromBase64(padded);
}