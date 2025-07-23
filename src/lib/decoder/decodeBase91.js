export function decodeBase91(s) {
  try {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
    const bytes = [];
    let accumulator = 0;
    let bits = 0;
    
    for (let i = 0; i < s.length; i += 2) {
      let c1 = alphabet.indexOf(s[i]);
      let c2 = i + 1 < s.length ? alphabet.indexOf(s[i + 1]) : 0;
      
      if (c1 === -1 || (i + 1 < s.length && c2 === -1)) continue;
      
      let value = c1 + c2 * 91;
      accumulator |= value << bits;
      
      if (value & 8191) {
        bits += 13;
      } else {
        bits += 14;
      }
      
      while (bits >= 8) {
        bytes.push(accumulator & 255);
        accumulator >>= 8;
        bits -= 8;
      }
    }
    
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return s;
  }
}
