// Advanced AES Implementation with KDF Support
// Integrates HKDF, PBKDF2, and proper key handling

import { hkdf } from '../kdf/hkdf.js';
import { pbkdf2 } from '../kdf/pbkdf2.js';

// Use globalThis.crypto for cross-platform compatibility
const cryptoAPI = globalThis.crypto || (typeof window !== 'undefined' ? window.crypto : null);
if (!cryptoAPI) {
  throw new Error('Web Crypto API not available');
}

export class AdvancedAESCipher {
  constructor(options = {}) {
    this.mode = options.mode || 'GCM';
    this.keySize = options.keySize || 256;
    this.keyDerivation = options.keyDerivation || 'none';
    this.keyFormat = options.keyFormat || 'raw';
  }
  
  async deriveKey(keyMaterial, options = {}) {
    const {
      salt = 'default-salt',
      iterations = 100000,
      info = 'aes-encryption',
      keyLength = this.keySize / 8
    } = options;
    
    let keyBytes;
    
    // Convert key material to bytes
    if (typeof keyMaterial === 'string') {
      if (this.keyFormat === 'hex' && keyMaterial.match(/^[0-9a-fA-F]+$/)) {
        keyBytes = new Uint8Array(keyMaterial.match(/.{2}/g).map(byte => parseInt(byte, 16)));
      } else if (this.keyFormat === 'base64') {
        try {
          keyBytes = new Uint8Array(atob(keyMaterial).split('').map(c => c.charCodeAt(0)));
        } catch {
          keyBytes = new TextEncoder().encode(keyMaterial);
        }
      } else {
        keyBytes = new TextEncoder().encode(keyMaterial);
      }
    } else {
      keyBytes = new Uint8Array(keyMaterial);
    }
    
    // Apply key derivation
    switch (this.keyDerivation) {
      case 'hkdf':
        return await hkdf(keyBytes, salt, info, keyLength);
        
      case 'pbkdf2':
        return await pbkdf2(keyBytes, salt, iterations, keyLength);
        
      case 'none':
      default:
        // Ensure proper key length
        if (keyBytes.length === keyLength) {
          return keyBytes;
        } else if (keyBytes.length > keyLength) {
          return keyBytes.slice(0, keyLength);
        } else {
          // Use HKDF to expand short keys properly
          return await hkdf(keyBytes, salt, 'key-expansion', keyLength);
        }
    }
  }
  
  generateIV() {
    const ivSize = this.getIVSize();
    return cryptoAPI.getRandomValues(new Uint8Array(ivSize));
  }
  
  getIVSize() {
    switch (this.mode) {
      case 'CBC':
      case 'CTR':
        return 16; // 128 bits
      case 'GCM':
        return 12; // 96 bits (recommended for GCM)
      default:
        return 16;
    }
  }
  
  async encrypt(plaintext, key, options = {}) {
    const {
      iv,
      salt,
      iterations,
      info,
      associatedData,
      tagLength = 128,
      outputFormat = 'base64'
    } = options;
    
    try {
      // Derive key if needed
      const keyBytes = await this.deriveKey(key, { salt, iterations, info });
      
      // Import key
      const algorithm = this.mode === 'CTR' ? 'AES-CTR' : `AES-${this.mode}`;
      const cryptoKey = await cryptoAPI.subtle.importKey(
        "raw",
        keyBytes,
        { name: algorithm },
        false,
        ["encrypt"]
      );
      
      // Prepare or generate IV
      let ivBytes;
      if (iv) {
        if (typeof iv === 'string') {
          if (iv.match(/^[0-9a-fA-F]+$/)) {
            ivBytes = new Uint8Array(iv.match(/.{2}/g).map(byte => parseInt(byte, 16)));
          } else {
            ivBytes = new Uint8Array(atob(iv).split('').map(c => c.charCodeAt(0)));
          }
        } else {
          ivBytes = new Uint8Array(iv);
        }
      } else {
        ivBytes = this.generateIV();
      }
      
      // Prepare data
      const dataBytes = new TextEncoder().encode(plaintext);
      
      // Configure algorithm parameters
      let algorithmParams;
      switch (this.mode) {
        case 'CBC':
          algorithmParams = {
            name: 'AES-CBC',
            iv: ivBytes
          };
          break;
        case 'CTR':
          algorithmParams = {
            name: 'AES-CTR',
            counter: ivBytes,
            length: 64 // Counter length in bits
          };
          break;
        case 'GCM':
          algorithmParams = {
            name: 'AES-GCM',
            iv: ivBytes,
            tagLength: tagLength
          };
          if (associatedData) {
            algorithmParams.additionalData = new TextEncoder().encode(associatedData);
          }
          break;
        default:
          throw new Error(`Unsupported mode: ${this.mode}`);
      }
      
      // Encrypt
      const encrypted = await cryptoAPI.subtle.encrypt(
        algorithmParams,
        cryptoKey,
        dataBytes
      );
      
      const encryptedBytes = new Uint8Array(encrypted);
      
      // Format output
      const result = {
        data: this.formatOutput(encryptedBytes, outputFormat),
        iv: this.formatOutput(ivBytes, outputFormat),
        mode: this.mode,
        keySize: this.keySize,
        keyDerivation: this.keyDerivation
      };
      
      // Include KDF parameters if used
      if (this.keyDerivation !== 'none') {
        result.kdfParams = {
          method: this.keyDerivation,
          salt: salt || 'default-salt',
          iterations: iterations || 100000,
          info: info || 'aes-encryption'
        };
      }
      
      return result;
    } catch (error) {
      throw new Error(`AES encryption failed: ${error.message}`);
    }
  }
  
  async decrypt(encryptedData, key, iv, options = {}) {
    const {
      salt,
      iterations,
      info,
      associatedData,
      tagLength = 128,
      inputFormat = 'base64'
    } = options;
    
    try {
      // Derive key if needed
      const keyBytes = await this.deriveKey(key, { salt, iterations, info });
      
      // Import key
      const algorithm = this.mode === 'CTR' ? 'AES-CTR' : `AES-${this.mode}`;
      const cryptoKey = await cryptoAPI.subtle.importKey(
        "raw",
        keyBytes,
        { name: algorithm },
        false,
        ["decrypt"]
      );
      
      // Parse encrypted data
      const dataBytes = this.parseInput(encryptedData, inputFormat);
      const ivBytes = this.parseInput(iv, inputFormat);
      
      // Configure algorithm parameters
      let algorithmParams;
      switch (this.mode) {
        case 'CBC':
          algorithmParams = {
            name: 'AES-CBC',
            iv: ivBytes
          };
          break;
        case 'CTR':
          algorithmParams = {
            name: 'AES-CTR',
            counter: ivBytes,
            length: 64
          };
          break;
        case 'GCM':
          algorithmParams = {
            name: 'AES-GCM',
            iv: ivBytes,
            tagLength: tagLength
          };
          if (associatedData) {
            algorithmParams.additionalData = new TextEncoder().encode(associatedData);
          }
          break;
        default:
          throw new Error(`Unsupported mode: ${this.mode}`);
      }
      
      // Decrypt
      const decrypted = await cryptoAPI.subtle.decrypt(
        algorithmParams,
        cryptoKey,
        dataBytes
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new Error(`AES decryption failed: ${error.message}`);
    }
  }
  
  formatOutput(bytes, format) {
    switch (format) {
      case 'hex':
        return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
      case 'base64':
        return btoa(String.fromCharCode(...bytes));
      case 'bytes':
        return bytes;
      default:
        return btoa(String.fromCharCode(...bytes));
    }
  }
  
  parseInput(data, format) {
    if (data instanceof Uint8Array) {
      return data;
    }
    
    if (typeof data === 'string') {
      switch (format) {
        case 'hex':
          return new Uint8Array(data.match(/.{2}/g).map(byte => parseInt(byte, 16)));
        case 'base64':
          return new Uint8Array(atob(data).split('').map(c => c.charCodeAt(0)));
        default:
          return new TextEncoder().encode(data);
      }
    }
    
    return new Uint8Array(data);
  }
}

// Convenience functions with full parameter support
export async function aesEncryptAdvanced(plaintext, key, options = {}) {
  const {
    mode = 'GCM',
    keySize = 256,
    keyDerivation = 'none',
    keyFormat = 'raw',
    iv,
    salt,
    iterations,
    info,
    associatedData,
    tagLength,
    outputFormat = 'base64'
  } = options;
  
  const cipher = new AdvancedAESCipher({
    mode,
    keySize,
    keyDerivation,
    keyFormat
  });
  
  return await cipher.encrypt(plaintext, key, {
    iv,
    salt,
    iterations,
    info,
    associatedData,
    tagLength,
    outputFormat
  });
}

export async function aesDecryptAdvanced(encryptedData, key, iv, options = {}) {
  const {
    mode = 'GCM',
    keySize = 256,
    keyDerivation = 'none',
    keyFormat = 'raw',
    salt,
    iterations,
    info,
    associatedData,
    tagLength,
    inputFormat = 'base64'
  } = options;
  
  const cipher = new AdvancedAESCipher({
    mode,
    keySize,
    keyDerivation,
    keyFormat
  });
  
  return await cipher.decrypt(encryptedData, key, iv, {
    salt,
    iterations,
    info,
    associatedData,
    tagLength,
    inputFormat
  });
}

// Specific functions for each mode with KDF support
export async function aesGcmEncryptWithKdf(plaintext, password, options = {}) {
  const {
    keyDerivation = 'pbkdf2',
    salt = cryptoAPI.getRandomValues(new Uint8Array(16)),
    iterations = 100000,
    outputFormat = 'json'
  } = options;
  
  const result = await aesEncryptAdvanced(plaintext, password, {
    mode: 'GCM',
    keySize: 256,
    keyDerivation,
    keyFormat: 'raw',
    salt,
    iterations,
    ...options
  });
  
  if (outputFormat === 'json') {
    return JSON.stringify({
      ...result,
      salt: result.kdfParams ? result.kdfParams.salt : undefined
    });
  }
  
  return result;
}

export async function aesGcmDecryptWithKdf(encryptedJson, password, options = {}) {
  let data;
  if (typeof encryptedJson === 'string') {
    data = JSON.parse(encryptedJson);
  } else {
    data = encryptedJson;
  }
  
  return await aesDecryptAdvanced(
    data.data,
    password,
    data.iv,
    {
      mode: 'GCM',
      keySize: data.keySize || 256,
      keyDerivation: data.keyDerivation || 'pbkdf2',
      salt: data.kdfParams?.salt || data.salt,
      iterations: data.kdfParams?.iterations || 100000,
      ...options
    }
  );
}

// Generate secure random key
export function generateAesKey(keySize = 256) {
  const keyBytes = keySize / 8;
  const key = cryptoAPI.getRandomValues(new Uint8Array(keyBytes));
  return {
    hex: Array.from(key).map(b => b.toString(16).padStart(2, '0')).join(''),
    base64: btoa(String.fromCharCode(...key)),
    bytes: key
  };
}

// Generate key from password using KDF
export async function generateAesKeyFromPassword(password, options = {}) {
  const {
    keySize = 256,
    method = 'pbkdf2',
    salt = 'default-salt',
    iterations = 100000,
    info = 'aes-key-generation',
    outputFormat = 'base64'
  } = options;
  
  const keyLength = keySize / 8;
  let keyBytes;
  
  if (method === 'hkdf') {
    keyBytes = await hkdf(password, salt, info, keyLength);
  } else {
    keyBytes = await pbkdf2(password, salt, iterations, keyLength);
  }
  
  switch (outputFormat) {
    case 'hex':
      return Array.from(keyBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    case 'base64':
      return btoa(String.fromCharCode(...keyBytes));
    case 'bytes':
      return keyBytes;
    default:
      return btoa(String.fromCharCode(...keyBytes));
  }
}