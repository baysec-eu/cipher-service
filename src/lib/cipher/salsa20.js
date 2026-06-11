// Salsa20 and XSalsa20 stream cipher via @noble/ciphers
// API: salsa20(key, nonce, data) -> Uint8Array (direct function, not object)

import { salsa20, xsalsa20 } from '@noble/ciphers/salsa.js';

function hexToBytes(hex) {
  const clean = hex.replace(/\s/g, '');
  return new Uint8Array(clean.match(/.{1,2}/g).map(b => parseInt(b, 16)));
}

function bytesToHex(bytes) {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function salsa20Encrypt(input, key = '', nonce = '') {
  const plaintext = new TextEncoder().encode(String(input));

  let keyBytes;
  if (key && key.length >= 64) {
    keyBytes = hexToBytes(key);
  } else {
    keyBytes = crypto.getRandomValues(new Uint8Array(32));
  }

  let nonceBytes;
  if (nonce && nonce.length >= 16) {
    nonceBytes = hexToBytes(nonce);
  } else {
    nonceBytes = crypto.getRandomValues(new Uint8Array(8));
  }

  const ciphertext = salsa20(keyBytes, nonceBytes, plaintext);

  return [
    `Algorithm: Salsa20`,
    `Key: ${bytesToHex(keyBytes)}`,
    `Nonce: ${bytesToHex(nonceBytes)}`,
    `Ciphertext: ${bytesToHex(ciphertext)}`
  ].join('\n');
}

export function salsa20Decrypt(input, key = '', nonce = '') {
  if (!key || !nonce) return 'Error: Key and nonce required for decryption';

  let ciphertextHex = input.trim();
  const ctMatch = input.match(/Ciphertext:\s*([0-9a-fA-F]+)/);
  if (ctMatch) ciphertextHex = ctMatch[1];

  const keyBytes = hexToBytes(key);
  const nonceBytes = hexToBytes(nonce);
  const ciphertext = hexToBytes(ciphertextHex);

  // Salsa20 is symmetric - encrypt and decrypt are the same XOR operation
  const plaintext = salsa20(keyBytes, nonceBytes, ciphertext);

  return new TextDecoder().decode(plaintext);
}

export function xsalsa20Encrypt(input, key = '', nonce = '') {
  const plaintext = new TextEncoder().encode(String(input));

  let keyBytes;
  if (key && key.length >= 64) {
    keyBytes = hexToBytes(key);
  } else {
    keyBytes = crypto.getRandomValues(new Uint8Array(32));
  }

  let nonceBytes;
  if (nonce && nonce.length >= 48) {
    nonceBytes = hexToBytes(nonce);
  } else {
    nonceBytes = crypto.getRandomValues(new Uint8Array(24));
  }

  const ciphertext = xsalsa20(keyBytes, nonceBytes, plaintext);

  return [
    `Algorithm: XSalsa20`,
    `Key: ${bytesToHex(keyBytes)}`,
    `Nonce: ${bytesToHex(nonceBytes)}`,
    `Ciphertext: ${bytesToHex(ciphertext)}`
  ].join('\n');
}

export function xsalsa20Decrypt(input, key = '', nonce = '') {
  if (!key || !nonce) return 'Error: Key and nonce required for decryption';

  let ciphertextHex = input.trim();
  const ctMatch = input.match(/Ciphertext:\s*([0-9a-fA-F]+)/);
  if (ctMatch) ciphertextHex = ctMatch[1];

  const keyBytes = hexToBytes(key);
  const nonceBytes = hexToBytes(nonce);
  const ciphertext = hexToBytes(ciphertextHex);

  const plaintext = xsalsa20(keyBytes, nonceBytes, ciphertext);

  return new TextDecoder().decode(plaintext);
}
