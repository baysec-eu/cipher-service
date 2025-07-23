export function encodeAvro(s) {
  const bytes = new TextEncoder().encode(s);
  const length = bytes.length;
  let result = [];
  
  // Encode length as variable-length zigzag
  let len = length;
  while (len >= 0x80) {
    result.push((len & 0x7F) | 0x80);
    len >>= 7;
  }
  result.push(len & 0x7F);
  
  // String bytes
  result.push(...bytes);
  
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}