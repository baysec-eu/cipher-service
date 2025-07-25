import {customMd5Bytes} from "./hashCustomMd5"

export function hashApr1Md5(password, salt = null) {
  console.warn('Simplified APR1-MD5 implementation - use proper crypt library for production');
  
  if (!salt) {
    salt = Array.from({ length: 8 }, () => Math.floor(Math.random() * 64));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt).slice(0, 8);
  }
  
  let hash = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < 1000; i++) {
    const input = Array.from(hash).map(b => String.fromCharCode(b)).join('') + saltStr + password;
    hash = customMd5Bytes(new TextEncoder().encode(input));
  }
  
  const saltB64 = btoa(saltStr).replace(/=/g, '');
  const hashB64 = btoa(Array.from(hash).map(b => String.fromCharCode(b)).join('')).replace(/=/g, '');
  
  return `$apr1$${saltB64}$${hashB64}`;
}