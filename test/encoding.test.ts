import { describe, it, expect } from "vitest";
import { toHex, fromHex, isHex } from "../src/encoding/hex.js";
import { toBase64, fromBase64, toBase64Url, fromBase64Url } from "../src/encoding/base64.js";
import { toUtf8Bytes, fromUtf8Bytes } from "../src/encoding/utf8.js";
import { wordsToBytes, bytesToWords, toString } from "../src/encoding/wordarray.js";
import { randomBytes, randomHex, randomBase64 } from "../src/random.js";

describe("hex", () => {
  it("round-trips bytes", () => {
    const bytes = new Uint8Array([0x00, 0x0f, 0xff, 0xab, 0xcd]);
    expect(fromHex(toHex(bytes))).toEqual(bytes);
  });

  it("encodes known value", () => {
    expect(toHex(new Uint8Array([0xde, 0xad, 0xbe, 0xef]))).toBe("deadbeef");
  });

  it("decodes known value", () => {
    expect(fromHex("deadbeef")).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
  });

  it("handles empty", () => {
    expect(toHex(new Uint8Array([]))).toBe("");
    expect(fromHex("")).toEqual(new Uint8Array([]));
  });

  it("throws on odd-length hex", () => {
    expect(() => fromHex("abc")).toThrow("odd length");
  });

  it("isHex validates correctly", () => {
    expect(isHex("deadbeef")).toBe(true);
    expect(isHex("DEADBEEF")).toBe(true);
    expect(isHex("abc")).toBe(false); // odd
    expect(isHex("zzzz")).toBe(false);
    expect(isHex("")).toBe(true);
  });
});

describe("base64", () => {
  it("encodes known values", () => {
    const enc = new TextEncoder();
    expect(toBase64(enc.encode(""))).toBe("");
    expect(toBase64(enc.encode("f"))).toBe("Zg==");
    expect(toBase64(enc.encode("fo"))).toBe("Zm8=");
    expect(toBase64(enc.encode("foo"))).toBe("Zm9v");
    expect(toBase64(enc.encode("foobar"))).toBe("Zm9vYmFy");
  });

  it("round-trips bytes", () => {
    const bytes = new Uint8Array([0, 1, 2, 253, 254, 255]);
    expect(fromBase64(toBase64(bytes))).toEqual(bytes);
  });

  it("decodes with whitespace and padding", () => {
    expect(fromBase64("Zm9v\nYmFy")).toEqual(new TextEncoder().encode("foobar"));
  });
});

describe("base64url", () => {
  it("encodes without padding", () => {
    const enc = new TextEncoder();
    expect(toBase64Url(enc.encode("f"))).toBe("Zg");
    expect(toBase64Url(enc.encode("fo"))).toBe("Zm8");
  });

  it("round-trips bytes", () => {
    const bytes = new Uint8Array([0xff, 0xfe, 0xfd]);
    expect(fromBase64Url(toBase64Url(bytes))).toEqual(bytes);
  });

  it("uses URL-safe characters", () => {
    // Byte sequence that produces + and / in standard base64
    const bytes = new Uint8Array([0xfb, 0xff, 0xfe]);
    const url = toBase64Url(bytes);
    expect(url).not.toContain("+");
    expect(url).not.toContain("/");
  });
});

describe("utf8", () => {
  it("round-trips ASCII", () => {
    expect(fromUtf8Bytes(toUtf8Bytes("hello"))).toBe("hello");
  });

  it("round-trips unicode", () => {
    const str = "Hello 🌍 Wörld";
    expect(fromUtf8Bytes(toUtf8Bytes(str))).toBe(str);
  });
});

describe("wordarray", () => {
  it("round-trips bytes", () => {
    const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x01]);
    const wa = bytesToWords(bytes);
    expect(wordsToBytes(wa.words, wa.sigBytes)).toEqual(bytes);
  });

  it("toString hex matches known crypto-js output", () => {
    // crypto-js: CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse("abc"))
    // = "616263"
    const wa = bytesToWords(new TextEncoder().encode("abc"));
    expect(toString(wa)).toBe("616263");
  });

  it("toString base64 matches known crypto-js output", () => {
    // crypto-js: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse("abc"))
    // = "YWJj"
    const wa = bytesToWords(new TextEncoder().encode("abc"));
    expect(toString(wa, "base64")).toBe("YWJj");
  });
});

describe("random", () => {
  it("generates correct length", () => {
    expect(randomBytes(16).length).toBe(16);
    expect(randomBytes(32).length).toBe(32);
  });

  it("generates unique values", () => {
    const a = randomHex(16);
    const b = randomHex(16);
    expect(a).not.toBe(b);
    expect(a).toHaveLength(32); // 16 bytes = 32 hex chars
  });

  it("randomBase64 generates correct output", () => {
    const b = randomBase64(16);
    expect(b.length).toBeGreaterThan(0);
    // Base64 of 16 bytes = 24 chars with padding
    expect(b).toHaveLength(24);
  });
});