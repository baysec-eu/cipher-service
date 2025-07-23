export function uuencode(s) {
  const bytes = new TextEncoder().encode(s);
  let result = `begin 644 data\n`;
  
  for (let i = 0; i < bytes.length; i += 45) {
    const chunk = bytes.slice(i, i + 45);
    const lineLength = chunk.length;
    
    // Line length character (32 + length)
    result += String.fromCharCode(32 + lineLength);
    
    // Encode 3 bytes at a time
    for (let j = 0; j < chunk.length; j += 3) {
      const b1 = chunk[j] || 0;
      const b2 = chunk[j + 1] || 0;
      const b3 = chunk[j + 2] || 0;
      
      const combined = (b1 << 16) | (b2 << 8) | b3;
      
      // Extract 6-bit groups and add 32 (space), replace space with grave
      const c1 = ((combined >> 18) & 0x3F) + 32;
      const c2 = ((combined >> 12) & 0x3F) + 32;
      const c3 = ((combined >> 6) & 0x3F) + 32;
      const c4 = (combined & 0x3F) + 32;
      
      result += String.fromCharCode(c1 === 32 ? 96 : c1);
      result += String.fromCharCode(c2 === 32 ? 96 : c2);
      
      if (j + 1 < chunk.length) {
        result += String.fromCharCode(c3 === 32 ? 96 : c3);
      }
      if (j + 2 < chunk.length) {
        result += String.fromCharCode(c4 === 32 ? 96 : c4);
      }
    }
    
    result += '\n';
  }
  
  result += '`\nend\n';
  return result;
}