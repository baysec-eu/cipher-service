import { hashMd4 } from './hashMd4.js';

export function hashNtlm(password) {
  // Convert password to UTF-16LE (little-endian)
  const utf16Buffer = new ArrayBuffer(password.length * 2);
  const utf16View = new Uint16Array(utf16Buffer);
  
  for (let i = 0; i < password.length; i++) {
    utf16View[i] = password.charCodeAt(i);
  }
  
  // Calculate MD4 hash of UTF-16LE password
  return hashMd4(new Uint8Array(utf16Buffer));
}