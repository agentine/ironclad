import { describe, it, expect, afterEach } from "vitest";
import { isNode, isBrowser, isDeno, isBun, isCloudflareWorker } from "../src/platform/detect.js";

describe("platform detection", () => {
  it("isNode() returns true in Node.js", () => {
    expect(isNode()).toBe(true);
  });

  it("isBrowser() returns false in Node.js", () => {
    expect(isBrowser()).toBe(false);
  });

  it("isDeno() returns false in Node.js", () => {
    expect(isDeno()).toBe(false);
  });

  it("isBun() returns false in Node.js", () => {
    expect(isBun()).toBe(false);
  });

  it("isCloudflareWorker() returns false in Node.js", () => {
    expect(isCloudflareWorker()).toBe(false);
  });
});

describe("browser environment simulation", () => {
  const originalWindow = (globalThis as any).window;
  const originalDocument = (globalThis as any).document;

  afterEach(() => {
    if (originalWindow === undefined) {
      delete (globalThis as any).window;
    } else {
      (globalThis as any).window = originalWindow;
    }
    if (originalDocument === undefined) {
      delete (globalThis as any).document;
    } else {
      (globalThis as any).document = originalDocument;
    }
  });

  it("isBrowser() returns true when window and document exist", () => {
    (globalThis as any).window = {};
    (globalThis as any).document = {};
    expect(isBrowser()).toBe(true);
  });
});

describe("crypto API availability", () => {
  it("sha256 works in Node.js environment", async () => {
    const { sha256 } = await import("../src/hash.js");
    const hash = await sha256("test");
    expect(hash).toBe("9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08");
  });

  it("aes encrypt/decrypt round-trip works", async () => {
    const { aes } = await import("../src/index.js");
    const key = new Uint8Array(32).fill(0x42);
    const encrypted = await aes.encrypt("hello browser", key);
    const decrypted = await aes.decrypt(encrypted, key);
    expect(new TextDecoder().decode(decrypted)).toBe("hello browser");
  });

  it("randomBytes works", async () => {
    const { randomBytes } = await import("../src/random.js");
    const bytes = randomBytes(16);
    expect(bytes.length).toBe(16);
    expect(bytes.some((b) => b !== 0)).toBe(true);
  });
});
