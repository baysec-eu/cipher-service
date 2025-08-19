import { rc4Encrypt } from './rc4Encrypt.js';

export function rc4Decrypt(ciphertext, key) {
  // RC4 is symmetric, so decryption is the same as encryption
  const ciphertextBytes = new Uint8Array(ciphertext.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  const ciphertextString = Array.from(ciphertextBytes).map(b => String.fromCharCode(b)).join('');
  const decryptedHex = rc4Encrypt(ciphertextString, key);
  const decryptedBytes = new Uint8Array(decryptedHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  return new TextDecoder().decode(decryptedBytes);
}