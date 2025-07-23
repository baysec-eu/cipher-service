export function decodeUtf32Be(s) {
  // Decode UTF-32 byte sequence (big endian) back to string
  if (!s) return '';
  
  try {
    const bytes = s.split(/\s+/).filter(b => b.length > 0).map(b => parseInt(b, 16));
    
    let result = '';
    for (let i = 0; i < bytes.length; i += 4) {
      if (i + 3 < bytes.length) {
        // Big endian: bytes from high to low
        const codePoint = (bytes[i] << 24) | (bytes[i + 1] << 16) | (bytes[i + 2] << 8) | bytes[i + 3];
        result += String.fromCodePoint(codePoint);
      }
    }
    
    return result;
  } catch (error) {
    return s;
  }
}