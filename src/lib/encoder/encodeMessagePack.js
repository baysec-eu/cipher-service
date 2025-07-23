export function encodeMessagePack(s) {
  const bytes = new TextEncoder().encode(s);
  let result = [];
  
  if (bytes.length <= 31) {
    // fixstr
    result.push(0xa0 | bytes.length);
  } else if (bytes.length <= 255) {
    // str 8
    result.push(0xd9, bytes.length);
  } else if (bytes.length <= 65535) {
    // str 16
    result.push(0xda, (bytes.length >> 8) & 0xff, bytes.length & 0xff);
  } else {
    // str 32
    result.push(0xdb, 
      (bytes.length >> 24) & 0xff, 
      (bytes.length >> 16) & 0xff, 
      (bytes.length >> 8) & 0xff, 
      bytes.length & 0xff);
  }
  
  result.push(...bytes);
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}