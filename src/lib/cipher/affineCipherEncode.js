export function affineCipherEncode(s, a = 5, b = 8) {
  return Array.from(s).map(c => {
    if (!/[A-Za-z]/.test(c)) return c;
    
    const base = c <= 'Z' ? 65 : 97;
    const x = c.charCodeAt(0) - base;
    const encoded = (a * x + b) % 26;
    return String.fromCharCode(base + encoded);
  }).join('');
}