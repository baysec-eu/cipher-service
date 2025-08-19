import { DESCipher } from '../cipher/desFixed.js';

// Traditional Unix DES-based crypt(3) implementation
export function hashDesCrypt(password, salt = null) {
  // Generate salt if not provided
  if (!salt) {
    const chars = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    salt = Array.from({ length: 2 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } else if (salt.length > 2) {
    salt = salt.substring(0, 2);
  }
  
  // Convert password to 8-byte key (truncate or pad with nulls)
  const passwordBytes = new TextEncoder().encode(password.substring(0, 8).padEnd(8, '\0'));
  
  // Expand password bits with parity
  const key = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    key[i] = passwordBytes[i] & 0x7f;
  }
  
  // Setup the key with salt modifications
  const cipher = new DESCipher(key);
  
  // Apply salt perturbations
  const saltBits = decodeSalt(salt);
  
  // Traditional DES crypt encrypts all zeros 25 times
  let block = new Uint8Array(8); // All zeros
  
  // Perform 25 iterations of modified DES
  for (let i = 0; i < 25; i++) {
    // Apply salt-based bit swaps in E-box expansion
    const modifiedBlock = applySaltPerturbation(block, saltBits);
    block = cipher.encryptBlock(modifiedBlock);
  }
  
  // Convert final block to crypt base64
  return salt + encodeCryptBase64(block);
}

// Decode 2-character salt to 12-bit value
function decodeSalt(salt) {
  const decodeChar = (c) => {
    const code = c.charCodeAt(0);
    if (code >= 46 && code <= 47) return code - 46;      // ./
    if (code >= 48 && code <= 57) return code - 46;      // 0-9
    if (code >= 65 && code <= 90) return code - 53;      // A-Z
    if (code >= 97 && code <= 122) return code - 59;     // a-z
    return 0;
  };
  
  const s1 = decodeChar(salt[0]);
  const s2 = decodeChar(salt[1]);
  return (s1 << 6) | s2;
}

// Apply salt-based perturbation to DES E-box
function applySaltPerturbation(block, saltBits) {
  // In traditional DES crypt, salt affects the E-box expansion
  // This is a simplified version that XORs salt bits appropriately
  const result = new Uint8Array(block);
  
  // Apply salt bits across the block
  for (let i = 0; i < 8; i++) {
    if (saltBits & (1 << (i % 12))) {
      result[i] ^= 0x01;
    }
  }
  
  return result;
}

// Encode 8-byte block to crypt's modified base64
function encodeCryptBase64(block) {
  const chars = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  
  // Convert 64 bits to 11 base64 characters (66 bits with padding)
  const bits = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 7; j >= 0; j--) {
      bits.push((block[i] >> j) & 1);
    }
  }
  
  // Add padding bits
  bits.push(0, 0);
  
  // Convert to base64
  for (let i = 0; i < 11; i++) {
    let val = 0;
    for (let j = 0; j < 6; j++) {
      val = (val << 1) | bits[i * 6 + j];
    }
    result += chars[val];
  }
  
  return result;
}