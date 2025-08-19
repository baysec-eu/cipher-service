import { rc4Encrypt } from './rc4Encrypt.js';
import { aesEncryptGCM, aesEncryptCTS } from './aesEnhanced.js';
import { hmacMd5 } from '../hashing/hmacMd5.js';

// Kerberos encryption implementation supporting multiple encryption types
// Based on RFC 3961, RFC 3962, RFC 4757
export async function kerberosEncrypt(data, key, keyType = 'RC4', keyUsage = 0) {
  const encType = keyType.toUpperCase();
  
  switch (encType) {
    case 'RC4':
    case 'RC4-HMAC':
    case 'ARCFOUR-HMAC':
    case 'ETYPE-23':
      return await kerberosRC4Encrypt(data, key, keyUsage);
      
    case 'AES128':
    case 'AES128-CTS':
    case 'AES128-CTS-HMAC-SHA1-96':
    case 'ETYPE-17':
      return await kerberosAESEncrypt(data, key, 128, keyUsage);
      
    case 'AES256':
    case 'AES256-CTS':
    case 'AES256-CTS-HMAC-SHA1-96':
    case 'ETYPE-18':
      return await kerberosAESEncrypt(data, key, 256, keyUsage);
      
    case 'DES':
    case 'DES-CBC-CRC':
    case 'ETYPE-1':
    case 'DES-CBC-MD5':
    case 'ETYPE-3':
      throw new Error('DES encryption types are deprecated and not supported');
      
    default:
      throw new Error(`Unsupported Kerberos encryption type: ${keyType}`);
  }
}

// RC4-HMAC encryption (etype 23)
async function kerberosRC4Encrypt(data, key, keyUsage) {
  // Convert inputs to bytes
  const dataBytes = typeof data === 'string' 
    ? new TextEncoder().encode(data)
    : new Uint8Array(data);
    
  const keyBytes = typeof key === 'string'
    ? new Uint8Array(key.match(/.{2}/g).map(byte => parseInt(byte, 16)))
    : new Uint8Array(key);
  
  // Generate confounder (8 random bytes)
  const confounder = new Uint8Array(8);
  crypto.getRandomValues(confounder);
  
  // Concatenate confounder and data
  const plaintext = new Uint8Array(confounder.length + dataBytes.length);
  plaintext.set(confounder);
  plaintext.set(dataBytes, confounder.length);
  
  // Derive checksum key
  // K1 = HMAC-MD5(key, keyUsage)
  const keyUsageBytes = new Uint8Array(4);
  new DataView(keyUsageBytes.buffer).setUint32(0, keyUsage, true);
  
  const k1 = await hmacMd5(keyBytes, keyUsageBytes);
  const k1Bytes = new Uint8Array(k1.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // Calculate checksum: HMAC-MD5(K1, plaintext)
  const checksum = await hmacMd5(k1Bytes, plaintext);
  const checksumBytes = new Uint8Array(checksum.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // Derive encryption key
  // K2 = HMAC-MD5(key, checksum)
  const k2 = await hmacMd5(keyBytes, checksumBytes);
  const k2Bytes = new Uint8Array(k2.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // Encrypt with RC4
  const ciphertext = rc4Encrypt(plaintext, k2Bytes);
  
  // Combine checksum and ciphertext
  return checksum + ciphertext;
}

// AES-CTS encryption (etype 17/18)
async function kerberosAESEncrypt(data, key, keySize, keyUsage) {
  // Convert inputs to bytes
  const dataBytes = typeof data === 'string' 
    ? new TextEncoder().encode(data)
    : new Uint8Array(data);
    
  const keyBytes = typeof key === 'string'
    ? new Uint8Array(key.match(/.{2}/g).map(byte => parseInt(byte, 16)))
    : new Uint8Array(key);
  
  // Generate confounder (16 random bytes for AES)
  const confounder = new Uint8Array(16);
  crypto.getRandomValues(confounder);
  
  // Concatenate confounder and data
  const plaintext = new Uint8Array(confounder.length + dataBytes.length);
  plaintext.set(confounder);
  plaintext.set(dataBytes, confounder.length);
  
  // Derive keys using key derivation function
  const { ke, ki } = await deriveAESKeys(keyBytes, keyUsage, keySize);
  
  // Encrypt with AES-CTS
  const ciphertext = await aesEncryptCTS(plaintext, ke);
  
  // Calculate HMAC-SHA1-96 checksum over ciphertext
  const checksum = await calculateHMACSHA196(ki, ciphertext);
  
  // Combine ciphertext and checksum
  const result = new Uint8Array(ciphertext.length + checksum.length);
  result.set(ciphertext);
  result.set(checksum, ciphertext.length);
  
  // Return as hex string
  return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Derive AES encryption and integrity keys
async function deriveAESKeys(baseKey, keyUsage, keySize) {
  // Simplified key derivation for AES (RFC 3962)
  const usageBytes = new Uint8Array(5);
  new DataView(usageBytes.buffer).setUint32(0, keyUsage, false);
  usageBytes[4] = 0x99; // Encryption key constant
  
  // Derive encryption key
  const keData = new Uint8Array(baseKey.length + usageBytes.length);
  keData.set(baseKey);
  keData.set(usageBytes, baseKey.length);
  
  const keHash = await crypto.subtle.digest('SHA-1', keData);
  const ke = new Uint8Array(keHash).slice(0, keySize / 8);
  
  // Derive integrity key
  usageBytes[4] = 0x55; // Integrity key constant
  const kiData = new Uint8Array(baseKey.length + usageBytes.length);
  kiData.set(baseKey);
  kiData.set(usageBytes, baseKey.length);
  
  const kiHash = await crypto.subtle.digest('SHA-1', kiData);
  const ki = new Uint8Array(kiHash).slice(0, keySize / 8);
  
  return { ke, ki };
}

// Calculate HMAC-SHA1-96 (first 96 bits of HMAC-SHA1)
async function calculateHMACSHA196(key, data) {
  const keyObj = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', keyObj, data);
  return new Uint8Array(signature).slice(0, 12); // First 96 bits
}