export function encodeBase91(s) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
  const bytes = new TextEncoder().encode(s);
  let result = '';
  let accumulator = 0;
  let bits = 0;
  
  for (const byte of bytes) {
    accumulator |= (byte << bits);
    bits += 8;
    
    if (bits > 13) {
      let value = accumulator & 8191;
      
      if (value > 88) {
        accumulator >>= 13;
        bits -= 13;
      } else {
        value = accumulator & 16383;
        accumulator >>= 14;
        bits -= 14;
      }
      
      result += alphabet[value % 91] + alphabet[Math.floor(value / 91)];
    }
  }
  
  if (bits > 0) {
    result += alphabet[accumulator % 91];
    if (bits > 7 || accumulator > 90) {
      result += alphabet[Math.floor(accumulator / 91)];
    }
  }
  
  return result;
}