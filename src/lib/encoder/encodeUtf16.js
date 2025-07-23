export function encodeUtf16(s) {
  // Encode string as UTF-16 byte sequence (little endian)
  if (!s) return '';
  
  try {
    let result = [];
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      // Little endian UTF-16
      result.push((code & 0xFF).toString(16).padStart(2, '0'));
      result.push((code >> 8).toString(16).padStart(2, '0'));
    }
    return result.join(' ');
  } catch (error) {
    return s;
  }
}