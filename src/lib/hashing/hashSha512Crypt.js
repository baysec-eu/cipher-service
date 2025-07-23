export function hashSha512Crypt(password, salt = null, rounds = 5000) {
  console.warn('Simplified SHA512-Crypt implementation - use proper crypt library for production');
  
  if (!salt) {
    salt = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt).slice(0, 16);
  }
  
  let hash = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < rounds; i++) {
    const input = Array.from(hash).map(b => String.fromCharCode(b)).join('') + saltStr + password + i;
    const hashHex = customMd5(input); // Using MD5 as placeholder for SHA512
    hash = new Uint8Array(hashHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  }
  
  const saltB64 = btoa(Array.from(salt).map(b => String.fromCharCode(b)).join(''));
  const hashB64 = btoa(Array.from(hash).map(b => String.fromCharCode(b)).join(''));
  
  return `$6$rounds=${rounds}$${saltB64}$${hashB64}`;
}