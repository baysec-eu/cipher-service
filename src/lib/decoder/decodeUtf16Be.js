export function decodeUtf16Be(s) {
  // Decode UTF-16 byte sequence (big endian) back to string
  if (!s) return '';
  
  try {
    const bytes = s.split(/\s+/).filter(b => b.length > 0).map(b => parseInt(b, 16));
    
    let result = '';
    for (let i = 0; i < bytes.length; i += 2) {
      if (i + 1 < bytes.length) {
        // Big endian: high byte first, low byte second
        const charCode = (bytes[i] << 8) | bytes[i + 1];
        result += String.fromCharCode(charCode);
      }
    }
    
    return result;
  } catch (error) {
    return s;
  }
}