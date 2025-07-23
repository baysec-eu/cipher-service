export function rc4Encrypt(plaintext, key) {
  const keyArray = new TextEncoder().encode(key);
  const plaintextArray = new TextEncoder().encode(plaintext);
  
  // Key-scheduling algorithm (KSA)
  const S = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + keyArray[i % keyArray.length]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
  }
  
  // Pseudo-random generation algorithm (PRGA)
  const result = new Uint8Array(plaintextArray.length);
  let i = 0;
  j = 0;
  
  for (let k = 0; k < plaintextArray.length; k++) {
    i = (i + 1) % 256;
    j = (j + S[i]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
    const keyStreamByte = S[(S[i] + S[j]) % 256];
    result[k] = plaintextArray[k] ^ keyStreamByte;
  }
  
  return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
}