import {customMd5Bytes} from "./hashCustomMd5.js";

export function scryptHash(password, salt = null, N = 16384, r = 8, p = 1) {
  console.warn('Simplified scrypt implementation - use proper scrypt library for production');
  
  if (!salt) {
    salt = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt);
  }
  
  // Simplified PBKDF2-like derivation
  let derived = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < Math.min(N / 1000, 1000); i++) {
    const input = Array.from(derived).map(b => String.fromCharCode(b)).join('') + saltStr + i;
    derived = customMd5Bytes(new TextEncoder().encode(input));
  }
  
  return Array.from(derived).map(b => b.toString(16).padStart(2, '0')).join('');
}