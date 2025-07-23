export function decodeUtf32(s) {
  // Decode UTF-32 byte sequence (little endian) back to string
  if (!s) return '';
  
  try {
    const bytes = s.split(/\s+/).filter(b => b.length > 0).map(b => parseInt(b, 16));
    
    let result = '';
    for (let i = 0; i < bytes.length; i += 4) {
      if (i + 3 < bytes.length) {
        // Little endian: bytes from low to high
        const codePoint = bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24);
        result += String.fromCodePoint(codePoint);
      }
    }
    
    return result;
  } catch (error) {
    return s;
  }
}