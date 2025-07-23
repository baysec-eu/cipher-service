export function decodeUtf16(s) {
  // Decode UTF-16 byte sequence (little endian) back to string
  if (!s) return '';
  
  try {
    const bytes = s.split(/\s+/).filter(b => b.length > 0).map(b => parseInt(b, 16));
    
    let result = '';
    for (let i = 0; i < bytes.length; i += 2) {
      if (i + 1 < bytes.length) {
        // Little endian: low byte first, high byte second
        const charCode = bytes[i] | (bytes[i + 1] << 8);
        result += String.fromCharCode(charCode);
      }
    }
    
    return result;
  } catch (error) {
    return s;
  }
}