export function vigenereDecode(s, keyStr = "KEY") {
  // Ensure key is a string and clean it
  const cleanKey = String(keyStr).toUpperCase().replace(/[^A-Z]/g, '') || 'KEY';
  let keyIndex = 0;
  
  return Array.from(s).map(c => {
    if (!/[A-Za-z]/.test(c)) return c;
    
    const base = c <= 'Z' ? 65 : 97;
    const keyBase = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 65;
    const shift = (c.charCodeAt(0) - base - keyBase + 26) % 26;
    keyIndex++; // Only increment for alphabetic characters
    return String.fromCharCode(base + shift);
  }).join('');
}