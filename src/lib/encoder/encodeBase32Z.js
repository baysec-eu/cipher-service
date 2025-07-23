export function encodeBase32Z(s) {
  // z-base-32: Human-oriented base-32 encoding
  const alphabet = 'ybndrfg8ejkmcpqxot1uwisza345h769';
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
  
  return result;
}