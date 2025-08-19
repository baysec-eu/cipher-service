import { rc4Decrypt } from './rc4Decrypt.js';
import { aesDecryptGCM, aesDecryptCTS } from './aesEnhanced.js';
import { hmacMd5 } from '../hashing/hmacMd5.js';
import { hashSha1 } from '../hashing/hashSha1.js';

// Kerberos decryption implementation supporting multiple encryption types
// Based on RFC 3961, RFC 3962, RFC 4757
export async function kerberosDecrypt(encryptedData, key, keyType = 'RC4', keyUsage = 0) {
  const encType = keyType.toUpperCase();
  
  switch (encType) {
    case 'RC4':
    case 'RC4-HMAC':
    case 'ARCFOUR-HMAC':
    case 'ETYPE-23':
      return await kerberosRC4Decrypt(encryptedData, key, keyUsage);
      
    case 'AES128':
    case 'AES128-CTS':
    case 'AES128-CTS-HMAC-SHA1-96':
    case 'ETYPE-17':
      return await kerberosAESDecrypt(encryptedData, key, 128, keyUsage);
      
    case 'AES256':
    case 'AES256-CTS':
    case 'AES256-CTS-HMAC-SHA1-96':
    case 'ETYPE-18':
      return await kerberosAESDecrypt(encryptedData, key, 256, keyUsage);
      
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

// RC4-HMAC decryption (etype 23)
async function kerberosRC4Decrypt(encryptedData, key, keyUsage) {
  // Convert hex string to bytes if needed
  const cipherBytes = typeof encryptedData === 'string' 
    ? new Uint8Array(encryptedData.match(/.{2}/g).map(byte => parseInt(byte, 16)))
    : new Uint8Array(encryptedData);
    
  const keyBytes = typeof key === 'string'
    ? new Uint8Array(key.match(/.{2}/g).map(byte => parseInt(byte, 16)))
    : new Uint8Array(key);
  
  // RC4-HMAC uses first 16 bytes as checksum
  if (cipherBytes.length < 16) {
    throw new Error('Invalid RC4-HMAC encrypted data: too short');
  }
  
  const checksum = cipherBytes.slice(0, 16);
  const ciphertext = cipherBytes.slice(16);
  
  // Derive decryption key
  // K1 = HMAC-MD5(key, keyUsage)
  const keyUsageBytes = new Uint8Array(4);
  new DataView(keyUsageBytes.buffer).setUint32(0, keyUsage, true);
  
  const k1 = await hmacMd5(keyBytes, keyUsageBytes);
  const k1Bytes = new Uint8Array(k1.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // K2 = HMAC-MD5(key, checksum)
  const k2 = await hmacMd5(keyBytes, checksum);
  const k2Bytes = new Uint8Array(k2.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // Decrypt with RC4
  const plaintext = rc4Decrypt(ciphertext, k2Bytes);
  const plaintextBytes = new Uint8Array(plaintext.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // Verify checksum
  const calculatedChecksum = await hmacMd5(k1Bytes, plaintextBytes);
  const calculatedChecksumBytes = new Uint8Array(
    calculatedChecksum.match(/.{2}/g).map(byte => parseInt(byte, 16))
  );
  
  // Compare checksums
  let valid = true;
  for (let i = 0; i < 16; i++) {
    if (checksum[i] !== calculatedChecksumBytes[i]) {
      valid = false;
      break;
    }
  }
  
  if (!valid) {
    throw new Error('Kerberos RC4-HMAC checksum verification failed');
  }
  
  // Remove confounder (first 8 bytes) and return plaintext
  const result = plaintextBytes.slice(8);
  return Array.from(result, byte => String.fromCharCode(byte)).join('');
}

// AES-CTS decryption (etype 17/18)
async function kerberosAESDecrypt(encryptedData, key, keySize, keyUsage) {
  // Convert inputs to bytes
  const cipherBytes = typeof encryptedData === 'string' 
    ? new Uint8Array(encryptedData.match(/.{2}/g).map(byte => parseInt(byte, 16)))
    : new Uint8Array(encryptedData);
    
  const keyBytes = typeof key === 'string'
    ? new Uint8Array(key.match(/.{2}/g).map(byte => parseInt(byte, 16)))
    : new Uint8Array(key);
  
  // AES-CTS uses last 12 bytes as HMAC-SHA1-96 checksum
  if (cipherBytes.length < 12) {
    throw new Error('Invalid AES-CTS encrypted data: too short');
  }
  
  const ciphertext = cipherBytes.slice(0, -12);
  const checksum = cipherBytes.slice(-12);
  
  // Derive keys using key derivation function
  const { ke, ki } = await deriveAESKeys(keyBytes, keyUsage, keySize);
  
  // Decrypt with AES-CTS
  const plaintext = await aesDecryptCTS(ciphertext, ke);
  const plaintextBytes = new Uint8Array(plaintext);
  
  // Verify HMAC-SHA1-96 checksum
  const calculatedChecksum = await calculateHMACSHA196(ki, ciphertext);
  
  // Compare checksums
  let valid = true;
  for (let i = 0; i < 12; i++) {
    if (checksum[i] !== calculatedChecksum[i]) {
      valid = false;
      break;
    }
  }
  
  if (!valid) {
    throw new Error('Kerberos AES-CTS checksum verification failed');
  }
  
  // Remove confounder (first 16 bytes) and return plaintext
  const result = plaintextBytes.slice(16);
  return Array.from(result, byte => String.fromCharCode(byte)).join('');
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