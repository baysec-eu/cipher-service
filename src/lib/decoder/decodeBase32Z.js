export function decodeBase32Z(s) {
  const alphabet = 'ybndrfg8ejkmcpqxot1uwisza345h769';
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const char of s.toLowerCase()) {
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
