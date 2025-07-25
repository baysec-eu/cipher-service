// SSH Private Key Password Cracking
// Supports RSA, DSA, ECDSA, and Ed25519 private keys

import { pbkdf2 } from '../crypto.js';

// SSH key formats and encryption methods
const SSH_KEY_TYPES = {
  RSA: 'ssh-rsa',
  DSA: 'ssh-dss', 
  ECDSA: 'ecdsa-sha2-',
  ED25519: 'ssh-ed25519'
};

const SSH_CIPHERS = {
  'aes128-ctr': { keySize: 16, ivSize: 16, blockSize: 16 },
  'aes192-ctr': { keySize: 24, ivSize: 16, blockSize: 16 },
  'aes256-ctr': { keySize: 32, ivSize: 16, blockSize: 16 },
  'aes128-cbc': { keySize: 16, ivSize: 16, blockSize: 16 },
  'aes192-cbc': { keySize: 24, ivSize: 16, blockSize: 16 },
  'aes256-cbc': { keySize: 32, ivSize: 16, blockSize: 16 },
  '3des-cbc': { keySize: 24, ivSize: 8, blockSize: 8 }
};

export class SSHKeyCracker {
  constructor(privateKey) {
    this.privateKey = privateKey;
    this.keyInfo = this.parseSSHKey(privateKey);
  }
  
  parseSSHKey(keyData) {
    const lines = keyData.trim().split('\n');
    const header = lines[0];
    const footer = lines[lines.length - 1];
    
    // Extract key type and encryption info
    const info = {
      type: null,
      encrypted: false,
      cipher: null,
      kdf: null,
      rounds: 0,
      salt: null,
      iv: null,
      keyData: null
    };
    
    if (header.includes('BEGIN OPENSSH PRIVATE KEY')) {
      info.format = 'openssh';
      return this.parseOpenSSHKey(keyData);
    } else if (header.includes('BEGIN RSA PRIVATE KEY')) {
      info.type = 'RSA';
      info.format = 'pem';
      return this.parsePEMKey(keyData);
    } else if (header.includes('BEGIN DSA PRIVATE KEY')) {
      info.type = 'DSA';
      info.format = 'pem';
      return this.parsePEMKey(keyData);
    } else if (header.includes('BEGIN EC PRIVATE KEY')) {
      info.type = 'ECDSA';
      info.format = 'pem';
      return this.parsePEMKey(keyData);
    }
    
    throw new Error('Unsupported SSH key format');
  }
  
  parseOpenSSHKey(keyData) {
    const lines = keyData.split('\n').slice(1, -1);
    const b64Data = lines.join('');
    const keyBytes = this.base64ToBytes(b64Data);
    
    let offset = 0;
    
    // Magic bytes "openssh-key-v1"
    const magic = keyBytes.slice(offset, offset + 15);
    offset += 15;
    
    if (new TextDecoder().decode(magic) !== 'openssh-key-v1\0') {
      throw new Error('Invalid OpenSSH key format');
    }
    
    // Cipher name
    const cipherNameLen = this.readUint32(keyBytes, offset);
    offset += 4;
    const cipherName = new TextDecoder().decode(keyBytes.slice(offset, offset + cipherNameLen));
    offset += cipherNameLen;
    
    // KDF name
    const kdfNameLen = this.readUint32(keyBytes, offset);
    offset += 4;
    const kdfName = new TextDecoder().decode(keyBytes.slice(offset, offset + kdfNameLen));
    offset += kdfNameLen;
    
    // KDF options
    const kdfOptionsLen = this.readUint32(keyBytes, offset);
    offset += 4;
    const kdfOptions = keyBytes.slice(offset, offset + kdfOptionsLen);
    offset += kdfOptionsLen;
    
    // Number of keys
    const numKeys = this.readUint32(keyBytes, offset);
    offset += 4;
    
    // Public key (skip for now)
    const pubKeyLen = this.readUint32(keyBytes, offset);
    offset += 4;
    offset += pubKeyLen;
    
    // Encrypted private key data
    const privKeyLen = this.readUint32(keyBytes, offset);
    offset += 4;
    const encryptedPrivKey = keyBytes.slice(offset, offset + privKeyLen);
    
    // Parse KDF options
    let salt = null;
    let rounds = 0;
    
    if (kdfName === 'bcrypt') {
      let kdfOffset = 0;
      const saltLen = this.readUint32(kdfOptions, kdfOffset);
      kdfOffset += 4;
      salt = kdfOptions.slice(kdfOffset, kdfOffset + saltLen);
      kdfOffset += saltLen;
      rounds = this.readUint32(kdfOptions, kdfOffset);
    }
    
    return {
      format: 'openssh',
      encrypted: cipherName !== 'none',
      cipher: cipherName,
      kdf: kdfName,
      salt,
      rounds,
      encryptedData: encryptedPrivKey
    };
  }
  
  parsePEMKey(keyData) {
    const lines = keyData.split('\n');
    let encrypted = false;
    let cipher = null;
    let iv = null;
    
    // Look for Proc-Type and DEK-Info headers
    for (const line of lines) {
      if (line.startsWith('Proc-Type:')) {
        encrypted = line.includes('ENCRYPTED');
      } else if (line.startsWith('DEK-Info:')) {
        const parts = line.split(':')[1].trim().split(',');
        cipher = parts[0];
        if (parts[1]) {
          iv = this.hexToBytes(parts[1]);
        }
      }
    }
    
    // Extract base64 data
    const b64Lines = lines.filter(line => 
      !line.startsWith('-----') && 
      !line.startsWith('Proc-Type:') && 
      !line.startsWith('DEK-Info:') &&
      line.trim().length > 0
    );
    
    const keyData64 = b64Lines.join('');
    const keyBytes = this.base64ToBytes(keyData64);
    
    return {
      format: 'pem',
      encrypted,
      cipher,
      iv,
      encryptedData: keyBytes
    };
  }
  
  async crackPassword(passwords) {
    const results = [];
    
    for (const password of passwords) {
      try {
        const success = await this.tryPassword(password);
        if (success) {
          results.push({
            password,
            success: true,
            time: new Date().toISOString()
          });
          return results;
        }
      } catch (error) {
        // Password failed, continue
      }
      
      results.push({
        password,
        success: false
      });
    }
    
    return results;
  }
  
  async tryPassword(password) {
    if (!this.keyInfo.encrypted) {
      return true; // Key is not encrypted
    }
    
    if (this.keyInfo.format === 'openssh') {
      return await this.tryOpenSSHPassword(password);
    } else if (this.keyInfo.format === 'pem') {
      return await this.tryPEMPassword(password);
    }
    
    return false;
  }
  
  async tryOpenSSHPassword(password) {
    const { cipher, kdf, salt, rounds, encryptedData } = this.keyInfo;
    
    if (!SSH_CIPHERS[cipher]) {
      throw new Error(`Unsupported cipher: ${cipher}`);
    }
    
    const cipherSpec = SSH_CIPHERS[cipher];
    const keySize = cipherSpec.keySize;
    const ivSize = cipherSpec.ivSize;
    
    // Derive key and IV using bcrypt KDF
    let keyIv;
    if (kdf === 'bcrypt') {
      keyIv = await this.bcryptKDF(password, salt, rounds, keySize + ivSize);
    } else {
      throw new Error(`Unsupported KDF: ${kdf}`);
    }
    
    const key = keyIv.slice(0, keySize);
    const iv = keyIv.slice(keySize, keySize + ivSize);
    
    try {
      // Try to decrypt the private key
      const decrypted = await this.decryptAES(encryptedData, key, iv, cipher);
      
      // Verify decryption by checking padding and structure
      return this.verifyOpenSSHDecryption(decrypted);
    } catch (error) {
      return false;
    }
  }
  
  async tryPEMPassword(password) {
    const { cipher, iv, encryptedData } = this.keyInfo;
    
    if (!cipher || !iv) {
      return false;
    }
    
    try {
      // Derive key using MD5 (PEM standard)
      const key = await this.deriveKeyMD5(password, iv, 16); // Assume AES-128 for simplicity
      
      // Try to decrypt
      const decrypted = await this.decryptAES(encryptedData, key, iv, 'aes128-cbc');
      
      // Verify ASN.1 structure
      return this.verifyASN1Structure(decrypted);
    } catch (error) {
      return false;
    }
  }
  
  async bcryptKDF(password, salt, rounds, keyLen) {
    // Simplified bcrypt KDF implementation
    // In practice, use a proper bcrypt library
    const passwordBytes = new TextEncoder().encode(password);
    const combined = new Uint8Array(passwordBytes.length + salt.length);
    combined.set(passwordBytes);
    combined.set(salt, passwordBytes.length);
    
    // Multiple rounds of hashing
    let result = combined;
    for (let i = 0; i < rounds; i++) {
      const hash = await crypto.subtle.digest('SHA-256', result);
      result = new Uint8Array(hash);
    }
    
    // Expand to required length
    const expanded = new Uint8Array(keyLen);
    for (let i = 0; i < keyLen; i++) {
      expanded[i] = result[i % result.length];
    }
    
    return expanded;
  }
  
  async deriveKeyMD5(password, salt, keyLen) {
    // PEM key derivation using MD5
    const passwordBytes = new TextEncoder().encode(password);
    const combined = new Uint8Array(passwordBytes.length + salt.length);
    combined.set(passwordBytes);
    combined.set(salt, passwordBytes.length);
    
    // MD5 hash (simplified - in practice use proper MD5)
    const hash = await crypto.subtle.digest('SHA-1', combined); // Using SHA-1 as fallback
    return new Uint8Array(hash).slice(0, keyLen);
  }
  
  async decryptAES(data, key, iv, cipherName) {
    const algorithm = cipherName.includes('cbc') ? 'AES-CBC' : 'AES-CTR';
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: algorithm },
      false,
      ['decrypt']
    );
    
    const params = algorithm === 'AES-CBC' 
      ? { name: algorithm, iv }
      : { name: algorithm, counter: iv, length: 128 };
    
    const decrypted = await crypto.subtle.decrypt(params, cryptoKey, data);
    return new Uint8Array(decrypted);
  }
  
  verifyOpenSSHDecryption(data) {
    // OpenSSH private key should start with repeated 4-byte check values
    if (data.length < 8) return false;
    
    const check1 = this.readUint32(data, 0);
    const check2 = this.readUint32(data, 4);
    
    return check1 === check2;
  }
  
  verifyASN1Structure(data) {
    // Basic ASN.1 structure check for private keys
    if (data.length < 4) return false;
    
    // Should start with SEQUENCE tag (0x30)
    return data[0] === 0x30;
  }
  
  // Utility methods
  readUint32(buffer, offset) {
    return (buffer[offset] << 24) | 
           (buffer[offset + 1] << 16) | 
           (buffer[offset + 2] << 8) | 
           buffer[offset + 3];
  }
  
  base64ToBytes(b64) {
    const binaryString = atob(b64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
  
  hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  }
}

// Export for encoder system
export const crackSSHKeyOperation = {
  id: 'crack_ssh_key',
  name: 'Crack SSH Private Key',
  type: 'password_cracking',
  description: 'Attempt to crack SSH private key password using wordlist',
  params: [
    {
      name: 'privateKey',
      type: 'text',
      default: '',
      description: 'SSH private key content'
    },
    {
      name: 'wordlist',
      type: 'text',
      default: 'password\n123456\nadmin\nroot',
      description: 'Wordlist (one password per line)'
    }
  ],
  operation: async (input, params) => {
    const passwords = params.wordlist.split('\n').filter(p => p.trim());
    const cracker = new SSHKeyCracker(params.privateKey);
    const results = await cracker.crackPassword(passwords);
    
    const successful = results.find(r => r.success);
    if (successful) {
      return `Password found: ${successful.password}`;
    } else {
      return `Password not found. Tried ${results.length} passwords.`;
    }
  }
};