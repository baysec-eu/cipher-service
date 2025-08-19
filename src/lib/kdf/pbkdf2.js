// PBKDF2 (Password-Based Key Derivation Function 2)
// Based on RFC 2898

const cryptoAPI = globalThis.crypto || (typeof window !== 'undefined' ? window.crypto : null);

export async function pbkdf2(password, salt, iterations, length, hash = 'SHA-256') {
  if (!cryptoAPI || !cryptoAPI.subtle) {
    throw new Error('Web Crypto API not available');
  }
  
  try {
    // Convert inputs to appropriate types
    const passwordBytes = typeof password === 'string' ? new TextEncoder().encode(password) : new Uint8Array(password);
    const saltBytes = salt ? (typeof salt === 'string' ? new TextEncoder().encode(salt) : new Uint8Array(salt)) : cryptoAPI.getRandomValues(new Uint8Array(16));
    
    // Import password as key material
    const passwordKey = await cryptoAPI.subtle.importKey(
      'raw',
      passwordBytes,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Derive bits
    const derivedBits = await cryptoAPI.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: iterations || 100000,
        hash: hash
      },
      passwordKey,
      length * 8 // Convert bytes to bits
    );
    
    return new Uint8Array(derivedBits);
  } catch (error) {
    throw new Error(`PBKDF2 derivation failed: ${error.message}`);
  }
}

// Helper function to derive an AES key from password
export async function pbkdf2DeriveKey(password, salt, iterations, keyAlgorithm, hash = 'SHA-256') {
  if (!cryptoAPI || !cryptoAPI.subtle) {
    throw new Error('Web Crypto API not available');
  }
  
  try {
    const passwordBytes = typeof password === 'string' ? new TextEncoder().encode(password) : new Uint8Array(password);
    const saltBytes = salt ? (typeof salt === 'string' ? new TextEncoder().encode(salt) : new Uint8Array(salt)) : cryptoAPI.getRandomValues(new Uint8Array(16));
    
    const passwordKey = await cryptoAPI.subtle.importKey(
      'raw',
      passwordBytes,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    const derivedKey = await cryptoAPI.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: iterations || 100000,
        hash: hash
      },
      passwordKey,
      keyAlgorithm,
      true,
      keyAlgorithm.name === 'AES-GCM' ? ['encrypt', 'decrypt'] : ['sign', 'verify']
    );
    
    return derivedKey;
  } catch (error) {
    throw new Error(`PBKDF2 key derivation failed: ${error.message}`);
  }
}

// Convenience functions for different hash algorithms
export async function pbkdf2Sha1(password, salt, iterations, length) {
  return pbkdf2(password, salt, iterations, length, 'SHA-1');
}

export async function pbkdf2Sha256(password, salt, iterations, length) {
  return pbkdf2(password, salt, iterations, length, 'SHA-256');
}

export async function pbkdf2Sha512(password, salt, iterations, length) {
  return pbkdf2(password, salt, iterations, length, 'SHA-512');
}