/**
 * SHAKE (SHA-3 extendable-output) hash operations using @noble/hashes.
 */

import { shake128, shake256 } from '@noble/hashes/sha3.js';

/**
 * Compute SHAKE-128 hash with configurable output length.
 * @param {string} input
 * @param {number} outputLength - Output length in bytes (default: 32)
 * @returns {string} Hex string
 */
export function hashShake128(input, outputLength = 32) {
  const data = new TextEncoder().encode(typeof input === 'string' ? input : String(input));
  const hash = shake128(data, { dkLen: outputLength });
  return Array.from(hash)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Compute SHAKE-256 hash with configurable output length.
 * @param {string} input
 * @param {number} outputLength - Output length in bytes (default: 64)
 * @returns {string} Hex string
 */
export function hashShake256(input, outputLength = 64) {
  const data = new TextEncoder().encode(typeof input === 'string' ? input : String(input));
  const hash = shake256(data, { dkLen: outputLength });
  return Array.from(hash)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
