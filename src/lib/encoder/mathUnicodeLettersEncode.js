export function mathUnicodeLettersEncode(s) {
  // Convert regular letters to mathematical Unicode equivalents
  // Based on justCTF 2024 exploit using Unicode Mathematical Monospace characters
  
  if (!s) return '';
  
  // Mathematical Monospace Unicode ranges:
  // Uppercase: U+1D670-U+1D689 (𝙰-𝚉) 
  // Lowercase: U+1D68A-U+1D6A3 (𝚊-𝚣)
  
  const MATH_UPPER_BASE = 0x1D670;  // 𝙰 = 120432
  const MATH_LOWER_BASE = 0x1D68A;  // 𝚊 = 120458
  
  let result = '';
  
  // Use Array.from to properly handle Unicode surrogate pairs
  const chars = Array.from(s);
  
  for (let char of chars) {
    const code = char.codePointAt(0);
    
    if (code >= 65 && code <= 90) {
      // Uppercase A-Z
      const mathCode = MATH_UPPER_BASE + (code - 65);
      result += String.fromCodePoint(mathCode);
    } else if (code >= 97 && code <= 122) {
      // Lowercase a-z  
      const mathCode = MATH_LOWER_BASE + (code - 97);
      result += String.fromCodePoint(mathCode);
    } else {
      // Keep non-letter characters as is
      result += char;
    }
  }
  
  return result;
}