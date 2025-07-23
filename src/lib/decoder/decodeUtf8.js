export function decodeUtf8(s) {
  // Decode UTF-8 byte sequence back to string
  if (!s) return '';
  
  try {
    // Parse hex bytes
    const bytes = s.split(/\s+/).filter(b => b.length > 0).map(b => parseInt(b, 16));
    
    // Use TextDecoder if available
    if (typeof TextDecoder !== 'undefined') {
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(new Uint8Array(bytes));
    }
    
    // Fallback manual UTF-8 decoding
    let result = '';
    let i = 0;
    while (i < bytes.length) {
      let byte1 = bytes[i++];
      
      if (byte1 < 0x80) {
        // Single byte (ASCII)
        result += String.fromCharCode(byte1);
      } else if ((byte1 & 0xE0) === 0xC0) {
        // Two bytes
        let byte2 = bytes[i++];
        result += String.fromCharCode(((byte1 & 0x1F) << 6) | (byte2 & 0x3F));
      } else if ((byte1 & 0xF0) === 0xE0) {
        // Three bytes
        let byte2 = bytes[i++];
        let byte3 = bytes[i++];
        result += String.fromCharCode(((byte1 & 0x0F) << 12) | ((byte2 & 0x3F) << 6) | (byte3 & 0x3F));
      } else if ((byte1 & 0xF8) === 0xF0) {
        // Four bytes (surrogate pair)
        let byte2 = bytes[i++];
        let byte3 = bytes[i++];
        let byte4 = bytes[i++];
        let codepoint = ((byte1 & 0x07) << 18) | ((byte2 & 0x3F) << 12) | ((byte3 & 0x3F) << 6) | (byte4 & 0x3F);
        result += String.fromCodePoint(codepoint);
      }
    }
    
    return result;
  } catch (error) {
    return s;
  }
}