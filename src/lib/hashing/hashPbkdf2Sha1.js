// PBKDF2-SHA1 implementation using SubtleCrypto API
export async function hashPbkdf2Sha1(password, salt = null, iterations = 1000) {
  // Generate random salt if not provided
  if (!salt) {
    salt = crypto.getRandomValues(new Uint8Array(16));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt);
  }
  
  // Import password as key material
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-1'
    },
    passwordKey,
    160 // SHA-1 produces 160 bits
  );
  
  // Convert to hex string
  const hashArray = Array.from(new Uint8Array(derivedBits));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}