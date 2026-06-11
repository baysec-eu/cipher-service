// Proper DES Implementation
// Based on the Data Encryption Standard (FIPS 46-3)

// DES constants
const IP = [
  58, 50, 42, 34, 26, 18, 10,  2,
  60, 52, 44, 36, 28, 20, 12,  4,
  62, 54, 46, 38, 30, 22, 14,  6,
  64, 56, 48, 40, 32, 24, 16,  8,
  57, 49, 41, 33, 25, 17,  9,  1,
  59, 51, 43, 35, 27, 19, 11,  3,
  61, 53, 45, 37, 29, 21, 13,  5,
  63, 55, 47, 39, 31, 23, 15,  7
];

const FP = [
  40,  8, 48, 16, 56, 24, 64, 32,
  39,  7, 47, 15, 55, 23, 63, 31,
  38,  6, 46, 14, 54, 22, 62, 30,
  37,  5, 45, 13, 53, 21, 61, 29,
  36,  4, 44, 12, 52, 20, 60, 28,
  35,  3, 43, 11, 51, 19, 59, 27,
  34,  2, 42, 10, 50, 18, 58, 26,
  33,  1, 41,  9, 49, 17, 57, 25
];

const E = [
  32,  1,  2,  3,  4,  5,
   4,  5,  6,  7,  8,  9,
   8,  9, 10, 11, 12, 13,
  12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21,
  20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29,
  28, 29, 30, 31, 32,  1
];

const P = [
  16,  7, 20, 21, 29, 12, 28, 17,
   1, 15, 23, 26,  5, 18, 31, 10,
   2,  8, 24, 14, 32, 27,  3,  9,
  19, 13, 30,  6, 22, 11,  4, 25
];

const PC1 = [
  57, 49, 41, 33, 25, 17,  9,
   1, 58, 50, 42, 34, 26, 18,
  10,  2, 59, 51, 43, 35, 27,
  19, 11,  3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15,
   7, 62, 54, 46, 38, 30, 22,
  14,  6, 61, 53, 45, 37, 29,
  21, 13,  5, 28, 20, 12,  4
];

const PC2 = [
  14, 17, 11, 24,  1,  5,
   3, 28, 15,  6, 21, 10,
  23, 19, 12,  4, 26,  8,
  16,  7, 27, 20, 13,  2,
  41, 52, 31, 37, 47, 55,
  30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53,
  46, 42, 50, 36, 29, 32
];

const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

// S-boxes (FIPS 46-3)
const S = [
  // S1
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
  ],
  // S2
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
  ],
  // S3
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
  ],
  // S4
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
  ],
  // S5
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
  ],
  // S6
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
  ],
  // S7
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
  ],
  // S8
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 2, 0, 14, 9, 11],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
  ]
];

export class DESCipher {
  constructor(key) {
    this.key = this.prepareKey(key);
    this.subkeys = this.generateSubkeys(this.key);
  }
  
  prepareKey(key) {
    const keyBytes = new TextEncoder().encode(key);
    const prepared = new Uint8Array(8);
    
    // Pad or truncate key to 8 bytes
    for (let i = 0; i < 8; i++) {
      prepared[i] = i < keyBytes.length ? keyBytes[i] : 0;
    }
    
    return prepared;
  }
  
  generateSubkeys(key) {
    const subkeys = [];
    
    // Convert key to 64-bit number for easier manipulation
    let keyBits = this.bytesToBits(key);
    
    // PC1 permutation
    let permutedKey = this.permute(keyBits, PC1, 56);
    
    // Split into left and right halves
    let left = permutedKey >>> 28;
    let right = permutedKey & 0x0FFFFFFF;
    
    for (let i = 0; i < 16; i++) {
      // Rotate left and right halves
      left = this.rotateLeft(left, SHIFTS[i], 28);
      right = this.rotateLeft(right, SHIFTS[i], 28);
      
      // Combine and apply PC2
      const combined = ((left << 28) | right) >>> 0;
      subkeys[i] = this.permute(combined, PC2, 48);
    }
    
    return subkeys;
  }
  
  bytesToBits(bytes) {
    let result = 0;
    for (let i = 0; i < bytes.length; i++) {
      result = (result << 8) | bytes[i];
    }
    return result >>> 0;
  }
  
  bitsToBytes(bits, numBytes) {
    const bytes = new Uint8Array(numBytes);
    for (let i = numBytes - 1; i >= 0; i--) {
      bytes[i] = bits & 0xFF;
      bits >>>= 8;
    }
    return bytes;
  }
  
  permute(input, table, outputBits) {
    let result = 0;
    for (let i = 0; i < outputBits; i++) {
      const bit = (input >>> (64 - table[i])) & 1;
      result = (result << 1) | bit;
    }
    return result >>> 0;
  }
  
  rotateLeft(value, shifts, bits) {
    const mask = (1 << bits) - 1;
    return ((value << shifts) | (value >>> (bits - shifts))) & mask;
  }
  
  feistel(right, subkey) {
    // Expansion permutation
    const expanded = this.permute(right, E, 48);
    
    // XOR with subkey
    const xored = expanded ^ subkey;
    
    // S-box substitution
    let substituted = 0;
    for (let i = 0; i < 8; i++) {
      const chunk = (xored >>> (42 - i * 6)) & 0x3F;
      const row = ((chunk & 0x20) >>> 4) | (chunk & 0x01);
      const col = (chunk & 0x1E) >>> 1;

      const sValue = S[i][row][col];
      substituted = (substituted << 4) | sValue;
    }
    
    // P permutation
    return this.permute(substituted, P, 32);
  }
  
  encryptBlock(block) {
    // Initial permutation
    let data = this.permute(this.bytesToBits(block), IP, 64);
    
    // Split into left and right halves
    let left = data >>> 32;
    let right = data & 0xFFFFFFFF;
    
    // 16 rounds of Feistel
    for (let i = 0; i < 16; i++) {
      const temp = right;
      right = left ^ this.feistel(right, this.subkeys[i]);
      left = temp;
    }
    
    // Combine halves (right, left for DES)
    const combined = ((right << 32) | left) >>> 0;
    
    // Final permutation
    const result = this.permute(combined, FP, 64);
    
    return this.bitsToBytes(result, 8);
  }
  
  decryptBlock(block) {
    // Initial permutation
    let data = this.permute(this.bytesToBits(block), IP, 64);
    
    // Split into left and right halves
    let left = data >>> 32;
    let right = data & 0xFFFFFFFF;
    
    // 16 rounds of Feistel (reverse order for decryption)
    for (let i = 15; i >= 0; i--) {
      const temp = right;
      right = left ^ this.feistel(right, this.subkeys[i]);
      left = temp;
    }
    
    // Combine halves (right, left for DES)
    const combined = ((right << 32) | left) >>> 0;
    
    // Final permutation
    const result = this.permute(combined, FP, 64);
    
    return this.bitsToBytes(result, 8);
  }
  
  encrypt(plaintext, mode = 'ECB') {
    const paddedData = this.addPKCS7Padding(new TextEncoder().encode(plaintext), 8);
    const result = [];
    
    for (let i = 0; i < paddedData.length; i += 8) {
      const block = paddedData.slice(i, i + 8);
      const encrypted = this.encryptBlock(block);
      result.push(...encrypted);
    }
    
    return new Uint8Array(result);
  }
  
  decrypt(ciphertext, mode = 'ECB') {
    const result = [];
    
    for (let i = 0; i < ciphertext.length; i += 8) {
      const block = ciphertext.slice(i, i + 8);
      const decrypted = this.decryptBlock(block);
      result.push(...decrypted);
    }
    
    const decrypted = new Uint8Array(result);
    const unpadded = this.removePKCS7Padding(decrypted);
    return new TextDecoder().decode(unpadded);
  }
  
  addPKCS7Padding(data, blockSize) {
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

export function desEncrypt(plaintext, key, options = {}) {
  const { outputFormat = 'hex' } = options;
  
  try {
    const des = new DESCipher(key);
    const encrypted = des.encrypt(plaintext);
    
    switch (outputFormat) {
      case 'hex':
        return Array.from(encrypted)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      case 'base64':
        return btoa(String.fromCharCode(...encrypted));
      case 'bytes':
        return encrypted;
      default:
        return Array.from(encrypted)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
    }
  } catch (error) {
    throw new Error(`DES encryption error: ${error.message}`);
  }
}

export function desDecrypt(ciphertext, key, options = {}) {
  const { inputFormat = 'hex' } = options;
  
  try {
    let bytes;
    
    switch (inputFormat) {
      case 'hex':
        if (ciphertext.length % 2 !== 0) {
          throw new Error('Invalid hex string length');
        }
        bytes = new Uint8Array(
          ciphertext.match(/.{2}/g).map(byte => parseInt(byte, 16))
        );
        break;
      case 'base64':
        const binaryString = atob(ciphertext);
        bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        break;
      case 'bytes':
        bytes = new Uint8Array(ciphertext);
        break;
      default:
        throw new Error(`Unsupported input format: ${inputFormat}`);
    }
    
    const des = new DESCipher(key);
    return des.decrypt(bytes);
  } catch (error) {
    throw new Error(`DES decryption error: ${error.message}`);
  }
}

// TripleDES implementation
export class TripleDESCipher {
  constructor(key) {
    const keyBytes = new TextEncoder().encode(key);
    
    if (keyBytes.length >= 24) {
      // 3DES with 3 different keys
      this.des1 = new DESCipher(keyBytes.slice(0, 8));
      this.des2 = new DESCipher(keyBytes.slice(8, 16));
      this.des3 = new DESCipher(keyBytes.slice(16, 24));
    } else if (keyBytes.length >= 16) {
      // 3DES with 2 keys (K1, K2, K1)
      this.des1 = new DESCipher(keyBytes.slice(0, 8));
      this.des2 = new DESCipher(keyBytes.slice(8, 16));
      this.des3 = new DESCipher(keyBytes.slice(0, 8));
    } else {
      // Use same key for all three operations (not recommended)
      const paddedKey = new Uint8Array(8);
      paddedKey.set(keyBytes.slice(0, 8));
      this.des1 = new DESCipher(paddedKey);
      this.des2 = new DESCipher(paddedKey);
      this.des3 = new DESCipher(paddedKey);
    }
  }
  
  encryptBlock(block) {
    // EDE: Encrypt -> Decrypt -> Encrypt
    const step1 = this.des1.encryptBlock(block);
    const step2 = this.des2.decryptBlock(step1);
    return this.des3.encryptBlock(step2);
  }
  
  decryptBlock(block) {
    // DED: Decrypt -> Encrypt -> Decrypt
    const step1 = this.des3.decryptBlock(block);
    const step2 = this.des2.encryptBlock(step1);
    return this.des1.decryptBlock(step2);
  }
  
  encrypt(plaintext) {
    const paddedData = this.des1.addPKCS7Padding(new TextEncoder().encode(plaintext), 8);
    const result = [];
    
    for (let i = 0; i < paddedData.length; i += 8) {
      const block = paddedData.slice(i, i + 8);
      const encrypted = this.encryptBlock(block);
      result.push(...encrypted);
    }
    
    return new Uint8Array(result);
  }
  
  decrypt(ciphertext) {
    const result = [];
    
    for (let i = 0; i < ciphertext.length; i += 8) {
      const block = ciphertext.slice(i, i + 8);
      const decrypted = this.decryptBlock(block);
      result.push(...decrypted);
    }
    
    const decrypted = new Uint8Array(result);
    const unpadded = this.des1.removePKCS7Padding(decrypted);
    return new TextDecoder().decode(unpadded);
  }
}

export function tripleDesEncrypt(plaintext, key, options = {}) {
  const { outputFormat = 'hex' } = options;
  
  try {
    const des3 = new TripleDESCipher(key);
    const encrypted = des3.encrypt(plaintext);
    
    switch (outputFormat) {
      case 'hex':
        return Array.from(encrypted)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      case 'base64':
        return btoa(String.fromCharCode(...encrypted));
      case 'bytes':
        return encrypted;
      default:
        return Array.from(encrypted)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
    }
  } catch (error) {
    throw new Error(`3DES encryption error: ${error.message}`);
  }
}

export function tripleDesDecrypt(ciphertext, key, options = {}) {
  const { inputFormat = 'hex' } = options;
  
  try {
    let bytes;
    
    switch (inputFormat) {
      case 'hex':
        bytes = new Uint8Array(
          ciphertext.match(/.{2}/g).map(byte => parseInt(byte, 16))
        );
        break;
      case 'base64':
        const binaryString = atob(ciphertext);
        bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        break;
      case 'bytes':
        bytes = new Uint8Array(ciphertext);
        break;
      default:
        throw new Error(`Unsupported input format: ${inputFormat}`);
    }
    
    const des3 = new TripleDESCipher(key);
    return des3.decrypt(bytes);
  } catch (error) {
    throw new Error(`3DES decryption error: ${error.message}`);
  }
}

// Export operations for the encoder system
export const desEncryptOperation = {
  id: 'des_encrypt',
  name: 'DES Encrypt',
  type: 'cipher',
  description: 'Encrypt using DES (Data Encryption Standard)',
  params: [
    {
      name: 'key',
      type: 'string',
      default: 'secretkey',
      description: 'Encryption key (8 bytes)'
    },
    {
      name: 'outputFormat',
      type: 'select',
      options: ['hex', 'base64'],
      default: 'hex',
      description: 'Output format'
    }
  ],
  operation: (input, params) => desEncrypt(input, params.key, params)
};

export const desDecryptOperation = {
  id: 'des_decrypt',
  name: 'DES Decrypt',
  type: 'cipher',
  description: 'Decrypt DES encrypted data',
  params: [
    {
      name: 'key',
      type: 'string',
      default: 'secretkey',
      description: 'Decryption key'
    },
    {
      name: 'inputFormat',
      type: 'select',
      options: ['hex', 'base64'],
      default: 'hex',
      description: 'Input format'
    }
  ],
  operation: (input, params) => desDecrypt(input, params.key, params)
};

export const tripleDesEncryptOperation = {
  id: 'tripledes_encrypt',
  name: '3DES Encrypt',
  type: 'cipher',
  description: 'Encrypt using Triple DES (3DES)',
  params: [
    {
      name: 'key',
      type: 'string',
      default: 'secretkeysecretkeysecretkey',
      description: 'Encryption key (16 or 24 bytes)'
    },
    {
      name: 'outputFormat',
      type: 'select',
      options: ['hex', 'base64'],
      default: 'hex',
      description: 'Output format'
    }
  ],
  operation: (input, params) => tripleDesEncrypt(input, params.key, params)
};

export const tripleDesDecryptOperation = {
  id: 'tripledes_decrypt',
  name: '3DES Decrypt',
  type: 'cipher',
  description: 'Decrypt Triple DES encrypted data',
  params: [
    {
      name: 'key',
      type: 'string',
      default: 'secretkeysecretkeysecretkey',
      description: 'Decryption key'
    },
    {
      name: 'inputFormat',
      type: 'select',
      options: ['hex', 'base64'],
      default: 'hex',
      description: 'Input format'
    }
  ],
  operation: (input, params) => tripleDesDecrypt(input, params.key, params)
};