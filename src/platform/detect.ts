// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

/** Check if running in Node.js */
export function isNode(): boolean {
  return (
    typeof g.process !== "undefined" &&
    typeof g.process.versions !== "undefined" &&
    typeof g.process.versions.node !== "undefined"
  );
}

/** Check if running in a browser */
export function isBrowser(): boolean {
  return (
    typeof g.window !== "undefined" &&
    typeof g.document !== "undefined"
  );
}

/** Check if running in Deno */
export function isDeno(): boolean {
  return typeof g.Deno !== "undefined";
}

/** Check if running in Bun */
export function isBun(): boolean {
  return typeof g.Bun !== "undefined";
}

/** Check if running in Cloudflare Workers */
export function isCloudflareWorker(): boolean {
  return (
    typeof g.caches !== "undefined" &&
    typeof g.HTMLRewriter !== "undefined"
  );
}

/** Get the Web Crypto API subtle object, available in all modern runtimes */
export function getSubtle(): SubtleCrypto {
  if (typeof globalThis.crypto?.subtle !== "undefined") {
    return globalThis.crypto.subtle;
  }
  throw new Error("Web Crypto API (crypto.subtle) is not available in this environment");
}

/** Get the crypto.getRandomValues function */
export function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof globalThis.crypto?.getRandomValues !== "undefined") {
    return globalThis.crypto.getRandomValues(array);
  }
  throw new Error("crypto.getRandomValues is not available in this environment");
}