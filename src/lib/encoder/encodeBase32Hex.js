export function encodeBase32Hex(s) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
  const bytes = new TextEncoder().encode(s);
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;
    
    while (bitsLeft >= 5) {
      result += alphabet[(buffer >> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  
  if (bitsLeft > 0) {
    result += alphabet[(buffer << (5 - bitsLeft)) & 31];
  }
  
  while (result.length % 8 !== 0) {
    result += '=';
  }
  
  return result;
}