import { describe, it, expect } from "vitest";
import { deriveKey, defaultDeriveKey } from "../src/pbkdf2.js";
import { toHex } from "../src/encoding/hex.js";
import { expand } from "../src/hkdf.js";

describe("pbkdf2", () => {
  it("NIST test vector: SHA-256, password='password', salt='salt', 1 iteration, 32 bytes", async () => {
    const salt = new TextEncoder().encode("salt");
    const result = await deriveKey("password", salt, 1, 32, "SHA-256");
    expect(toHex(result)).toBe(
      "120fb6cffcf8b32c43e7225256c4f837a86548c92ccc35480805987cb70be17b",
    );
  });

  it("NIST test vector: SHA-256, 4096 iterations", async () => {
    const salt = new TextEncoder().encode("salt");
    const result = await deriveKey("password", salt, 4096, 32, "SHA-256");
    expect(toHex(result)).toBe(
      "c5e478d59288c841aa530db6845c4c8d962893a001ce4e11a4963873aa98134a",
    );
  });

  it("defaultDeriveKey uses 600K iterations (produces 32-byte key)", async () => {
    const salt = new Uint8Array(16).fill(0);
    const result = await defaultDeriveKey("test", salt);
    expect(result.length).toBe(32);
  }, 10000);

  it("different salts produce different keys", async () => {
    const salt1 = new TextEncoder().encode("salt1");
    const salt2 = new TextEncoder().encode("salt2");
    const key1 = await deriveKey("password", salt1, 1000, 32);
    const key2 = await deriveKey("password", salt2, 1000, 32);
    expect(toHex(key1)).not.toBe(toHex(key2));
  });
});

describe("hkdf", () => {
  it("derives key material", async () => {
    const ikm = new Uint8Array(32).fill(0x0b);
    const result = await expand(ikm, 32);
    expect(result.length).toBe(32);
  });

  it("different info produces different keys", async () => {
    const ikm = new Uint8Array(32).fill(0x0b);
    const info1 = new TextEncoder().encode("info1");
    const info2 = new TextEncoder().encode("info2");
    const key1 = await expand(ikm, 32, info1);
    const key2 = await expand(ikm, 32, info2);
    expect(toHex(key1)).not.toBe(toHex(key2));
  });

  it("RFC 5869 Test Case 1 (SHA-256)", async () => {
    const ikm = new Uint8Array(22).fill(0x0b);
    const salt = new Uint8Array([0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,0x09,0x0a,0x0b,0x0c]);
    const info = new Uint8Array([0xf0,0xf1,0xf2,0xf3,0xf4,0xf5,0xf6,0xf7,0xf8,0xf9]);
    const result = await expand(ikm, 42, info, salt, "SHA-256");
    expect(toHex(result)).toBe(
      "3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf34007208d5b887185865",
    );
  });

  it("RFC 5869 Test Case 3 (SHA-256, zero-length salt/info)", async () => {
    const ikm = new Uint8Array(22).fill(0x0b);
    const result = await expand(ikm, 42, new Uint8Array(0), new Uint8Array(0), "SHA-256");
    expect(toHex(result)).toBe(
      "8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d9d201395faa4b61a96c8",
    );
  });
});