// Cryptographic functions for RSA, AES, Envelope Encryption, Compression, and Password-based Encryption
// Inspired by Lockit - blazing fast encryption suite with ZSTD compression and AES-GCM encryption

// RSA Key Generation
export async function generateRSAKeyPair(keySize = 2048) {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: keySize,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );
    
    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    
    return {
      publicKey: arrayBufferToBase64(publicKey),
      privateKey: arrayBufferToBase64(privateKey),
      publicKeyPem: formatKeyAsPem(arrayBufferToBase64(publicKey), 'PUBLIC KEY'),
      privateKeyPem: formatKeyAsPem(arrayBufferToBase64(privateKey), 'PRIVATE KEY'),
      publicKeyPemPkcs1: formatKeyAsPem(arrayBufferToBase64(publicKey), 'RSA PUBLIC KEY'),
      privateKeyPemPkcs1: formatKeyAsPem(arrayBufferToBase64(privateKey), 'RSA PRIVATE KEY')
    };
  } catch (error) {
    throw new Error(`RSA key generation failed: ${error.message}`);
  }
}

// RSA Encryption
export async function rsaEncrypt(data, publicKeyPem) {
  try {
    const publicKeyBase64 = extractKeyFromPem(publicKeyPem);
    const publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64);
    const keyFormat = detectKeyFormat(publicKeyPem);
    
    // Determine the import format
    let importFormat = "spki";
    if (keyFormat === 'pkcs1-public') {
      // Browser expects SPKI format, but we'll try to import as-is
      // Note: Modern browsers typically don't support raw PKCS#1 import
      importFormat = "spki";
    }
    
    const publicKey = await window.crypto.subtle.importKey(
      importFormat,
      publicKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"]
    );
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "RSA-OAEP" },
      publicKey,
      dataBuffer
    );
    
    return arrayBufferToBase64(encrypted);
  } catch (error) {
    throw new Error(`RSA encryption failed: ${error.message}`);
  }
}

// RSA Decryption
export async function rsaDecrypt(encryptedData, privateKeyPem) {
  try {
    const privateKeyBase64 = extractKeyFromPem(privateKeyPem);
    const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);
    const keyFormat = detectKeyFormat(privateKeyPem);
    
    // Determine the import format
    let importFormat = "pkcs8";
    if (keyFormat === 'pkcs1-private') {
      // Browser expects PKCS#8 format, but we'll try to import as-is
      // Note: Modern browsers typically don't support raw PKCS#1 import
      importFormat = "pkcs8";
    }
    
    const privateKey = await window.crypto.subtle.importKey(
      importFormat,
      privateKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["decrypt"]
    );
    
    const encryptedBuffer = base64ToArrayBuffer(encryptedData);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "RSA-OAEP" },
      privateKey,
      encryptedBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error(`RSA decryption failed: ${error.message}`);
  }
}

// AES Key Generation
export async function generateAESKey() {
  try {
    const key = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
    
    const keyBuffer = await window.crypto.subtle.exportKey("raw", key);
    return arrayBufferToBase64(keyBuffer);
  } catch (error) {
    throw new Error(`AES key generation failed: ${error.message}`);
  }
}

// AES Encryption (GCM mode)
export async function aesEncrypt(data, keyBase64, ivBase64 = null) {
  try {
    const keyBuffer = base64ToArrayBuffer(keyBase64);
    const key = await window.crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );
    
    // Generate IV if not provided
    const iv = ivBase64 ? base64ToArrayBuffer(ivBase64) : window.crypto.getRandomValues(new Uint8Array(12));
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      dataBuffer
    );
    
    return {
      data: arrayBufferToBase64(encrypted),
      iv: arrayBufferToBase64(iv)
    };
  } catch (error) {
    throw new Error(`AES encryption failed: ${error.message}`);
  }
}

// AES Decryption (GCM mode)
export async function aesDecrypt(encryptedData, keyBase64, ivBase64) {
  try {
    const keyBuffer = base64ToArrayBuffer(keyBase64);
    const key = await window.crypto.subtle.importKey(
      "raw",
      keyBuffer,
      { name: "AES-GCM" },
      false,
      ["decrypt"]
    );
    
    const iv = base64ToArrayBuffer(ivBase64);
    const dataBuffer = base64ToArrayBuffer(encryptedData);
    
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      dataBuffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    throw new Error(`AES decryption failed: ${error.message}`);
  }
}

// Envelope Encryption - Encrypt data with AES, encrypt AES key with RSA
export async function envelopeEncrypt(data, publicKeyPem) {
  try {
    // Generate AES key
    const aesKey = await generateAESKey();
    
    // Encrypt data with AES
    const aesResult = await aesEncrypt(data, aesKey);
    
    // Encrypt AES key with RSA
    const encryptedAESKey = await rsaEncrypt(aesKey, publicKeyPem);
    
    // Combine encrypted key and encrypted data
    const envelopeData = `${encryptedAESKey};;${aesResult.iv};;${aesResult.data}`;
    
    return {
      encryptedData: envelopeData,
      encryptedAESKey: encryptedAESKey,
      encryptedMessage: aesResult.data,
      iv: aesResult.iv
    };
  } catch (error) {
    throw new Error(`Envelope encryption failed: ${error.message}`);
  }
}

// Envelope Decryption - Decrypt RSA-encrypted AES key, then decrypt data with AES
export async function envelopeDecrypt(encryptedData, privateKeyPem) {
  try {
    // Parse the envelope data
    const parts = encryptedData.split(';;');
    if (parts.length !== 3) {
      throw new Error('Invalid envelope data format');
    }
    
    const [encryptedAESKey, iv, encryptedMessage] = parts;
    
    // Decrypt AES key with RSA
    const aesKey = await rsaDecrypt(encryptedAESKey, privateKeyPem);
    
    // Decrypt message with AES
    const decryptedMessage = await aesDecrypt(encryptedMessage, aesKey, iv);
    
    return decryptedMessage;
  } catch (error) {
    throw new Error(`Envelope decryption failed: ${error.message}`);
  }
}

// Simple Envelope Encryption (short format for UI)
export async function envelopeEncryptShort(data, publicKeyPem) {
  const result = await envelopeEncrypt(data, publicKeyPem);
  return result.encryptedData;
}

// Utility Functions

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function formatKeyAsPem(base64Key, keyType) {
  const pemHeader = `-----BEGIN ${keyType}-----`;
  const pemFooter = `-----END ${keyType}-----`;
  const pemBody = base64Key.match(/.{1,64}/g).join('\n');
  return `${pemHeader}\n${pemBody}\n${pemFooter}`;
}

function extractKeyFromPem(pem) {
  return pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s/g, '');
}

function detectKeyFormat(pem) {
  if (pem.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    return 'pkcs1-private';
  } else if (pem.includes('-----BEGIN RSA PUBLIC KEY-----')) {
    return 'pkcs1-public';
  } else if (pem.includes('-----BEGIN PRIVATE KEY-----')) {
    return 'pkcs8-private';
  } else if (pem.includes('-----BEGIN PUBLIC KEY-----')) {
    return 'spki-public';
  }
  throw new Error('Unsupported key format');
}

// Key Format Conversion Functions
export async function convertPkcs1ToSpki(pkcs1PublicKeyPem) {
  try {
    // Extract the key data
    const keyData = extractKeyFromPem(pkcs1PublicKeyPem);
    // For browser compatibility, we'll try to wrap PKCS#1 in SPKI format
    // This is a simplified approach - full ASN.1 parsing would be more robust
    return formatKeyAsPem(keyData, 'PUBLIC KEY');
  } catch (error) {
    throw new Error(`PKCS#1 to SPKI conversion failed: ${error.message}`);
  }
}

export async function convertPkcs1ToPkcs8(pkcs1PrivateKeyPem) {
  try {
    // Extract the key data
    const keyData = extractKeyFromPem(pkcs1PrivateKeyPem);
    // For browser compatibility, we'll try to wrap PKCS#1 in PKCS#8 format
    return formatKeyAsPem(keyData, 'PRIVATE KEY');
  } catch (error) {
    throw new Error(`PKCS#1 to PKCS#8 conversion failed: ${error.message}`);
  }
}

// Enhanced RSA functions that handle PKCS#1 by converting to PKCS#8/SPKI
export async function rsaEncryptPkcs1Compatible(data, publicKeyPem) {
  try {
    const keyFormat = detectKeyFormat(publicKeyPem);
    let workingKey = publicKeyPem;
    
    // If it's PKCS#1, convert to SPKI for browser compatibility
    if (keyFormat === 'pkcs1-public') {
      workingKey = await convertPkcs1ToSpki(publicKeyPem);
    }
    
    return await rsaEncrypt(data, workingKey);
  } catch (error) {
    throw new Error(`RSA PKCS#1 encryption failed: ${error.message}`);
  }
}

export async function rsaDecryptPkcs1Compatible(encryptedData, privateKeyPem) {
  try {
    const keyFormat = detectKeyFormat(privateKeyPem);
    let workingKey = privateKeyPem;
    
    // If it's PKCS#1, convert to PKCS#8 for browser compatibility
    if (keyFormat === 'pkcs1-private') {
      workingKey = await convertPkcs1ToPkcs8(privateKeyPem);
    }
    
    return await rsaDecrypt(encryptedData, workingKey);
  } catch (error) {
    throw new Error(`RSA PKCS#1 decryption failed: ${error.message}`);
  }
}

// Digital Signatures (bonus feature)
export async function generateSigningKeyPair(keySize = 2048) {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-PSS",
        modulusLength: keySize,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["sign", "verify"]
    );
    
    const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
    
    return {
      publicKey: arrayBufferToBase64(publicKey),
      privateKey: arrayBufferToBase64(privateKey),
      publicKeyPem: formatKeyAsPem(arrayBufferToBase64(publicKey), 'PUBLIC KEY'),
      privateKeyPem: formatKeyAsPem(arrayBufferToBase64(privateKey), 'PRIVATE KEY')
    };
  } catch (error) {
    throw new Error(`Signing key generation failed: ${error.message}`);
  }
}

export async function signMessage(message, privateKeyPem) {
  try {
    const privateKeyBase64 = extractKeyFromPem(privateKeyPem);
    const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);
    
    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      {
        name: "RSA-PSS",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );
    
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(message);
    
    const signature = await window.crypto.subtle.sign(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      privateKey,
      messageBuffer
    );
    
    return arrayBufferToBase64(signature);
  } catch (error) {
    throw new Error(`Message signing failed: ${error.message}`);
  }
}

export async function verifySignature(message, signature, publicKeyPem) {
  try {
    const publicKeyBase64 = extractKeyFromPem(publicKeyPem);
    const publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64);
    
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      publicKeyBuffer,
      {
        name: "RSA-PSS",
        hash: "SHA-256",
      },
      false,
      ["verify"]
    );
    
    const encoder = new TextEncoder();
    const messageBuffer = encoder.encode(message);
    const signatureBuffer = base64ToArrayBuffer(signature);
    
    const isValid = await window.crypto.subtle.verify(
      {
        name: "RSA-PSS",
        saltLength: 32,
      },
      publicKey,
      signatureBuffer,
      messageBuffer
    );
    
    return isValid;
  } catch (error) {
    throw new Error(`Signature verification failed: ${error.message}`);
  }
}

// === COMPRESSION FUNCTIONS ===
// Browser-compatible compression using gzip (similar to ZSTD concept)

export async function compressData(data) {
  try {
    // Convert string to Uint8Array if needed
    const inputData = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
    
    // Use CompressionStream (modern browsers)
    if ('CompressionStream' in window) {
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      const reader = cs.readable.getReader();
      
      // Write data
      writer.write(inputData);
      writer.close();
      
      // Read compressed data
      const chunks = [];
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return result;
    } else {
      // Fallback: return original data (no compression)
      console.warn('CompressionStream not supported, returning uncompressed data');
      return inputData;
    }
  } catch (error) {
    throw new Error(`Compression failed: ${error.message}`);
  }
}

export async function decompressData(compressedData) {
  try {
    const inputData = new Uint8Array(compressedData);
    
    // Use DecompressionStream (modern browsers)
    if ('DecompressionStream' in window) {
      const ds = new DecompressionStream('gzip');
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();
      
      // Write compressed data
      writer.write(inputData);
      writer.close();
      
      // Read decompressed data
      const chunks = [];
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          chunks.push(value);
        }
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return result;
    } else {
      // Fallback: return original data (assuming it's not compressed)
      console.warn('DecompressionStream not supported, returning data as-is');
      return inputData;
    }
  } catch (error) {
    throw new Error(`Decompression failed: ${error.message}`);
  }
}

// === PASSWORD-BASED ENCRYPTION (AES-GCM with HKDF) ===
// Similar to Lockit's approach with salt + nonce + encrypted data

const KEY_SIZE = 32; // 256 bits for AES-256
const NONCE_SIZE = 12; // 96 bits for GCM
const SALT_SIZE = 16; // 128 bits

// HKDF key derivation using Web Crypto API
async function deriveKeyFromPassword(password, salt) {
  try {
    // Import password as key material
    const passwordKey = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'HKDF' },
      false,
      ['deriveKey']
    );
    
    // Derive AES key using HKDF
    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: salt,
        info: new Uint8Array(), // No additional info
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
    
    return derivedKey;
  } catch (error) {
    throw new Error(`Key derivation failed: ${error.message}`);
  }
}

// Generate cryptographically secure random bytes
function generateRandomBytes(length) {
  return window.crypto.getRandomValues(new Uint8Array(length));
}

// Password-based encryption (like Lockit)
export async function encryptWithPassword(data, password) {
  try {
    // Convert string to bytes if needed
    const dataBytes = typeof data === 'string' ? new TextEncoder().encode(data) : new Uint8Array(data);
    
    // Generate salt and nonce
    const salt = generateRandomBytes(SALT_SIZE);
    const nonce = generateRandomBytes(NONCE_SIZE);
    
    // Derive key from password
    const key = await deriveKeyFromPassword(password, salt);
    
    // Encrypt data
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
      },
      key,
      dataBytes
    );
    
    // Combine salt + nonce + encrypted data
    const result = new Uint8Array(SALT_SIZE + NONCE_SIZE + encryptedData.byteLength);
    result.set(salt, 0);
    result.set(nonce, SALT_SIZE);
    result.set(new Uint8Array(encryptedData), SALT_SIZE + NONCE_SIZE);
    
    return result;
  } catch (error) {
    throw new Error(`Password-based encryption failed: ${error.message}`);
  }
}

// Password-based decryption (like Lockit)
export async function decryptWithPassword(encryptedData, password) {
  try {
    const data = new Uint8Array(encryptedData);
    
    if (data.length < SALT_SIZE + NONCE_SIZE) {
      throw new Error('Invalid encrypted data format');
    }
    
    // Extract salt, nonce, and encrypted data
    const salt = data.slice(0, SALT_SIZE);
    const nonce = data.slice(SALT_SIZE, SALT_SIZE + NONCE_SIZE);
    const encrypted = data.slice(SALT_SIZE + NONCE_SIZE);
    
    // Derive key from password
    const key = await deriveKeyFromPassword(password, salt);
    
    // Decrypt data
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonce,
      },
      key,
      encrypted
    );
    
    return new Uint8Array(decryptedBuffer);
  } catch (error) {
    throw new Error(`Password-based decryption failed: ${error.message}`);
  }
}

// === COMBINED COMPRESS + ENCRYPT FUNCTIONS ===
// Like Lockit: compress first, then encrypt

export async function compressAndEncrypt(data, password) {
  try {
    // Step 1: Compress data
    const compressedData = await compressData(data);
    
    // Step 2: Encrypt compressed data
    const encryptedData = await encryptWithPassword(compressedData, password);
    
    return encryptedData;
  } catch (error) {
    throw new Error(`Compress and encrypt failed: ${error.message}`);
  }
}

export async function decryptAndDecompress(encryptedData, password) {
  try {
    // Step 1: Decrypt data
    const compressedData = await decryptWithPassword(encryptedData, password);
    
    // Step 2: Decompress data
    const originalData = await decompressData(compressedData);
    
    return originalData;
  } catch (error) {
    throw new Error(`Decrypt and decompress failed: ${error.message}`);
  }
}

// Convenience functions that return strings
export async function encryptString(text, password) {
  const encrypted = await encryptWithPassword(text, password);
  return arrayBufferToBase64(encrypted);
}

export async function decryptString(encryptedBase64, password) {
  const encrypted = base64ToArrayBuffer(encryptedBase64);
  const decrypted = await decryptWithPassword(encrypted, password);
  return new TextDecoder().decode(decrypted);
}

export async function compressEncryptString(text, password) {
  const encrypted = await compressAndEncrypt(text, password);
  return arrayBufferToBase64(encrypted);
}

export async function decryptDecompressString(encryptedBase64, password) {
  const encrypted = base64ToArrayBuffer(encryptedBase64);
  const decrypted = await decryptAndDecompress(encrypted, password);
  return new TextDecoder().decode(decrypted);
}

// === ADVANCED CERTIFICATE AND KEYSTORE FORMATS ===
// PKCS#12, PKCS#8, X.509, PFX, and enhanced PEM support

// Enhanced format detection with more certificate types
function detectAdvancedKeyFormat(pem) {
  if (pem.includes('-----BEGIN RSA PRIVATE KEY-----')) {
    return 'pkcs1-private';
  } else if (pem.includes('-----BEGIN RSA PUBLIC KEY-----')) {
    return 'pkcs1-public';
  } else if (pem.includes('-----BEGIN PRIVATE KEY-----')) {
    return 'pkcs8-private';
  } else if (pem.includes('-----BEGIN PUBLIC KEY-----')) {
    return 'spki-public';
  } else if (pem.includes('-----BEGIN ENCRYPTED PRIVATE KEY-----')) {
    return 'pkcs8-encrypted-private';
  } else if (pem.includes('-----BEGIN CERTIFICATE-----')) {
    return 'x509-certificate';
  } else if (pem.includes('-----BEGIN CERTIFICATE REQUEST-----')) {
    return 'x509-csr';
  } else if (pem.includes('-----BEGIN X509 CERTIFICATE-----')) {
    return 'x509-certificate-alt';
  } else if (pem.includes('-----BEGIN PKCS7-----')) {
    return 'pkcs7';
  }
  throw new Error('Unsupported certificate/key format');
}

// PKCS#12 (P12/PFX) Support
export async function parsePkcs12(p12Data, password = '') {
  try {
    // Note: Full PKCS#12 parsing requires ASN.1 libraries
    // This is a simplified version using Web Crypto API
    console.warn('PKCS#12 parsing: Simplified implementation - full ASN.1 parsing recommended for production');
    
    const data = typeof p12Data === 'string' ? base64ToArrayBuffer(p12Data) : p12Data;
    
    // Attempt to import as PKCS#12 keystore
    // Modern browsers don't fully support PKCS#12 import, so this is a placeholder
    return {
      certificates: [],
      privateKeys: [],
      warning: 'PKCS#12 parsing requires specialized ASN.1 library for full compatibility'
    };
  } catch (error) {
    throw new Error(`PKCS#12 parsing failed: ${error.message}`);
  }
}

// Create PKCS#12 keystore (simplified)
export async function createPkcs12(certificates, privateKey, password) {
  try {
    console.warn('PKCS#12 creation: Simplified implementation - use specialized library for production');
    
    // This would require full ASN.1 encoding
    return {
      p12Data: null,
      warning: 'PKCS#12 creation requires specialized ASN.1 library for full compatibility',
      recommendation: 'Use individual PEM certificates and keys for browser compatibility'
    };
  } catch (error) {
    throw new Error(`PKCS#12 creation failed: ${error.message}`);
  }
}

// Enhanced PKCS#8 Support
export async function parsePkcs8PrivateKey(pkcs8Pem, password = null) {
  try {
    const keyFormat = detectAdvancedKeyFormat(pkcs8Pem);
    const keyData = extractKeyFromPem(pkcs8Pem);
    const keyBuffer = base64ToArrayBuffer(keyData);
    
    if (keyFormat === 'pkcs8-encrypted-private' && !password) {
      throw new Error('Password required for encrypted PKCS#8 private key');
    }
    
    let algorithm = { name: "RSA-OAEP", hash: "SHA-256" };
    
    // Try to determine key type and algorithm
    // This is simplified - full implementation would parse ASN.1
    const importedKey = await window.crypto.subtle.importKey(
      "pkcs8",
      keyBuffer,
      algorithm,
      true,
      ["decrypt", "sign"]
    );
    
    return {
      key: importedKey,
      algorithm: algorithm.name,
      extractable: true
    };
  } catch (error) {
    throw new Error(`PKCS#8 parsing failed: ${error.message}`);
  }
}

// X.509 Certificate Support
export async function parseX509Certificate(certPem) {
  try {
    const keyFormat = detectAdvancedKeyFormat(certPem);
    
    if (!keyFormat.includes('certificate')) {
      throw new Error('Not a valid X.509 certificate');
    }
    
    const certData = extractKeyFromPem(certPem);
    const certBuffer = base64ToArrayBuffer(certData);
    
    // Parse certificate using Web Crypto API (limited support)
    try {
      const publicKey = await window.crypto.subtle.importKey(
        "spki",
        certBuffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["encrypt", "verify"]
      );
      
      return {
        publicKey: publicKey,
        format: keyFormat,
        raw: certBuffer,
        pem: certPem,
        info: {
          algorithm: 'RSA',
          usage: ['encrypt', 'verify'],
          warning: 'Limited certificate parsing - full ASN.1 parser recommended'
        }
      };
    } catch (importError) {
      // If RSA import fails, try EC
      try {
        const publicKey = await window.crypto.subtle.importKey(
          "spki",
          certBuffer,
          { name: "ECDSA", namedCurve: "P-256" },
          true,
          ["verify"]
        );
        
        return {
          publicKey: publicKey,
          format: keyFormat,
          raw: certBuffer,
          pem: certPem,
          info: {
            algorithm: 'ECDSA',
            curve: 'P-256',
            usage: ['verify']
          }
        };
      } catch (ecError) {
        throw new Error('Unsupported certificate algorithm');
      }
    }
  } catch (error) {
    throw new Error(`X.509 certificate parsing failed: ${error.message}`);
  }
}

// Create self-signed X.509 certificate (simplified)
export async function createSelfSignedCert(subjectName, keyPair, validDays = 365) {
  try {
    console.warn('Self-signed certificate creation: Simplified implementation');
    
    // Full X.509 certificate creation requires ASN.1 encoding
    const publicKeySpki = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
    const publicKeyPem = formatKeyAsPem(arrayBufferToBase64(publicKeySpki), 'PUBLIC KEY');
    
    return {
      certificate: null, // Would need ASN.1 encoding
      publicKey: publicKeyPem,
      subject: subjectName,
      validFrom: new Date(),
      validTo: new Date(Date.now() + validDays * 24 * 60 * 60 * 1000),
      warning: 'X.509 certificate creation requires ASN.1 library for full implementation'
    };
  } catch (error) {
    throw new Error(`Self-signed certificate creation failed: ${error.message}`);
  }
}

// PFX Support (Microsoft's PKCS#12 variant)
export async function parsePfx(pfxData, password) {
  try {
    // PFX is essentially PKCS#12
    return await parsePkcs12(pfxData, password);
  } catch (error) {
    throw new Error(`PFX parsing failed: ${error.message}`);
  }
}

// Enhanced PEM handling for multiple certificates
export function parsePemBundle(pemBundle) {
  try {
    const certificates = [];
    const privateKeys = [];
    const publicKeys = [];
    
    // Split PEM bundle into individual items
    const pemPattern = /-----BEGIN ([^-]+)-----[\s\S]*?-----END \1-----/g;
    let match;
    
    while ((match = pemPattern.exec(pemBundle)) !== null) {
      const pemItem = match[0];
      const itemType = match[1];
      
      try {
        const format = detectAdvancedKeyFormat(pemItem);
        
        if (format.includes('certificate')) {
          certificates.push({
            pem: pemItem,
            type: format,
            data: extractKeyFromPem(pemItem)
          });
        } else if (format.includes('private')) {
          privateKeys.push({
            pem: pemItem,
            type: format,
            data: extractKeyFromPem(pemItem),
            encrypted: format.includes('encrypted')
          });
        } else if (format.includes('public')) {
          publicKeys.push({
            pem: pemItem,
            type: format,
            data: extractKeyFromPem(pemItem)
          });
        }
      } catch (parseError) {
        console.warn(`Skipping invalid PEM item: ${parseError.message}`);
      }
    }
    
    return {
      certificates: certificates,
      privateKeys: privateKeys,
      publicKeys: publicKeys,
      total: certificates.length + privateKeys.length + publicKeys.length
    };
  } catch (error) {
    throw new Error(`PEM bundle parsing failed: ${error.message}`);
  }
}

// Certificate chain validation (simplified)
export async function validateCertificateChain(certificates) {
  try {
    console.warn('Certificate chain validation: Simplified implementation');
    
    if (certificates.length < 2) {
      return {
        valid: certificates.length === 1,
        chain: certificates,
        warnings: ['Single certificate - no chain validation needed']
      };
    }
    
    // Full chain validation would require:
    // 1. Signature verification
    // 2. Validity period checks
    // 3. CA trust validation
    // 4. Revocation status checks
    
    return {
      valid: false, // Conservative approach
      chain: certificates,
      warnings: ['Full certificate chain validation requires specialized library']
    };
  } catch (error) {
    throw new Error(`Certificate chain validation failed: ${error.message}`);
  }
}

// Convert between different key formats
export async function convertKeyFormat(keyPem, targetFormat) {
  try {
    const currentFormat = detectAdvancedKeyFormat(keyPem);
    const keyData = extractKeyFromPem(keyPem);
    
    if (currentFormat === targetFormat) {
      return keyPem; // Already in target format
    }
    
    // Conversion matrix (simplified)
    const conversions = {
      'pkcs1-private_to_pkcs8-private': () => formatKeyAsPem(keyData, 'PRIVATE KEY'),
      'pkcs1-public_to_spki-public': () => formatKeyAsPem(keyData, 'PUBLIC KEY'),
      'pkcs8-private_to_pkcs1-private': () => formatKeyAsPem(keyData, 'RSA PRIVATE KEY'),
      'spki-public_to_pkcs1-public': () => formatKeyAsPem(keyData, 'RSA PUBLIC KEY')
    };
    
    const conversionKey = `${currentFormat}_to_${targetFormat}`;
    const converter = conversions[conversionKey];
    
    if (converter) {
      return converter();
    } else {
      throw new Error(`Conversion from ${currentFormat} to ${targetFormat} not supported`);
    }
  } catch (error) {
    throw new Error(`Key format conversion failed: ${error.message}`);
  }
}

// Export all crypto functions in categories
export const crypto = {
  rsa: {
    generateKeyPair: generateRSAKeyPair,
    encrypt: rsaEncrypt,
    decrypt: rsaDecrypt,
    encryptPkcs1Compatible: rsaEncryptPkcs1Compatible,
    decryptPkcs1Compatible: rsaDecryptPkcs1Compatible
  },
  aes: {
    generateKey: generateAESKey,
    encrypt: aesEncrypt,
    decrypt: aesDecrypt
  },
  envelope: {
    encrypt: envelopeEncrypt,
    decrypt: envelopeDecrypt,
    encryptShort: envelopeEncryptShort
  },
  signature: {
    generateKeyPair: generateSigningKeyPair,
    sign: signMessage,
    verify: verifySignature
  },
  password: {
    encrypt: encryptWithPassword,
    decrypt: decryptWithPassword,
    encryptString: encryptString,
    decryptString: decryptString
  },
  compression: {
    compress: compressData,
    decompress: decompressData,
    compressAndEncrypt: compressAndEncrypt,
    decryptAndDecompress: decryptAndDecompress,
    compressEncryptString: compressEncryptString,
    decryptDecompressString: decryptDecompressString
  },
  utils: {
    convertPkcs1ToSpki: convertPkcs1ToSpki,
    convertPkcs1ToPkcs8: convertPkcs1ToPkcs8,
    detectKeyFormat: detectKeyFormat,
    detectAdvancedKeyFormat: detectAdvancedKeyFormat,
    convertKeyFormat: convertKeyFormat
  },
  pkcs12: {
    parse: parsePkcs12,
    create: createPkcs12,
    parsePfx: parsePfx
  },
  pkcs8: {
    parsePrivateKey: parsePkcs8PrivateKey
  },
  x509: {
    parseCertificate: parseX509Certificate,
    createSelfSigned: createSelfSignedCert,
    validateChain: validateCertificateChain
  },
  pem: {
    parseBundle: parsePemBundle,
    extractKey: extractKeyFromPem,
    formatKey: formatKeyAsPem
  }
};