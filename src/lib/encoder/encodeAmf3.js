export function encodeAmf3(s) {
  const bytes = new TextEncoder().encode(s);
  let result = [];
  
  // AMF3 string type marker
  result.push(0x06);
  
  // Length encoded as variable length integer
  const length = bytes.length;
  if (length <= 0x7F) {
    result.push((length << 1) | 1); // reference bit = 1 for inline
  } else if (length <= 0x3FFF) {
    result.push(((length >> 7) & 0x7F) | 0x80, ((length << 1) & 0xFF) | 1);
  } else if (length <= 0x1FFFFF) {
    result.push(
      ((length >> 14) & 0x7F) | 0x80,
      ((length >> 7) & 0x7F) | 0x80, 
      ((length << 1) & 0xFF) | 1
    );
  }
  
  // String content
  result.push(...bytes);
  
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}