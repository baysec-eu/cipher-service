// Real scrypt implementation using @noble/hashes
// RFC 7914 - memory-hard key derivation function

import { scrypt as nobleScrypt } from '@noble/hashes/scrypt.js';

const cryptoAPI = globalThis.crypto || (typeof window !== 'undefined' ? window.crypto : null);

export async function scrypt(password, salt, N = 16384, r = 8, p = 1, dkLen = 32) {
  // Validate parameters
  if (N < 2 || (N & (N - 1)) !== 0) {
    throw new Error('N must be a power of 2 greater than 1');
  }
  if (r < 1 || p < 1) {
    throw new Error('r and p must be positive integers');
  }

  try {
    const passwordBytes = typeof password === 'string' ? new TextEncoder().encode(password) : new Uint8Array(password);
    const saltBytes = salt
      ? (typeof salt === 'string' ? new TextEncoder().encode(salt) : new Uint8Array(salt))
      : cryptoAPI.getRandomValues(new Uint8Array(32));

    const derived = nobleScrypt(passwordBytes, saltBytes, { N, r, p, dkLen });
    return new Uint8Array(derived);
  } catch (error) {
    throw new Error(`Scrypt derivation failed: ${error.message}`);
  }
}

// Scrypt password hashing with MCF format output
export async function scryptHash(password, salt = null, N = 16384, r = 8, p = 1, dkLen = 32) {
  if (!salt) {
    salt = cryptoAPI.getRandomValues(new Uint8Array(16));
  }
  const saltBytes = typeof salt === 'string' ? new TextEncoder().encode(salt) : new Uint8Array(salt);

  const derivedKey = await scrypt(password, saltBytes, N, r, p, dkLen);

  const logN = Math.log2(N);
  const params = encodeScryptParams(logN, r, p);

  const saltB64 = btoa(String.fromCharCode.apply(null, saltBytes))
    .replace(/\+/g, '.')
    .replace(/=/g, '');

  const hashB64 = btoa(String.fromCharCode.apply(null, derivedKey))
    .replace(/\+/g, '.')
    .replace(/=/g, '');

  return `$7$${params}$${saltB64}$${hashB64}`;
}

function encodeScryptParams(logN, r, p) {
  if (logN > 63) throw new Error('LogN too large');
  const params = new Uint8Array(2);
  params[0] = (logN << 2) | ((r >> 3) & 0x03);
  params[1] = ((r & 0x07) << 5) | (p & 0x1f);
  return btoa(String.fromCharCode.apply(null, params))
    .replace(/\+/g, '.')
    .replace(/=/g, '');
}

export function decodeScryptParams(encoded) {
  const decoded = atob(encoded.replace(/\./g, '+'));
  const params = new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
  const logN = params[0] >> 2;
  const r = ((params[0] & 0x03) << 3) | (params[1] >> 5);
  const p = params[1] & 0x1f;
  return { N: Math.pow(2, logN), r, p };
}
