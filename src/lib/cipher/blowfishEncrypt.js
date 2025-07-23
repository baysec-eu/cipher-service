export function blowfishEncrypt(plaintext, key) {
  // This is a simplified version - real Blowfish would require full implementation
  console.warn('Simplified Blowfish implementation - use a proper crypto library for production');
  
  // Use XOR with key rotation as a placeholder
  const keyBytes = new TextEncoder().encode(key);
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const result = new Uint8Array(plaintextBytes.length);
  
  for (let i = 0; i < plaintextBytes.length; i++) {
    const keyByte = keyBytes[i % keyBytes.length];
    result[i] = plaintextBytes[i] ^ keyByte ^ ((i * 7) % 256);
  }
  
  return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
}