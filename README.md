# Cipher Service v0.3.4-beta

Browser-based cryptographic operations suite. 434 operations, 45+ categories. No backend, no HTTP requests - runs entirely in the browser.

## Quick Start

```bash
npm install
npm run dev
```

```bash
npm run build
npm run preview
```

## Operations

### Ciphers
- AES (GCM, CBC, CTR), ChaCha20-Poly1305, XChaCha20-Poly1305, Salsa20, XSalsa20
- DES, 3DES, Blowfish, RC4, Kerberos
- RSA, ECDSA sign/verify, ECDH key agreement
- Classical: Vigenere, Playfair, Rail Fence, Beaufort, Four Square, Bifid, Atbash, Bacon, A1Z26, ROT13/47
- International variants: Polish, German, French, Spanish, Turkish, Cyrillic, Greek

### Hashing
- SHA3-224/256/384/512, Keccak-224/256/384/512
- BLAKE2b, BLAKE2s, BLAKE3
- SHAKE-128, SHAKE-256
- RIPEMD-160, MD4, MD5, SHA-1, SHA-256/384/512
- HMAC variants, CRC-8/16/32, Adler-32, Fletcher-16
- NTLM, NTLMv1/v2, NetNTLMv1/v2, MySQL, PostgreSQL, Oracle, MSSQL, LM, MS-Cache
- Kerberos 5 TGS-REP/AS-REQ, WPA, Cisco ASA/IOS, DES Crypt, SHA512 Crypt

### Key Derivation
- scrypt (RFC 7914), Argon2 id/i/d (RFC 9106), bcrypt, HKDF, PBKDF2

### Encoding
- Base16/32/36/58/62/64/85/91, BaseX custom alphabet
- URL encode (single/double/triple), Punycode IDN
- UTF-8/16LE/16BE/32LE/32BE
- ASCII85, UUencode, yEnc, Quoted Printable
- ASN.1 DER, Bencode, MessagePack, CBOR, BSON, Plist, AMF0/AMF3, Avro
- HTML entities, XML, JavaScript/PHP/PowerShell/SQL/Python string encoding
- Morse, Braille, NATO Phonetic, Tap Code
- Unicode escape, Zalgo, homoglyphs, invisible unicode, RTL/LTR override
- Mathematical Unicode (Python sandbox bypass)
- Xxd hexdump

### Security / Pentesting
- XSS Payload Encode - 19 bypass variants
- SQLi Payload Encode - 15 variants (MySQL/MSSQL/Oracle/PostgreSQL)
- Command Injection Encode - 18 variants
- SSRF Payload Generator - IP encoding, cloud metadata, protocol smuggling
- Reverse Shell Generator - 25+ one-liners (bash, python, perl, php, ruby, nc, socat, powershell, etc.)
- JWT decode/sign/verify (HS256/384/512)
- TOTP/HOTP (RFC 6238/4226)
- Defang/Refang URLs and IPs
- HTTP header security analysis, cookie parser, URL parser
- HTTP Basic Auth encode/decode, CSRF token generator

### Phishing Assessment
- Domain Permutation Fuzzer - 13 mutation methods (ported from [phishlookup](https://github.com/krystianbajno/phishlookup))
- Homoglyph Domain Generator - Cyrillic/Unicode lookalikes with punycode
- Email Header Parser - SPF/DKIM/DMARC analysis, route tracing, phishing indicators

### Shellcode / Binary
- Format conversion (15 formats: C, Python, PowerShell, C#, Ruby, NASM, Base64, UUID stager, msfvenom, etc.)
- XOR encode with x86 decoder stub and bad char avoidance
- Analysis: entropy, bad chars, pattern detection, byte frequency
- NOP sled generator (x86/x64/ARM)
- Metasploit cyclic pattern create/offset (up to 20,280 bytes)
- Alphanumeric encoding, string extraction

### Text Processing
- grep, sed, cut, awk, tr, wc, tac, rev, fold, nl, colrm, paste, expand/unexpand
- Regex extract, join/split lines, squeeze blanks, strip whitespace

### String Operations
- Find/replace, pad, truncate, repeat, substring
- Case conversion (upper, lower, title, camelCase, snake_case, kebab-case)
- Entropy, Hamming distance, Luhn checksum, frequency analysis
- Endianness swap, file type detection (45+ magic byte signatures)

### Flow Control
- Fork/Merge, Filter, Sort, Unique, Head/Tail, Take/Drop, Reverse

### PRNG
- CSPRNG, Mersenne Twister, LCG, xorshift128+, HMAC-DRBG

### Compression
- gzip, deflate, ZSTD, LZ-String, RLE, ZIP

### Data Formats
- JSON/XML/YAML/CSV/TSV beautify/minify, JavaScript beautify/minify, xxd hexdump

### Arithmetic & Bitwise
- XOR, AND, OR, NOT, shift, rotate, ADD/SUB, XOR brute force

### Password Cracking
- Dictionary attack with Hashcat-compatible rules, 7z/ZIP/PDF cracking, hash auto-detection

## Architecture

- React + Vite SPA, zero backend
- Recipe builder - chain operations into pipelines, import/export as JSON
- Graph view - visual node-based data flow with parameter port routing
- Up to 500MB input, binary round-trip (upload → hex → process → download)

## Crypto Libraries

| Library | Usage | Status |
|---------|-------|--------|
| `@noble/hashes` | SHA3, Keccak, BLAKE2/3, RIPEMD-160, scrypt, Argon2, SHAKE | Audited |
| `@noble/ciphers` | ChaCha20-Poly1305, XChaCha20, Salsa20, XSalsa20 | Audited |
| `bcryptjs` | bcrypt | Stable |
| `pako` | gzip/deflate | Stable |
| `fzstd` | ZSTD decompression | Stable |
| Web Crypto API | AES, RSA, ECDSA, ECDH, PBKDF2, HKDF | Browser-native |

## License

MIT
