export function encodeCbor(s) {
  const bytes = new TextEncoder().encode(s);
  const length = bytes.length;
  let result = [];
  
  // Text string (major type 3)
  if (length <= 23) {
    result.push(0x60 | length);
  } else if (length <= 255) {
    result.push(0x78, length);
  } else if (length <= 65535) {
    result.push(0x79, (length >> 8) & 0xff, length & 0xff);
  } else {
    result.push(0x7a, 
      (length >> 24) & 0xff, 
      (length >> 16) & 0xff, 
      (length >> 8) & 0xff, 
      length & 0xff);
  }
  
  result.push(...bytes);
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}