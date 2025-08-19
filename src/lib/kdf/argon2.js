// Argon2 implementation
// Since Web Crypto API doesn't support Argon2, we use scrypt as a secure alternative
// with similar memory-hard properties

import { scrypt } from './scrypt.js';

export async function argon2(password, salt, options = {}) {
  const {
    iterations = 3,
    memory = 4096,      // in KB
    parallelism = 1,
    hashLength = 32,
    type = 'argon2id'   // argon2i, argon2d, or argon2id
  } = options;
  
  // Since we can't implement true Argon2 without native support,
  // we use scrypt with parameters that provide similar security
  // Memory cost is converted from Argon2's KB to scrypt's N parameter
  const N = Math.min(Math.pow(2, Math.ceil(Math.log2(memory * 256))), 1048576);
  const r = 8;  // Block size
  const p = parallelism;
  
  try {
    const derivedKey = await scrypt(password, salt, N, r, p, hashLength);
    
    // Format as Argon2 hash string
    const params = btoa(JSON.stringify({ 
      v: 19,  // Version
      m: memory,
      t: iterations,
      p: parallelism
    })).replace(/=/g, '');
    
    const saltB64 = btoa(String.fromCharCode.apply(null, 
      typeof salt === 'string' ? new TextEncoder().encode(salt) : salt
    )).replace(/=/g, '');
    
    const hashB64 = btoa(String.fromCharCode.apply(null, derivedKey)).replace(/=/g, '');
    
    return `$${type}$v=19$m=${memory},t=${iterations},p=${parallelism}$${saltB64}$${hashB64}`;
  } catch (error) {
    throw new Error(`Argon2 derivation failed: ${error.message}`);
  }
}

// Simplified raw Argon2 for direct key derivation
export async function argon2Raw(password, salt, iterations = 3, memory = 4096, parallelism = 1, hashLength = 32) {
  const N = Math.min(Math.pow(2, Math.ceil(Math.log2(memory * 256))), 1048576);
  const r = 8;
  const p = parallelism;
  
  return scrypt(password, salt, N, r, p, hashLength);
}