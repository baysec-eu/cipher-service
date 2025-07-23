export function encodeBson(s) {
  const bytes = new TextEncoder().encode(s);
  const keyBytes = new TextEncoder().encode('data');
  
  // Document size (4 bytes) + type (1) + key + null + length (4) + string + null + end (1)
  const docSize = 4 + 1 + keyBytes.length + 1 + 4 + bytes.length + 1 + 1;
  
  let result = [];
  
  // Document size (little endian)
  result.push(docSize & 0xff, (docSize >> 8) & 0xff, (docSize >> 16) & 0xff, (docSize >> 24) & 0xff);
  
  // String type
  result.push(0x02);
  
  // Key name
  result.push(...keyBytes, 0x00);
  
  // String length (little endian)
  const strLen = bytes.length + 1;
  result.push(strLen & 0xff, (strLen >> 8) & 0xff, (strLen >> 16) & 0xff, (strLen >> 24) & 0xff);
  
  // String content
  result.push(...bytes, 0x00);
  
  // End of document
  result.push(0x00);
  
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}