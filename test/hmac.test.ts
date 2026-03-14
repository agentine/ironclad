import { describe, it, expect } from "vitest";
import { hmac, hmacSha256, hmacSha384, hmacSha512, verify } from "../src/hmac.js";

// RFC 4231 test vectors
describe("hmac", () => {
  it("HMAC-SHA256 RFC 4231 Test Case 1", async () => {
    // Key = 0x0b repeated 20 times, Data = "Hi There"
    const key = new Uint8Array(20).fill(0x0b);
    const result = await hmac("SHA-256", key, "Hi There");
    expect(result).toBe(
      "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7",
    );
  });

  it("HMAC-SHA256 RFC 4231 Test Case 2", async () => {
    // Key = "Jefe", Data = "what do ya want for nothing?"
    const result = await hmacSha256("Jefe", "what do ya want for nothing?");
    expect(result).toBe(
      "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843",
    );
  });

  it("HMAC-SHA384 with string key", async () => {
    const result = await hmacSha384("Jefe", "what do ya want for nothing?");
    expect(result).toBe(
      "af45d2e376484031617f78d2b58a6b1b9c7ef464f5a01b47e42ec3736322445e8e2240ca5e69e2c78b3239ecfab21649",
    );
  });

  it("HMAC-SHA512 with string key", async () => {
    const result = await hmacSha512("Jefe", "what do ya want for nothing?");
    expect(result).toBe(
      "164b7a7bfcf819e2e395fbe73b56e0a387bd64222e831fd610270cd7ea2505549758bf75c05a994a6d034f65f8f0e6fdcaeab1a34d4a6b4b636e070a38bce737",
    );
  });

  it("HMAC-SHA256 with binary input", async () => {
    const key = new Uint8Array(20).fill(0x0b);
    const data = new TextEncoder().encode("Hi There");
    const result = await hmac("SHA-256", key, data);
    expect(result).toBe(
      "b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7",
    );
  });
});

describe("verify", () => {
  it("returns true for correct MAC", async () => {
    const mac = await hmacSha256("secret", "message");
    const result = await verify("SHA-256", "secret", "message", mac);
    expect(result).toBe(true);
  });

  it("returns false for wrong MAC", async () => {
    const result = await verify("SHA-256", "secret", "message", "0000000000000000000000000000000000000000000000000000000000000000");
    expect(result).toBe(false);
  });

  it("returns false for wrong length", async () => {
    const result = await verify("SHA-256", "secret", "message", "abcd");
    expect(result).toBe(false);
  });
});