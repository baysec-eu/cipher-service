export function bcryptHash(password, salt = null, rounds = 10) {
  console.warn('Simplified bcrypt implementation - use proper bcrypt library for production');
  
  if (!salt) {
    salt = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt).slice(0, 16);
  }
  
  let hash = new TextEncoder().encode(password + Array.from(salt).map(b => String.fromCharCode(b)).join(''));
  
  // Simulate multiple rounds
  for (let i = 0; i < Math.pow(2, Math.min(rounds, 12)); i++) {
    const hashHex = Array.from(hash).map(b => String.fromCharCode(b)).join('');
    hash = new Uint8Array(customMd5Bytes(new TextEncoder().encode(hashHex + i.toString())));
  }
  
  return '$2a$' + rounds.toString().padStart(2, '0') + '$' + 
         Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('') +
         Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
}