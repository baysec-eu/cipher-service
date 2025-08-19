// HKDF (HMAC-based Extract-and-Expand Key Derivation Function)
// Based on RFC 5869

const cryptoAPI = globalThis.crypto || (typeof window !== 'undefined' ? window.crypto : null);

export async function hkdf(ikm, salt, info, length, hash = 'SHA-256') {
  if (!cryptoAPI || !cryptoAPI.subtle) {
    throw new Error('Web Crypto API not available');
  }
  
  try {
    // Convert inputs to Uint8Array if needed
    const ikmBytes = typeof ikm === 'string' ? new TextEncoder().encode(ikm) : new Uint8Array(ikm);
    const saltBytes = salt ? (typeof salt === 'string' ? new TextEncoder().encode(salt) : new Uint8Array(salt)) : new Uint8Array(0);
    const infoBytes = info ? (typeof info === 'string' ? new TextEncoder().encode(info) : new Uint8Array(info)) : new Uint8Array(0);
    
    // Import the IKM as a key
    const ikmKey = await cryptoAPI.subtle.importKey(
      'raw',
      ikmBytes,
      { name: 'HKDF' },
      false,
      ['deriveBits']
    );
    
    // Derive bits
    const derivedBits = await cryptoAPI.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: hash,
        salt: saltBytes,
        info: infoBytes
      },
      ikmKey,
      length * 8 // Convert bytes to bits
    );
    
    return new Uint8Array(derivedBits);
  } catch (error) {
    throw new Error(`HKDF derivation failed: ${error.message}`);
  }
}

// HKDF-Extract function
export async function hkdfExtract(salt, ikm, hash = 'SHA-256') {
  const hashLength = hash === 'SHA-256' ? 32 : hash === 'SHA-512' ? 64 : 20; // SHA-1
  const prk = await hkdf(ikm, salt, '', hashLength, hash);
  return prk;
}

// HKDF-Expand function
export async function hkdfExpand(prk, info, length, hash = 'SHA-256') {
  const hashLength = hash === 'SHA-256' ? 32 : hash === 'SHA-512' ? 64 : 20; // SHA-1
  
  if (length > 255 * hashLength) {
    throw new Error('HKDF: output length too large');
  }
  
  const okm = new Uint8Array(length);
  const infoBytes = info ? (typeof info === 'string' ? new TextEncoder().encode(info) : new Uint8Array(info)) : new Uint8Array(0);
  let t = new Uint8Array(0);
  let offset = 0;
  
  for (let i = 1; offset < length; i++) {
    const input = new Uint8Array(t.length + infoBytes.length + 1);
    input.set(t);
    input.set(infoBytes, t.length);
    input[input.length - 1] = i;
    
    // HMAC(PRK, T || info || i)
    const key = await cryptoAPI.subtle.importKey(
      'raw',
      prk,
      { name: 'HMAC', hash },
      false,
      ['sign']
    );
    
    const signature = await cryptoAPI.subtle.sign('HMAC', key, input);
    t = new Uint8Array(signature);
    
    const copyLength = Math.min(hashLength, length - offset);
    okm.set(t.slice(0, copyLength), offset);
    offset += copyLength;
  }
  
  return okm;
}