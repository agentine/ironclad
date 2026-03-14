# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.1.0] — 2026-03-14

### Added
- `sha256`, `sha384`, `sha512`, `sha1`, `md5`, `digest` — async hashing via Web Crypto API (MD5 via Node.js `crypto.createHash` for Node environments)
- `hmac`, `hmacSha256`, `hmacSha384`, `hmacSha512`, `hmacVerify` — HMAC signing and verification
- `aes.encrypt` / `aes.decrypt` — AES-GCM/CBC/CTR encryption with PBKDF2 key derivation for string keys
- `aes.serialize` / `aes.deserialize` — portable string format for `EncryptedData` objects
- `pbkdf2`, `pbkdf2Default` — PBKDF2 key derivation (defaults: SHA-256, 600K iterations, 32-byte output)
- `hkdf` — HKDF key expansion
- `password.hash` / `password.verify` — secure password hashing with versioned format (`ironclad:v1:...`)
- `toHex` / `fromHex` / `isHex` — hex encoding utilities
- `toBase64` / `fromBase64` / `toBase64Url` / `fromBase64Url` — Base64 and Base64-URL encoding
- `toUtf8Bytes` / `fromUtf8Bytes` — UTF-8 string/byte conversion
- `bytesToWords` / `wordsToBytes` / `wordArrayToString` — crypto-js `WordArray` interop helpers
- `randomBytes` / `randomHex` / `randomBase64` — cryptographically secure random generation via `crypto.getRandomValues`
- `isNode`, `isBrowser`, `isDeno`, `isBun`, `isCloudflareWorker` — runtime platform detection
- Isomorphic support: Node.js 18+ (via `webcrypto` fallback), Node 19+, browsers, Deno, Bun, Cloudflare Workers
- Dual ESM/CJS build with full TypeScript type declarations
- Zero runtime dependencies
