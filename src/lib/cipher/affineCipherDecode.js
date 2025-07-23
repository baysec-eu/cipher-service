export function affineCipherDecode(s, a = 5, b = 8) {
  // Find modular multiplicative inverse of a
  const modInverse = (a, m) => {
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    return 1;
  };
  
  const aInverse = modInverse(a, 26);
  
  return Array.from(s).map(c => {
    if (!/[A-Za-z]/.test(c)) return c;
    
    const base = c <= 'Z' ? 65 : 97;
    const y = c.charCodeAt(0) - base;
    const decoded = (aInverse * (y - b + 26)) % 26;
    return String.fromCharCode(base + decoded);
  }).join('');
}