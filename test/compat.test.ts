import { describe, it, expect } from "vitest";
import { sha256, hmacSha256, toHex, fromHex, toBase64, fromBase64 } from "../src/index.js";

describe("crypto-js compatibility", () => {
  it("sha256 matches crypto-js output", async () => {
    // CryptoJS.SHA256("message").toString() === known value
    expect(await sha256("message")).toBe(
      "ab530a13e45914982b79f9b7e3fba994cfd1f3fb22f71cea1afbf02b460c6d1d",
    );
  });

  it("sha256 empty matches crypto-js", async () => {
    expect(await sha256("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("hmac-sha256 matches crypto-js output", async () => {
    // CryptoJS.HmacSHA256("message", "key").toString()
    expect(await hmacSha256("key", "message")).toBe(
      "6e9ef29b75fffc5b7abae527d58fdadb2fe42e7219011976917343065f58ed4a",
    );
  });

  it("hex encoding matches crypto-js", () => {
    const bytes = new TextEncoder().encode("hello");
    expect(toHex(bytes)).toBe("68656c6c6f");
    expect(fromHex("68656c6c6f")).toEqual(bytes);
  });

  it("base64 encoding matches crypto-js", () => {
    const bytes = new TextEncoder().encode("hello");
    expect(toBase64(bytes)).toBe("aGVsbG8=");
    expect(fromBase64("aGVsbG8=")).toEqual(bytes);
  });
});