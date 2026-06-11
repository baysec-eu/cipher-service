// SHA3, Keccak, BLAKE2, BLAKE3, RIPEMD-160 via @noble/hashes

import { sha3_224, sha3_256, sha3_384, sha3_512 } from '@noble/hashes/sha3.js';
import { keccak_224, keccak_256, keccak_384, keccak_512 } from '@noble/hashes/sha3.js';
import { blake2b, blake2s } from '@noble/hashes/blake2.js';
import { blake3 } from '@noble/hashes/blake3.js';
import { ripemd160 } from '@noble/hashes/legacy.js';

function toHex(hash) {
  return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
}

function encode(input) {
  return new TextEncoder().encode(typeof input === 'string' ? input : String(input));
}

export function hashSha3_224(input) { return toHex(sha3_224(encode(input))); }
export function hashSha3_256(input) { return toHex(sha3_256(encode(input))); }
export function hashSha3_384(input) { return toHex(sha3_384(encode(input))); }
export function hashSha3_512(input) { return toHex(sha3_512(encode(input))); }

export function hashKeccak224(input) { return toHex(keccak_224(encode(input))); }
export function hashKeccak256(input) { return toHex(keccak_256(encode(input))); }
export function hashKeccak384(input) { return toHex(keccak_384(encode(input))); }
export function hashKeccak512(input) { return toHex(keccak_512(encode(input))); }

export function hashBlake2b(input, length = 64) {
  const len = parseInt(length) || 64;
  return toHex(blake2b(encode(input), { dkLen: Math.min(Math.max(len, 1), 64) }));
}

export function hashBlake2s(input, length = 32) {
  const len = parseInt(length) || 32;
  return toHex(blake2s(encode(input), { dkLen: Math.min(Math.max(len, 1), 32) }));
}

export function hashBlake3(input, length = 32) {
  const len = parseInt(length) || 32;
  return toHex(blake3(encode(input), { dkLen: len }));
}

export function hashRipemd160(input) { return toHex(ripemd160(encode(input))); }
