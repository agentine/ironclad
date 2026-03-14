const encoder = new TextEncoder();
const decoder = new TextDecoder();

/** Convert string to UTF-8 bytes */
export function toUtf8Bytes(str: string): Uint8Array {
  return encoder.encode(str);
}

/** Convert UTF-8 bytes to string */
export function fromUtf8Bytes(bytes: Uint8Array): string {
  return decoder.decode(bytes);
}