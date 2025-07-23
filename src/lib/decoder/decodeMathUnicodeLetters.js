export function decodeMathUnicodeLetters(s) {
  // Decode mathematical Unicode letters back to regular ASCII letters
  
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
    
    if (code >= MATH_UPPER_BASE && code <= MATH_UPPER_BASE + 25) {
      // Mathematical uppercase to regular uppercase
      const asciiCode = 65 + (code - MATH_UPPER_BASE);
      result += String.fromCodePoint(asciiCode);
    } else if (code >= MATH_LOWER_BASE && code <= MATH_LOWER_BASE + 25) {
      // Mathematical lowercase to regular lowercase
      const asciiCode = 97 + (code - MATH_LOWER_BASE);
      result += String.fromCodePoint(asciiCode);
    } else {
      // Keep non-mathematical characters as is
      result += char;
    }
  }
  
  return result;
}