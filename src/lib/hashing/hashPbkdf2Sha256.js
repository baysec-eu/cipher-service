// PBKDF2-SHA256 (Hashcat mode 10900)
export async function hashPbkdf2Sha256(password, salt = null, iterations = 1000) {
  if (!salt) {
    salt = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt);
  }
  
  let derivedKey = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < iterations; i++) {
    const input = Array.from(derivedKey).map(b => String.fromCharCode(b)).join('') + saltStr + i;
    derivedKey = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)));
  }
  
  return Array.from(derivedKey).map(b => b.toString(16).padStart(2, '0')).join('');
}