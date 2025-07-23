export function decodeBase32(s) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanInput = s.toUpperCase().replace(/[^A-Z2-7]/g, '');
  
  if (cleanInput.length === 0) return '';
  
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const char of cleanInput) {
    const value = alphabet.indexOf(char);
    if (value === -1) continue;
    
    buffer = (buffer << 5) | value;
    bitsLeft += 5;
    
    if (bitsLeft >= 8) {
      result += String.fromCharCode((buffer >> (bitsLeft - 8)) & 255);
      bitsLeft -= 8;
    }
  }
  
  return result;
}
