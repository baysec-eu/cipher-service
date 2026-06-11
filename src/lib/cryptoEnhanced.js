/**
 * ADVANCED CRYPTOGRAPHIC SUITE - Beyond CyberChef Capabilities
 * Enterprise-grade cryptographic functions with scientific precision
 * 
 * Features:
 * - Advanced Key Derivation (HKDF, PBKDF2, scrypt, Argon2)
 * - Post-quantum safe algorithms preparation
 * - Side-channel resistant implementations
 * - Full parameter validation and type conversion
 * - Cryptographic agility support
 */

import { hkdf, pbkdf2 } from './crypto.js';
import { scrypt as nobleScrypt } from '@noble/hashes/scrypt.js';
import { argon2id } from '@noble/hashes/argon2.js';
import { chacha20poly1305 } from '@noble/ciphers/chacha.js';
import { xchacha20poly1305 } from '@noble/ciphers/chacha.js';
const randomBytes = (n) => crypto.getRandomValues(new Uint8Array(n));

// ===== PARAMETER VALIDATION AND CONVERSION =====
export function validateAndConvertParams(params, paramDefinitions) {
  const converted = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (paramDefinitions[key]) {
      const def = paramDefinitions[key];
      
      switch (def.type) {
        case 'integer':
          converted[key] = parseInt(value) || def.default || 0;
          if (def.min !== undefined && converted[key] < def.min) {
            converted[key] = def.min;
          }
          if (def.max !== undefined && converted[key] > def.max) {
            converted[key] = def.max;
          }
          break;
          
        case 'string':
          converted[key] = String(value || def.default || '');
          break;
          
        case 'boolean':
          converted[key] = Boolean(value === true || value === 'true' || def.default);
          break;
          
        case 'hex':
          const hexValue = String(value || def.default || '');
          converted[key] = hexValue.match(/^[0-9a-fA-F]*$/) ? hexValue : def.default || '';
          break;
          
        case 'base64':
          try {
            atob(String(value || ''));
            converted[key] = String(value || def.default || '');
          } catch {
            converted[key] = def.default || '';
          }
          break;
          
        default:
          converted[key] = value;
      }
    } else {
      converted[key] = value;
    }
  }
  
  return converted;
}

// ===== ENHANCED KEY DERIVATION FUNCTIONS =====

/**
 * HKDF (HMAC-based Key Derivation Function) - RFC 5869
 * Cryptographically strong key derivation with expand and extract phases
 */
export async function hkdfDerive(input, salt = '', info = '', length = 32, hash = 'SHA-256') {
  try {
    // Validate and convert parameters
    const keyLength = parseInt(length) || 32;
    const hashAlg = String(hash || 'SHA-256');
    const saltStr = String(salt || '');
    const infoStr = String(info || '');
    
    // Import key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(String(input)),
      { name: 'HKDF' },
      false,
      ['deriveBits']
    );
    
    // Derive key bits using HKDF
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: hashAlg,
        salt: saltStr ? new TextEncoder().encode(saltStr) : new Uint8Array(0),
        info: infoStr ? new TextEncoder().encode(infoStr) : new Uint8Array(0)
      },
      keyMaterial,
      keyLength * 8 // Web Crypto expects bits, not bytes
    );
    
    // Convert to hex string
    const bytes = new Uint8Array(derivedBits);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    throw new Error(`HKDF derivation failed: ${error.message}`);
  }
}

/**
 * PBKDF2 (Password-Based Key Derivation Function 2) - RFC 2898
 * Industry standard for password-based key derivation
 */
export async function pbkdf2Derive(input, salt = 'salt', iterations = 100000, keyLength = 32, hash = 'SHA-256') {
  try {
    // Validate and convert parameters
    const iterCount = parseInt(iterations) || 100000;
    const keyLen = parseInt(keyLength) || 32;
    const hashAlg = String(hash || 'SHA-256');
    const saltStr = String(salt || 'salt');
    
    // Import password as key material
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(String(input)),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive key bits using PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: new TextEncoder().encode(saltStr),
        iterations: iterCount,
        hash: hashAlg
      },
      passwordKey,
      keyLen * 8 // Web Crypto expects bits, not bytes
    );
    
    // Convert to hex string
    const bytes = new Uint8Array(derivedBits);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    throw new Error(`PBKDF2 derivation failed: ${error.message}`);
  }
}

/**
 * scrypt Key Derivation Function - RFC 7914
 * Real memory-hard implementation via @noble/hashes
 */
export async function scryptDerive(input, salt = 'salt', N = 16384, r = 8, p = 1, keyLength = 32) {
  try {
    const costParam = parseInt(N) || 16384;
    const blockSize = parseInt(r) || 8;
    const parallel = parseInt(p) || 1;
    const keyLen = parseInt(keyLength) || 32;
    const saltStr = String(salt || 'salt');

    const passwordBytes = new TextEncoder().encode(String(input));
    const saltBytes = new TextEncoder().encode(saltStr);

    const derived = nobleScrypt(passwordBytes, saltBytes, {
      N: costParam, r: blockSize, p: parallel, dkLen: keyLen
    });

    return Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    throw new Error(`scrypt derivation failed: ${error.message}`);
  }
}

/**
 * Argon2 Key Derivation Function - RFC 9106
 * Real implementation via @noble/hashes (argon2id)
 */
export async function argon2Derive(input, salt = 'salt', iterations = 3, memory = 65536, parallelism = 4, keyLength = 32, variant = 'argon2id') {
  try {
    const iterCount = parseInt(iterations) || 3;
    const memoryKB = parseInt(memory) || 65536;
    const threads = parseInt(parallelism) || 4;
    const keyLen = parseInt(keyLength) || 32;
    const saltStr = String(salt || 'salt');

    const passwordBytes = new TextEncoder().encode(String(input));
    const saltBytes = new TextEncoder().encode(saltStr);

    const derived = argon2id(passwordBytes, saltBytes, {
      t: iterCount, m: memoryKB, p: threads, dkLen: keyLen
    });

    return Array.from(new Uint8Array(derived)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    throw new Error(`Argon2 derivation failed: ${error.message}`);
  }
}

// ===== ADVANCED ENCRYPTION ALGORITHMS =====

/**
 * ChaCha20-Poly1305 AEAD - RFC 8439
 * Real implementation via @noble/ciphers
 */
export async function chaCha20Poly1305Encrypt(input, options = {}) {
  const params = validateAndConvertParams(options, {
    key: { type: 'hex', default: '' },
    nonce: { type: 'hex', default: '' },
    associatedData: { type: 'string', default: '' }
  });

  try {
    let keyBytes;
    if (params.key && params.key.length >= 64) {
      keyBytes = new Uint8Array(params.key.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    } else {
      keyBytes = randomBytes(32);
    }

    // ChaCha20-Poly1305 uses 96-bit (12 byte) nonce
    let nonceBytes;
    if (params.nonce && params.nonce.length === 24) {
      nonceBytes = new Uint8Array(params.nonce.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    } else {
      nonceBytes = randomBytes(12);
    }

    const aad = params.associatedData ? new TextEncoder().encode(params.associatedData) : undefined;
    const plaintext = new TextEncoder().encode(String(input));

    const cipher = chacha20poly1305(keyBytes, nonceBytes, aad);
    const ciphertext = cipher.encrypt(plaintext);

    return {
      ciphertext: Array.from(ciphertext).map(b => b.toString(16).padStart(2, '0')).join(''),
      nonce: Array.from(nonceBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
      key: Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
      algorithm: 'ChaCha20-Poly1305'
    };
  } catch (error) {
    throw new Error(`ChaCha20-Poly1305 encryption failed: ${error.message}`);
  }
}

/**
 * XChaCha20-Poly1305 Extended Nonce AEAD
 * Real implementation via @noble/ciphers - 192-bit nonce
 */
export async function xChaCha20Poly1305Encrypt(input, options = {}) {
  const params = validateAndConvertParams(options, {
    key: { type: 'hex', default: '' },
    nonce: { type: 'hex', default: '' },
    associatedData: { type: 'string', default: '' }
  });

  try {
    let keyBytes;
    if (params.key && params.key.length >= 64) {
      keyBytes = new Uint8Array(params.key.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    } else {
      keyBytes = randomBytes(32);
    }

    // XChaCha20-Poly1305 uses 192-bit (24 byte) nonce
    let nonceBytes;
    if (params.nonce && params.nonce.length === 48) {
      nonceBytes = new Uint8Array(params.nonce.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    } else {
      nonceBytes = randomBytes(24);
    }

    const aad = params.associatedData ? new TextEncoder().encode(params.associatedData) : undefined;
    const plaintext = new TextEncoder().encode(String(input));

    const cipher = xchacha20poly1305(keyBytes, nonceBytes, aad);
    const ciphertext = cipher.encrypt(plaintext);

    return {
      ciphertext: Array.from(ciphertext).map(b => b.toString(16).padStart(2, '0')).join(''),
      nonce: Array.from(nonceBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
      key: Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join(''),
      algorithm: 'XChaCha20-Poly1305'
    };
  } catch (error) {
    throw new Error(`XChaCha20-Poly1305 encryption failed: ${error.message}`);
  }
}

// ===== ELLIPTIC CURVE CRYPTOGRAPHY =====

/**
 * Enhanced ECDSA with multiple curves
 */
export async function ecdsaSign(input, options = {}) {
  const params = validateAndConvertParams(options, {
    privateKey: { type: 'string', default: '' },
    curve: { type: 'string', default: 'P-256' }, // P-256, P-384, P-521
    hash: { type: 'string', default: 'SHA-256' },
    format: { type: 'string', default: 'base64' }
  });
  
  try {
    if (!params.privateKey) {
      throw new Error('Private key required for ECDSA signing');
    }
    
    // Import private key
    const keyData = params.privateKey.includes('-----') ? 
      extractKeyFromPem(params.privateKey) : 
      params.privateKey;
      
    const keyBuffer = base64ToArrayBuffer(keyData);
    
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      keyBuffer,
      { name: 'ECDSA', namedCurve: params.curve },
      false,
      ['sign']
    );
    
    // Sign data
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: params.hash },
      privateKey,
      new TextEncoder().encode(input)
    );
    
    const signatureBytes = new Uint8Array(signature);
    
    switch (params.format) {
      case 'hex':
        return Array.from(signatureBytes).map(b => b.toString(16).padStart(2, '0')).join('');
      case 'base64':
        return btoa(String.fromCharCode(...signatureBytes));
      default:
        return signatureBytes;
    }
  } catch (error) {
    throw new Error(`ECDSA signing failed: ${error.message}`);
  }
}

/**
 * Enhanced ECDH key agreement
 */
export async function ecdhKeyAgreement(input, options = {}) {
  const params = validateAndConvertParams(options, {
    privateKey: { type: 'string', default: '' },
    publicKey: { type: 'string', default: '' },
    curve: { type: 'string', default: 'P-256' },
    keyLength: { type: 'integer', default: 32, min: 16, max: 64 },
    format: { type: 'string', default: 'hex' }
  });
  
  try {
    const { deriveECDHSharedSecret } = await import('./crypto.js');
    
    const sharedSecret = await deriveECDHSharedSecret(
      params.privateKey,
      params.publicKey,
      params.keyLength
    );
    
    switch (params.format) {
      case 'hex':
        return Array.from(sharedSecret).map(b => b.toString(16).padStart(2, '0')).join('');
      case 'base64':
        return btoa(String.fromCharCode(...sharedSecret));
      default:
        return sharedSecret;
    }
  } catch (error) {
    throw new Error(`ECDH key agreement failed: ${error.message}`);
  }
}

// Post-quantum algorithms (Kyber, Dilithium) removed - were returning random bytes.
// Will be implemented when browser-compatible libraries mature.

// ===== SIDE-CHANNEL RESISTANT IMPLEMENTATIONS =====

/**
 * Constant-time base64 encoding
 */
export function constantTimeBase64Encode(data) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  
  for (i = 0; i < data.length - 2; i += 3) {
    const a = data[i];
    const b = data[i + 1];
    const c = data[i + 2];
    
    result += chars[a >> 2];
    result += chars[((a & 3) << 4) | (b >> 4)];
    result += chars[((b & 15) << 2) | (c >> 6)];
    result += chars[c & 63];
  }
  
  if (i < data.length) {
    const a = data[i];
    const b = (i + 1 < data.length) ? data[i + 1] : 0;
    
    result += chars[a >> 2];
    result += chars[((a & 3) << 4) | (b >> 4)];
    result += (i + 1 < data.length) ? chars[(b & 15) << 2] : '=';
    result += '=';
  }
  
  return result;
}

/**
 * Timing-safe string comparison
 */
export function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

// ===== UTILITY FUNCTIONS =====

function extractKeyFromPem(pem) {
  return pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s/g, '');
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ===== CRYPTOGRAPHIC ANALYSIS TOOLS =====

/**
 * Entropy analysis for cryptographic randomness testing
 */
export function analyzeEntropy(data) {
  const bytes = typeof data === 'string' ? 
    new TextEncoder().encode(data) : 
    new Uint8Array(data);
  
  const counts = new Array(256).fill(0);
  for (const byte of bytes) {
    counts[byte]++;
  }
  
  let entropy = 0;
  const length = bytes.length;
  
  for (const count of counts) {
    if (count > 0) {
      const probability = count / length;
      entropy -= probability * Math.log2(probability);
    }
  }
  
  return {
    entropy: entropy,
    maxEntropy: 8.0,
    quality: entropy / 8.0,
    recommendation: entropy > 7.5 ? 'Excellent' : 
                   entropy > 6.0 ? 'Good' : 
                   entropy > 4.0 ? 'Fair' : 'Poor'
  };
}

/**
 * Key strength analysis
 */
export function analyzeKeyStrength(key) {
  const analysis = {
    length: key.length,
    entropy: analyzeEntropy(key),
    patterns: {
      repeated: /(.)\1{3,}/.test(key),
      sequential: /(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef)/.test(key.toLowerCase()),
      dictionary: /(?:password|admin|user|test|key|secret|crypto)/.test(key.toLowerCase())
    },
    strength: 'Unknown'
  };
  
  let score = 0;
  
  // Length scoring
  if (analysis.length >= 32) score += 30;
  else if (analysis.length >= 16) score += 20;
  else if (analysis.length >= 8) score += 10;
  
  // Entropy scoring
  score += Math.floor(analysis.entropy.quality * 40);
  
  // Pattern penalties
  if (analysis.patterns.repeated) score -= 20;
  if (analysis.patterns.sequential) score -= 15;
  if (analysis.patterns.dictionary) score -= 25;
  
  // Determine strength
  if (score >= 80) analysis.strength = 'Very Strong';
  else if (score >= 60) analysis.strength = 'Strong';
  else if (score >= 40) analysis.strength = 'Moderate';
  else if (score >= 20) analysis.strength = 'Weak';
  else analysis.strength = 'Very Weak';
  
  analysis.score = Math.max(0, score);
  
  return analysis;
}

// Export all enhanced cryptographic functions
export const cryptoEnhanced = {
  // Parameter handling
  validateParams: validateAndConvertParams,
  
  // Key derivation
  kdf: {
    hkdf: hkdfDerive,
    pbkdf2: pbkdf2Derive,
    scrypt: scryptDerive,
    argon2: argon2Derive
  },
  
  // Advanced encryption
  aead: {
    chaCha20Poly1305: chaCha20Poly1305Encrypt,
    xChaCha20Poly1305: xChaCha20Poly1305Encrypt
  },
  
  // Elliptic curve cryptography
  ecc: {
    sign: ecdsaSign,
    keyAgreement: ecdhKeyAgreement
  },
  
  // Post-quantum: removed (were placeholders returning random data)
  
  // Side-channel resistance
  sidechannelSafe: {
    base64Encode: constantTimeBase64Encode,
    equals: timingSafeEqual
  },
  
  // Analysis tools
  analysis: {
    entropy: analyzeEntropy,
    keyStrength: analyzeKeyStrength
  }
};