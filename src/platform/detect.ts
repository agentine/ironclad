// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;

// Cache crypto references for performance
let _subtle: SubtleCrypto | undefined;
let _crypto: Crypto | undefined;
let _loaded = false;

function loadCrypto(): void {
  if (_loaded) return;
  _loaded = true;
  try {
    // Most environments: globalThis.crypto.subtle (Node 19+, browsers, Deno, Bun, Workers)
    if (typeof g.crypto?.subtle !== "undefined") {
      _subtle = g.crypto.subtle;
      _crypto = g.crypto;
      return;
    }
    // Node.js 18 fallback: crypto.webcrypto
    if (isNode()) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodeCrypto = g.require ? g.require("node:crypto") : require("node:crypto");
      if (nodeCrypto.webcrypto?.subtle) {
        _subtle = nodeCrypto.webcrypto.subtle;
        _crypto = nodeCrypto.webcrypto;
      }
    }
  } catch {
    // crypto not available in this environment
  }
}

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
  loadCrypto();
  if (_subtle) return _subtle;
  throw new Error("Web Crypto API (crypto.subtle) is not available in this environment");
}

/** Get the crypto.getRandomValues function */
export function getRandomValues(array: Uint8Array): Uint8Array {
  loadCrypto();
  if (_crypto?.getRandomValues) {
    return _crypto.getRandomValues(array);
  }
  throw new Error("crypto.getRandomValues is not available in this environment");
}