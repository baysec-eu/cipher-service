export function beaufortCipher(s, keyStr = "KEY") {
  const cleanKey = String(keyStr).toUpperCase().replace(/[^A-Z]/g, '') || 'KEY';
  return Array.from(s).map((c, i) => {
    if (!/[A-Za-z]/.test(c)) return c;
    
    const base = c <= 'Z' ? 65 : 97;
    const keyBase = cleanKey[i % cleanKey.length].charCodeAt(0) - 65;
    const shift = (keyBase - (c.charCodeAt(0) - base) + 26) % 26;
    return String.fromCharCode(base + shift);
  }).join('');
}