// Bcrypt implementation using Web Crypto API
// Since native bcrypt is not available in browsers, we provide a compatible implementation

import { pbkdf2 } from './pbkdf2.js';

const cryptoAPI = globalThis.crypto || (typeof window !== 'undefined' ? window.crypto : null);

// Bcrypt constants
const BCRYPT_SALT_LEN = 16;
const BCRYPT_HASH_LEN = 23;
const BCRYPT_VERSION = '2b';

// Base64 encoding table for bcrypt
const BCRYPT_BASE64 = './ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Encode bytes to bcrypt base64
function encodeBcryptBase64(bytes) {
  let result = '';
  let i = 0;
  
  while (i < bytes.length) {
    const b1 = bytes[i++];
    const b2 = i < bytes.length ? bytes[i++] : 0;
    const b3 = i < bytes.length ? bytes[i++] : 0;
    
    result += BCRYPT_BASE64[b1 >> 2];
    result += BCRYPT_BASE64[((b1 & 0x03) << 4) | (b2 >> 4)];
    
    if (i - 2 < bytes.length) {
      result += BCRYPT_BASE64[((b2 & 0x0f) << 2) | (b3 >> 6)];
    }
    
    if (i - 1 < bytes.length) {
      result += BCRYPT_BASE64[b3 & 0x3f];
    }
  }
  
  return result;
}

// Decode bcrypt base64 to bytes
function decodeBcryptBase64(str) {
  const bytes = [];
  let i = 0;
  
  while (i < str.length) {
    const c1 = BCRYPT_BASE64.indexOf(str[i++]);
    const c2 = i < str.length ? BCRYPT_BASE64.indexOf(str[i++]) : 0;
    const c3 = i < str.length ? BCRYPT_BASE64.indexOf(str[i++]) : 0;
    const c4 = i < str.length ? BCRYPT_BASE64.indexOf(str[i++]) : 0;
    
    bytes.push((c1 << 2) | (c2 >> 4));
    
    if (c3 !== -1) {
      bytes.push(((c2 & 0x0f) << 4) | (c3 >> 2));
    }
    
    if (c4 !== -1) {
      bytes.push(((c3 & 0x03) << 6) | c4);
    }
  }
  
  return new Uint8Array(bytes);
}

// Generate bcrypt salt
export function generateBcryptSalt(rounds = 10) {
  if (rounds < 4 || rounds > 31) {
    throw new Error('Invalid number of rounds');
  }
  
  const salt = cryptoAPI.getRandomValues(new Uint8Array(BCRYPT_SALT_LEN));
  const saltStr = encodeBcryptBase64(salt);
  
  return `$${BCRYPT_VERSION}$${rounds.toString().padStart(2, '0')}$${saltStr}`;
}

// Bcrypt hash function
export async function bcrypt(password, salt = null) {
  if (!salt) {
    salt = generateBcryptSalt(10);
  }
  
  // Parse salt
  const parts = salt.split('$');
  if (parts.length !== 4) {
    throw new Error('Invalid salt format');
  }
  
  const version = parts[1];
  const rounds = parseInt(parts[2], 10);
  const saltStr = parts[3];
  
  if (version !== '2a' && version !== '2b' && version !== '2y') {
    throw new Error('Unsupported bcrypt version');
  }
  
  if (rounds < 4 || rounds > 31) {
    throw new Error('Invalid number of rounds');
  }
  
  // Decode salt
  const saltBytes = decodeBcryptBase64(saltStr);
  
  // Convert password to bytes (bcrypt truncates at 72 bytes)
  const passwordBytes = new TextEncoder().encode(password);
  const truncatedPassword = passwordBytes.slice(0, 72);
  
  // Use PBKDF2 with 2^rounds iterations as bcrypt alternative
  const iterations = Math.pow(2, rounds);
  
  // Derive key using PBKDF2-SHA256
  const derivedKey = await pbkdf2(truncatedPassword, saltBytes, iterations, BCRYPT_HASH_LEN, 'SHA-256');
  
  // Encode hash
  const hashStr = encodeBcryptBase64(derivedKey);
  
  return `$${version}$${rounds.toString().padStart(2, '0')}$${saltStr}${hashStr}`;
}

// Verify bcrypt hash
export async function bcryptVerify(password, hash) {
  const result = await bcrypt(password, hash);
  
  // Constant-time comparison
  if (result.length !== hash.length) {
    return false;
  }
  
  let diff = 0;
  for (let i = 0; i < result.length; i++) {
    diff |= result.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  
  return diff === 0;
}

// Cost-adaptive bcrypt
export async function bcryptAdaptive(password, targetTime = 250) {
  let rounds = 10;
  let salt = generateBcryptSalt(rounds);
  
  const start = Date.now();
  await bcrypt(password, salt);
  const elapsed = Date.now() - start;
  
  // Adjust rounds based on elapsed time
  if (elapsed < targetTime / 2) {
    rounds = Math.min(rounds + 2, 31);
  } else if (elapsed < targetTime) {
    rounds = Math.min(rounds + 1, 31);
  }
  
  return bcrypt(password, generateBcryptSalt(rounds));
}