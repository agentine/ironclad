import { describe, it, expect } from "vitest";
import { encrypt, decrypt, serialize, deserialize } from "../src/aes.js";


describe("AES-GCM (default)", () => {
  it("encrypt → decrypt round-trip with string data and binary key", async () => {
    const key = new Uint8Array(32).fill(0x42);
    const encrypted = await encrypt("hello world", key);
    expect(encrypted.mode).toBe("GCM");
    expect(encrypted.tag).toBeDefined();
    const decrypted = await decrypt(encrypted, key);
    expect(new TextDecoder().decode(decrypted)).toBe("hello world");
  });

  it("encrypt → decrypt round-trip with binary data", async () => {
    const key = new Uint8Array(32).fill(0xab);
    const data = new Uint8Array([1, 2, 3, 4, 5]);
    const encrypted = await encrypt(data, key);
    const decrypted = await decrypt(encrypted, key);
    expect(decrypted).toEqual(data);
  });

  it("wrong key fails authentication", async () => {
    const key1 = new Uint8Array(32).fill(0x01);
    const key2 = new Uint8Array(32).fill(0x02);
    const encrypted = await encrypt("secret", key1);
    await expect(decrypt(encrypted, key2)).rejects.toThrow();
  });

  it("encrypt → decrypt with string password (PBKDF2)", async () => {
    const encrypted = await encrypt("hello", "my-password");
    const decrypted = await decrypt(encrypted, "my-password");
    expect(new TextDecoder().decode(decrypted)).toBe("hello");
  }, 15000);

  it("wrong password fails", async () => {
    const encrypted = await encrypt("hello", "correct-password");
    await expect(decrypt(encrypted, "wrong-password")).rejects.toThrow();
  }, 15000);
});

describe("AES-CBC", () => {
  it("encrypt → decrypt round-trip", async () => {
    const key = new Uint8Array(32).fill(0x33);
    const encrypted = await encrypt("test data", key, { mode: "CBC" });
    expect(encrypted.mode).toBe("CBC");
    expect(encrypted.tag).toBeUndefined();
    const decrypted = await decrypt(encrypted, key, { mode: "CBC" });
    expect(new TextDecoder().decode(decrypted)).toBe("test data");
  });
});

describe("AES-CTR", () => {
  it("encrypt → decrypt round-trip", async () => {
    const key = new Uint8Array(32).fill(0x55);
    const encrypted = await encrypt("counter mode", key, { mode: "CTR" });
    expect(encrypted.mode).toBe("CTR");
    const decrypted = await decrypt(encrypted, key, { mode: "CTR" });
    expect(new TextDecoder().decode(decrypted)).toBe("counter mode");
  });
});

describe("AES key sizes", () => {
  it("AES-128-GCM", async () => {
    const key = new Uint8Array(16).fill(0x11);
    const encrypted = await encrypt("128-bit", key, { keySize: 128 });
    const decrypted = await decrypt(encrypted, key, { keySize: 128 });
    expect(new TextDecoder().decode(decrypted)).toBe("128-bit");
  });

  it("AES-192-GCM", async () => {
    const key = new Uint8Array(24).fill(0x22);
    const encrypted = await encrypt("192-bit", key, { keySize: 192 });
    const decrypted = await decrypt(encrypted, key, { keySize: 192 });
    expect(new TextDecoder().decode(decrypted)).toBe("192-bit");
  });
});

describe("serialize/deserialize", () => {
  it("round-trips GCM encrypted data", async () => {
    const key = new Uint8Array(32).fill(0x99);
    const encrypted = await encrypt("serialize test", key);
    const str = serialize(encrypted);
    const parsed = deserialize(str);
    expect(parsed.mode).toBe(encrypted.mode);
    expect(parsed.iv).toEqual(encrypted.iv);
    expect(parsed.ciphertext).toEqual(encrypted.ciphertext);
    expect(parsed.tag).toEqual(encrypted.tag);
    // Full decrypt after deserialization
    const decrypted = await decrypt(parsed, key);
    expect(new TextDecoder().decode(decrypted)).toBe("serialize test");
  });

  it("round-trips CBC encrypted data (no tag)", async () => {
    const key = new Uint8Array(32).fill(0x77);
    const encrypted = await encrypt("cbc test", key, { mode: "CBC" });
    const str = serialize(encrypted);
    const parsed = deserialize(str);
    const decrypted = await decrypt(parsed, key, { mode: "CBC" });
    expect(new TextDecoder().decode(decrypted)).toBe("cbc test");
  });
});