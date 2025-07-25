// Enhanced AES Implementation with Multiple Modes
// Supports AES-128, AES-192, AES-256 with CBC, CTR, GCM modes

export class AESCipher {
  constructor(key, options = {}) {
    this.keySize = options.keySize || this.detectKeySize(key);
    this.mode = options.mode || 'GCM';
    this.key = this.prepareKey(key);
  }
  
  detectKeySize(key) {
    let keyBytes;
    if (typeof key === 'string') {
      // Try to detect if it's hex, base64, or raw text
      if (key.match(/^[0-9a-fA-F]+$/) && key.length % 2 === 0) {
        keyBytes = new Uint8Array(key.match(/.{2}/g).map(byte => parseInt(byte, 16)));
      } else {
        try {
          keyBytes = new Uint8Array(atob(key).split('').map(c => c.charCodeAt(0)));
        } catch {
          keyBytes = new TextEncoder().encode(key);
        }
      }
    } else {
      keyBytes = new Uint8Array(key);
    }
    
    if (keyBytes.length <= 16) return 128;
    if (keyBytes.length <= 24) return 192;
    return 256;
  }
  
  prepareKey(key) {
    const targetSize = this.keySize / 8;
    let keyBytes;
    
    if (typeof key === 'string') {
      if (key.match(/^[0-9a-fA-F]+$/) && key.length % 2 === 0) {
        // Hex string
        keyBytes = new Uint8Array(key.match(/.{2}/g).map(byte => parseInt(byte, 16)));
      } else {
        try {
          // Try base64
          keyBytes = new Uint8Array(atob(key).split('').map(c => c.charCodeAt(0)));
        } catch {
          // Raw text
          keyBytes = new TextEncoder().encode(key);
        }
      }
    } else {
      keyBytes = new Uint8Array(key);
    }
    
    // Pad or truncate to target size
    const result = new Uint8Array(targetSize);
    if (keyBytes.length >= targetSize) {
      result.set(keyBytes.slice(0, targetSize));
    } else {
      // Pad with repeated key
      for (let i = 0; i < targetSize; i++) {
        result[i] = keyBytes[i % keyBytes.length];
      }
    }
    
    return result;
  }
  
  async generateKey() {
    try {
      const algorithm = this.mode === 'CTR' ? 'AES-CTR' : `AES-${this.mode}`;
      const key = await crypto.subtle.generateKey(
        {
          name: algorithm,
          length: this.keySize,
        },
        true,
        ["encrypt", "decrypt"]
      );
      
      const keyBuffer = await crypto.subtle.exportKey("raw", key);
      return new Uint8Array(keyBuffer);
    } catch (error) {
      throw new Error(`AES key generation failed: ${error.message}`);
    }
  }
  
  async encrypt(plaintext, options = {}) {
    const { iv, associatedData, tagLength = 128 } = options;
    
    try {
      const algorithm = this.mode === 'CTR' ? 'AES-CTR' : `AES-${this.mode}`;
      
      // Import key
      const key = await crypto.subtle.importKey(
        "raw",
        this.key,
        { name: algorithm },
        false,
        ["encrypt"]
      );
      
      // Prepare IV/counter
      let ivBytes;
      if (iv) {
        ivBytes = typeof iv === 'string' ? 
          new Uint8Array(atob(iv).split('').map(c => c.charCodeAt(0))) : 
          new Uint8Array(iv);
      } else {
        const ivSize = this.getIVSize();
        ivBytes = crypto.getRandomValues(new Uint8Array(ivSize));
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
            length: 128
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
      const encrypted = await crypto.subtle.encrypt(
        algorithmParams,
        key,
        dataBytes
      );
      
      return {
        data: new Uint8Array(encrypted),
        iv: ivBytes,
        mode: this.mode,
        keySize: this.keySize
      };
    } catch (error) {
      throw new Error(`AES encryption failed: ${error.message}`);
    }
  }
  
  async decrypt(encryptedData, iv, options = {}) {
    const { associatedData, tagLength = 128 } = options;
    
    try {
      const algorithm = this.mode === 'CTR' ? 'AES-CTR' : `AES-${this.mode}`;
      
      // Import key
      const key = await crypto.subtle.importKey(
        "raw",
        this.key,
        { name: algorithm },
        false,
        ["decrypt"]
      );
      
      // Prepare IV
      const ivBytes = typeof iv === 'string' ? 
        new Uint8Array(atob(iv).split('').map(c => c.charCodeAt(0))) : 
        new Uint8Array(iv);
      
      // Prepare encrypted data
      const dataBytes = typeof encryptedData === 'string' ? 
        new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0))) : 
        new Uint8Array(encryptedData);
      
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
            length: 128
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
      const decrypted = await crypto.subtle.decrypt(
        algorithmParams,
        key,
        dataBytes
      );
      
      return new TextDecoder().decode(decrypted);
    } catch (error) {
      throw new Error(`AES decryption failed: ${error.message}`);
    }
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
  
  addPKCS7Padding(data, blockSize = 16) {
    const padLength = blockSize - (data.length % blockSize);
    const padded = new Uint8Array(data.length + padLength);
    padded.set(data);
    padded.fill(padLength, data.length);
    return padded;
  }
  
  removePKCS7Padding(data) {
    const padLength = data[data.length - 1];
    return data.slice(0, data.length - padLength);
  }
}

// Convenience functions for different AES modes
export async function aesEncryptCBC(plaintext, key, options = {}) {
  const { keySize = 256, outputFormat = 'base64' } = options;
  
  try {
    const cipher = new AESCipher(key, { mode: 'CBC', keySize });
    const result = await cipher.encrypt(plaintext, options);
    
    const combined = {
      data: formatOutput(result.data, outputFormat),
      iv: formatOutput(result.iv, outputFormat),
      mode: 'CBC',
      keySize: keySize
    };
    
    if (outputFormat === 'combined') {
      // Format: iv:data
      return `${formatOutput(result.iv, 'base64')}:${formatOutput(result.data, 'base64')}`;
    }
    
    return combined;
  } catch (error) {
    throw new Error(`AES-CBC encryption error: ${error.message}`);
  }
}

export async function aesDecryptCBC(encryptedData, key, iv, options = {}) {
  const { keySize = 256, inputFormat = 'base64' } = options;
  
  try {
    const cipher = new AESCipher(key, { mode: 'CBC', keySize });
    
    // Handle combined format
    if (typeof encryptedData === 'string' && encryptedData.includes(':') && !iv) {
      const [ivPart, dataPart] = encryptedData.split(':');
      return await cipher.decrypt(dataPart, ivPart, options);
    }
    
    return await cipher.decrypt(encryptedData, iv, options);
  } catch (error) {
    throw new Error(`AES-CBC decryption error: ${error.message}`);
  }
}

export async function aesEncryptCTR(plaintext, key, options = {}) {
  const { keySize = 256, outputFormat = 'base64' } = options;
  
  try {
    const cipher = new AESCipher(key, { mode: 'CTR', keySize });
    const result = await cipher.encrypt(plaintext, options);
    
    const combined = {
      data: formatOutput(result.data, outputFormat),
      iv: formatOutput(result.iv, outputFormat),
      mode: 'CTR',
      keySize: keySize
    };
    
    if (outputFormat === 'combined') {
      return `${formatOutput(result.iv, 'base64')}:${formatOutput(result.data, 'base64')}`;
    }
    
    return combined;
  } catch (error) {
    throw new Error(`AES-CTR encryption error: ${error.message}`);
  }
}

export async function aesDecryptCTR(encryptedData, key, iv, options = {}) {
  const { keySize = 256 } = options;
  
  try {
    const cipher = new AESCipher(key, { mode: 'CTR', keySize });
    
    // Handle combined format
    if (typeof encryptedData === 'string' && encryptedData.includes(':') && !iv) {
      const [ivPart, dataPart] = encryptedData.split(':');
      return await cipher.decrypt(dataPart, ivPart, options);
    }
    
    return await cipher.decrypt(encryptedData, iv, options);
  } catch (error) {
    throw new Error(`AES-CTR decryption error: ${error.message}`);
  }
}

export async function aesEncryptGCM(plaintext, key, options = {}) {
  const { keySize = 256, outputFormat = 'base64' } = options;
  
  try {
    const cipher = new AESCipher(key, { mode: 'GCM', keySize });
    const result = await cipher.encrypt(plaintext, options);
    
    const combined = {
      data: formatOutput(result.data, outputFormat),
      iv: formatOutput(result.iv, outputFormat),
      mode: 'GCM',
      keySize: keySize
    };
    
    if (outputFormat === 'combined') {
      return `${formatOutput(result.iv, 'base64')}:${formatOutput(result.data, 'base64')}`;
    }
    
    return combined;
  } catch (error) {
    throw new Error(`AES-GCM encryption error: ${error.message}`);
  }
}

export async function aesDecryptGCM(encryptedData, key, iv, options = {}) {
  const { keySize = 256 } = options;
  
  try {
    const cipher = new AESCipher(key, { mode: 'GCM', keySize });
    
    // Handle combined format
    if (typeof encryptedData === 'string' && encryptedData.includes(':') && !iv) {
      const [ivPart, dataPart] = encryptedData.split(':');
      return await cipher.decrypt(dataPart, ivPart, options);
    }
    
    return await cipher.decrypt(encryptedData, iv, options);
  } catch (error) {
    throw new Error(`AES-GCM decryption error: ${error.message}`);
  }
}

// Enhanced envelope encryption with proper parameter support
export async function enhancedEnvelopeEncrypt(data, publicKeyPem, options = {}) {
  const { 
    aesMode = 'GCM', 
    aesKeySize = 256, 
    rsaHash = 'SHA-256',
    compression = false,
    associatedData
  } = options;
  
  try {
    // Generate AES key
    const cipher = new AESCipher('', { mode: aesMode, keySize: aesKeySize });
    const aesKeyBytes = await cipher.generateKey();
    const aesKeyBase64 = btoa(String.fromCharCode(...aesKeyBytes));
    
    // Optionally compress data
    let processedData = data;
    if (compression) {
      // Implement compression if needed
      processedData = data; // Placeholder
    }
    
    // Encrypt data with AES
    cipher.key = aesKeyBytes;
    const aesResult = await cipher.encrypt(processedData, { associatedData });
    
    // Encrypt AES key with RSA
    const { rsaEncrypt } = await import('../crypto.js');
    const encryptedAESKey = await rsaEncrypt(aesKeyBase64, publicKeyPem);
    
    // Create envelope format
    const envelope = {
      encryptedKey: encryptedAESKey,
      iv: btoa(String.fromCharCode(...aesResult.iv)),
      data: btoa(String.fromCharCode(...aesResult.data)),
      mode: aesMode,
      keySize: aesKeySize,
      compression: compression,
      associatedData: associatedData
    };
    
    return JSON.stringify(envelope);
  } catch (error) {
    throw new Error(`Enhanced envelope encryption error: ${error.message}`);
  }
}

export async function enhancedEnvelopeDecrypt(envelopeData, privateKeyPem, options = {}) {
  try {
    const envelope = JSON.parse(envelopeData);
    
    // Decrypt AES key with RSA
    const { rsaDecrypt } = await import('../crypto.js');
    const aesKeyBase64 = await rsaDecrypt(envelope.encryptedKey, privateKeyPem);
    const aesKeyBytes = new Uint8Array(atob(aesKeyBase64).split('').map(c => c.charCodeAt(0)));
    
    // Decrypt data with AES
    const cipher = new AESCipher(aesKeyBytes, { 
      mode: envelope.mode || 'GCM', 
      keySize: envelope.keySize || 256 
    });
    
    const ivBytes = new Uint8Array(atob(envelope.iv).split('').map(c => c.charCodeAt(0)));
    const dataBytes = new Uint8Array(atob(envelope.data).split('').map(c => c.charCodeAt(0)));
    
    const decryptedData = await cipher.decrypt(dataBytes, ivBytes, {
      associatedData: envelope.associatedData
    });
    
    // Optionally decompress
    if (envelope.compression) {
      // Implement decompression if needed
      return decryptedData; // Placeholder
    }
    
    return decryptedData;
  } catch (error) {
    throw new Error(`Enhanced envelope decryption error: ${error.message}`);
  }
}

function formatOutput(bytes, format) {
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

