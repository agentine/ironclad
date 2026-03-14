import { describe, it, expect } from "vitest";
import { sha256, sha384, sha512, sha1, md5, digest } from "../src/hash.js";

describe("sha256", () => {
  it("hashes empty string (NIST)", async () => {
    expect(await sha256("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });

  it("hashes 'abc' (NIST)", async () => {
    expect(await sha256("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("hashes binary input", async () => {
    const data = new Uint8Array([0x61, 0x62, 0x63]); // "abc"
    expect(await sha256(data)).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});

describe("sha384", () => {
  it("hashes empty string", async () => {
    expect(await sha384("")).toBe(
      "38b060a751ac96384cd9327eb1b1e36a21fdb71114be07434c0cc7bf63f6e1da274edebfe76f65fbd51ad2f14898b95b",
    );
  });
});

describe("sha512", () => {
  it("hashes empty string (NIST)", async () => {
    expect(await sha512("")).toBe(
      "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
    );
  });

  it("hashes 'abc' (NIST)", async () => {
    expect(await sha512("abc")).toBe(
      "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f",
    );
  });
});

describe("sha1", () => {
  it("hashes 'abc'", async () => {
    expect(await sha1("abc")).toBe(
      "a9993e364706816aba3e25717850c26c9cd0d89d",
    );
  });
});

describe("md5", () => {
  it("hashes empty string", async () => {
    expect(await md5("")).toBe("d41d8cd98f00b204e9800998ecf8427e");
  });

  it("hashes 'abc'", async () => {
    expect(await md5("abc")).toBe("900150983cd24fb0d6963f7d28e17f72");
  });

  it("hashes 'The quick brown fox jumps over the lazy dog'", async () => {
    expect(await md5("The quick brown fox jumps over the lazy dog")).toBe(
      "9e107d9d372bb6826bd81d3542a419d6",
    );
  });
});

describe("digest", () => {
  it("accepts algorithm parameter", async () => {
    expect(await digest("SHA-256", "abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });
});