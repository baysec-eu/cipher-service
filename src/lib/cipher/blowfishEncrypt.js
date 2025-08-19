import { BlowfishCipher } from './blowfishFixed.js';

// Blowfish encryption wrapper
export function blowfishEncrypt(plaintext, key, outputFormat = 'hex') {
  try {
    // Create Blowfish cipher instance
    const cipher = new BlowfishCipher(key);
    
    // Convert plaintext to bytes
    const plaintextBytes = typeof plaintext === 'string' 
      ? new TextEncoder().encode(plaintext)
      : new Uint8Array(plaintext);
    
    // Pad to 8-byte blocks
    const blockSize = 8;
    const paddedLength = Math.ceil(plaintextBytes.length / blockSize) * blockSize;
    const padded = new Uint8Array(paddedLength);
    padded.set(plaintextBytes);
    
    // Apply PKCS#5 padding
    const paddingValue = paddedLength - plaintextBytes.length || blockSize;
    for (let i = plaintextBytes.length; i < paddedLength; i++) {
      padded[i] = paddingValue;
    }
    
    // Encrypt block by block
    const encrypted = new Uint8Array(paddedLength);
    for (let i = 0; i < paddedLength; i += blockSize) {
      const block = padded.slice(i, i + blockSize);
      const encryptedBlock = cipher.encryptBlock(block);
      encrypted.set(encryptedBlock, i);
    }
    
    // Format output
    switch (outputFormat) {
      case 'hex':
        return Array.from(encrypted).map(b => b.toString(16).padStart(2, '0')).join('');
      case 'base64':
        return btoa(String.fromCharCode(...encrypted));
      case 'bytes':
        return encrypted;
      default:
        return Array.from(encrypted).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    throw new Error(`Blowfish encryption failed: ${error.message}`);
  }
}

// Export additional helper functions
export function blowfishEncryptECB(plaintext, key, outputFormat = 'hex') {
  return blowfishEncrypt(plaintext, key, outputFormat);
}

export function blowfishEncryptCBC(plaintext, key, iv = null, outputFormat = 'hex') {
  try {
    const cipher = new BlowfishCipher(key);
    const blockSize = 8;
    
    // Generate IV if not provided
    if (!iv) {
      iv = crypto.getRandomValues(new Uint8Array(blockSize));
    } else if (typeof iv === 'string') {
      if (iv.match(/^[0-9a-fA-F]+$/)) {
        iv = new Uint8Array(iv.match(/.{2}/g).map(byte => parseInt(byte, 16)));
      } else {
        iv = new TextEncoder().encode(iv).slice(0, blockSize);
      }
    }
    
    // Ensure IV is correct size
    if (iv.length < blockSize) {
      const paddedIv = new Uint8Array(blockSize);
      paddedIv.set(iv);
      iv = paddedIv;
    }
    
    // Convert plaintext to bytes
    const plaintextBytes = typeof plaintext === 'string' 
      ? new TextEncoder().encode(plaintext)
      : new Uint8Array(plaintext);
    
    // Pad to block size
    const paddedLength = Math.ceil(plaintextBytes.length / blockSize) * blockSize;
    const padded = new Uint8Array(paddedLength);
    padded.set(plaintextBytes);
    
    // Apply PKCS#5 padding
    const paddingValue = paddedLength - plaintextBytes.length || blockSize;
    for (let i = plaintextBytes.length; i < paddedLength; i++) {
      padded[i] = paddingValue;
    }
    
    // CBC mode encryption
    const encrypted = new Uint8Array(paddedLength);
    let previousBlock = iv;
    
    for (let i = 0; i < paddedLength; i += blockSize) {
      const block = padded.slice(i, i + blockSize);
      
      // XOR with previous ciphertext block
      const xored = new Uint8Array(blockSize);
      for (let j = 0; j < blockSize; j++) {
        xored[j] = block[j] ^ previousBlock[j];
      }
      
      const encryptedBlock = cipher.encryptBlock(xored);
      encrypted.set(encryptedBlock, i);
      previousBlock = encryptedBlock;
    }
    
    // Prepend IV to ciphertext
    const result = new Uint8Array(iv.length + encrypted.length);
    result.set(iv);
    result.set(encrypted, iv.length);
    
    // Format output
    switch (outputFormat) {
      case 'hex':
        return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
      case 'base64':
        return btoa(String.fromCharCode(...result));
      case 'bytes':
        return result;
      default:
        return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    throw new Error(`Blowfish CBC encryption failed: ${error.message}`);
  }
}