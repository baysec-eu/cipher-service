export function hashDesCrypt(password, salt = null) {
  console.warn('Simplified DES-Crypt implementation - use proper crypt library for production');
  
  if (!salt) {
    salt = Array.from({ length: 2 }, () => Math.floor(Math.random() * 64));
  } else if (typeof salt === 'string') {
    salt = salt.slice(0, 2).split('').map(c => c.charCodeAt(0));
  }
  
  // Simplified DES implementation using XOR operations
  const key = new TextEncoder().encode(password.slice(0, 8).padEnd(8, '\0'));
  const saltStr = String.fromCharCode(salt[0], salt[1]);
  
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash ^= key[i] * (i + 1) * salt[i % 2];
  }
  
  const hashStr = hash.toString(36).slice(0, 11);
  return saltStr + hashStr.padStart(11, '0');
}