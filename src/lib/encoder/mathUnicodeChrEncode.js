export function mathUnicodeChrEncode(s) {
  // Convert string to mathematical Unicode chr() format like in justCTF 2024 exploit
  // This creates Python code using mathematical Unicode characters
  
  if (!s) return '';
  
  // Convert each character to 𝚌𝚑𝚛(ord_value) + format
  let result = '';
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    const ordValue = char.charCodeAt(0);
    
    if (i === s.length - 1) {
      // Last character - no trailing +
      result += `𝚌𝚑𝚛(${ordValue})`;
    } else {
      result += `𝚌𝚑𝚛(${ordValue}) +`;
    }
  }
  
  return result;
}