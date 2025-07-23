export function hashPbkdf2Sha1(password, salt = null, iterations = 1000) {
  if (!salt) {
    salt = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt);
  }
  
  // Simplified PBKDF2 implementation
  let derivedKey = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < iterations; i++) {
    const input = Array.from(derivedKey).map(b => String.fromCharCode(b)).join('') + saltStr + i;
    derivedKey = customSha1Bytes(new TextEncoder().encode(input));
  }
  
  return Array.from(derivedKey).map(b => b.toString(16).padStart(2, '0')).join('');
}