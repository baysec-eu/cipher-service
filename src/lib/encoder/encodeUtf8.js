export function encodeUtf8(s) {
  // Encode string as UTF-8 byte sequence
  if (!s) return '';
  
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(s);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(' ');
  } catch (error) {
    // Fallback implementation
    let result = '';
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i);
      if (code < 0x80) {
        result += code.toString(16).padStart(2, '0') + ' ';
      } else if (code < 0x800) {
        result += (0xC0 | (code >> 6)).toString(16).padStart(2, '0') + ' ';
        result += (0x80 | (code & 0x3F)).toString(16).padStart(2, '0') + ' ';
      } else {
        result += (0xE0 | (code >> 12)).toString(16).padStart(2, '0') + ' ';
        result += (0x80 | ((code >> 6) & 0x3F)).toString(16).padStart(2, '0') + ' ';
        result += (0x80 | (code & 0x3F)).toString(16).padStart(2, '0') + ' ';
      }
    }
    return result.trim();
  }
}