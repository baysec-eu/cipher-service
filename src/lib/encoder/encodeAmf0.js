export function encodeAmf0(s) {
  const bytes = new TextEncoder().encode(s);
  let result = [];
  
  // AMF0 string type marker
  result.push(0x02);
  
  // Length (2 bytes, big endian)
  result.push((bytes.length >> 8) & 0xff, bytes.length & 0xff);
  
  // String content
  result.push(...bytes);
  
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}