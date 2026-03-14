import { describe, it, expect } from "vitest";
import { password } from "../src/index.js";

describe("password", () => {
  it("hash/verify round-trip", async () => {
    const hashed = await password.hash("my-secret-password");
    expect(hashed.startsWith("ironclad:v1:600000:")).toBe(true);
    const valid = await password.verify("my-secret-password", hashed);
    expect(valid).toBe(true);
  }, 15000);

  it("wrong password returns false", async () => {
    const hashed = await password.hash("correct-password");
    const valid = await password.verify("wrong-password", hashed);
    expect(valid).toBe(false);
  }, 15000);

  it("invalid hash format returns false", async () => {
    expect(await password.verify("pass", "invalid:format")).toBe(false);
    expect(await password.verify("pass", "")).toBe(false);
    expect(await password.verify("pass", "ironclad:v2:100:abc:def")).toBe(false);
  });

  it("each hash is unique (random salt)", async () => {
    const h1 = await password.hash("same-password");
    const h2 = await password.hash("same-password");
    expect(h1).not.toBe(h2);
    // But both verify correctly
    expect(await password.verify("same-password", h1)).toBe(true);
    expect(await password.verify("same-password", h2)).toBe(true);
  }, 30000);
});