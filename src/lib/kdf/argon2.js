// Real Argon2 implementation using @noble/hashes
// RFC 9106 - memory-hard password hashing

import { argon2id, argon2i, argon2d } from '@noble/hashes/argon2.js';

export async function argon2(password, salt, options = {}) {
  const {
    iterations = 3,
    memory = 4096,
    parallelism = 1,
    hashLength = 32,
    type = 'argon2id'
  } = options;

  const passwordBytes = typeof password === 'string' ? new TextEncoder().encode(password) : new Uint8Array(password);
  const saltBytes = salt
    ? (typeof salt === 'string' ? new TextEncoder().encode(salt) : new Uint8Array(salt))
    : crypto.getRandomValues(new Uint8Array(16));

  try {
    const hashFn = type === 'argon2i' ? argon2i : type === 'argon2d' ? argon2d : argon2id;

    const derivedKey = hashFn(passwordBytes, saltBytes, {
      t: iterations,
      m: memory,
      p: parallelism,
      dkLen: hashLength
    });

    const saltB64 = btoa(String.fromCharCode.apply(null, saltBytes)).replace(/=/g, '');
    const hashB64 = btoa(String.fromCharCode.apply(null, derivedKey)).replace(/=/g, '');

    return `$${type}$v=19$m=${memory},t=${iterations},p=${parallelism}$${saltB64}$${hashB64}`;
  } catch (error) {
    throw new Error(`Argon2 derivation failed: ${error.message}`);
  }
}

export async function argon2Raw(password, salt, iterations = 3, memory = 4096, parallelism = 1, hashLength = 32) {
  const passwordBytes = typeof password === 'string' ? new TextEncoder().encode(password) : new Uint8Array(password);
  const saltBytes = salt
    ? (typeof salt === 'string' ? new TextEncoder().encode(salt) : new Uint8Array(salt))
    : crypto.getRandomValues(new Uint8Array(16));

  return argon2id(passwordBytes, saltBytes, {
    t: iterations,
    m: memory,
    p: parallelism,
    dkLen: hashLength
  });
}
