// HMAC-MD5 implementation
// Based on RFC 2104 specification

import { hashMd5 } from './hashMd5.js';

export async function hmacMd5(key, message) {
  const blockSize = 64; // MD5 block size in bytes
  
  // Convert key and message to bytes
  const keyBytes = typeof key === 'string' ? new TextEncoder().encode(key) : new Uint8Array(key);
  const messageBytes = typeof message === 'string' ? new TextEncoder().encode(message) : new Uint8Array(message);
  
  // If key is longer than block size, hash it
  let processedKey = keyBytes;
  if (keyBytes.length > blockSize) {
    const hashedKey = await hashMd5(keyBytes);
    processedKey = new Uint8Array(hashedKey.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  }
  
  // Pad key to block size
  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(processedKey.slice(0, blockSize));
  
  // Create inner and outer padded keys
  const iKeyPad = new Uint8Array(blockSize);
  const oKeyPad = new Uint8Array(blockSize);
  
  for (let i = 0; i < blockSize; i++) {
    iKeyPad[i] = paddedKey[i] ^ 0x36; // Inner pad
    oKeyPad[i] = paddedKey[i] ^ 0x5c; // Outer pad
  }
  
  // Compute inner hash: H(K XOR ipad || message)
  const innerInput = new Uint8Array(iKeyPad.length + messageBytes.length);
  innerInput.set(iKeyPad);
  innerInput.set(messageBytes, iKeyPad.length);
  
  const innerHash = await hashMd5(innerInput);
  const innerHashBytes = new Uint8Array(innerHash.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // Compute outer hash: H(K XOR opad || inner_hash)
  const outerInput = new Uint8Array(oKeyPad.length + innerHashBytes.length);
  outerInput.set(oKeyPad);
  outerInput.set(innerHashBytes, oKeyPad.length);
  
  return await hashMd5(outerInput);
}

// Convenience function for string inputs
export async function hmacMd5String(key, message) {
  return hmacMd5(key, message);
}

// Function to return HMAC as bytes
export async function hmacMd5Bytes(key, message) {
  const hex = await hmacMd5(key, message);
  return new Uint8Array(hex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
}