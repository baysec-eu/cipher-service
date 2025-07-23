export function encodeUtf32(s) {
  // Encode string as UTF-32 byte sequence (little endian)
  if (!s) return '';
  
  try {
    let result = [];
    for (let i = 0; i < s.length; i++) {
      const code = s.codePointAt(i) || 0;
      // UTF-32 little endian (4 bytes per character)
      result.push((code & 0xFF).toString(16).padStart(2, '0'));
      result.push(((code >> 8) & 0xFF).toString(16).padStart(2, '0'));
      result.push(((code >> 16) & 0xFF).toString(16).padStart(2, '0'));
      result.push(((code >> 24) & 0xFF).toString(16).padStart(2, '0'));
      
      // Skip surrogate pairs
      if (code > 0xFFFF) i++;
    }
    return result.join(' ');
  } catch (error) {
    return s;
  }
}