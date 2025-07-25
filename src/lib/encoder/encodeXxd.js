export function encodeXxd(input, bytesPerLine = 16, includeOffset = true, includeAscii = true, uppercase = false, groupSize = 2) {
  if (!input) return '';
  
  try {
    const bytes = new TextEncoder().encode(input);
    const lines = [];
    
    for (let i = 0; i < bytes.length; i += bytesPerLine) {
      const lineBytes = bytes.slice(i, i + bytesPerLine);
      let line = '';
      
      // Add offset
      if (includeOffset) {
        const offset = i.toString(16).padStart(8, '0');
        line += uppercase ? offset.toUpperCase() : offset;
        line += ': ';
      }
      
      // Add hex bytes with grouping
      const hexPart = [];
      for (let j = 0; j < lineBytes.length; j++) {
        const hex = lineBytes[j].toString(16).padStart(2, '0');
        hexPart.push(uppercase ? hex.toUpperCase() : hex);
        
        // Add space after group
        if (groupSize > 0 && (j + 1) % groupSize === 0 && j < lineBytes.length - 1) {
          hexPart.push(' ');
        }
      }
      
      // Pad hex part to align ASCII
      const hexString = hexPart.join('');
      const paddedHex = hexString.padEnd((bytesPerLine * 2) + Math.floor((bytesPerLine - 1) / groupSize), ' ');
      line += paddedHex;
      
      // Add ASCII representation
      if (includeAscii) {
        line += '  ';
        for (let j = 0; j < lineBytes.length; j++) {
          const byte = lineBytes[j];
          // Print ASCII if printable, otherwise use dot
          if (byte >= 32 && byte <= 126) {
            line += String.fromCharCode(byte);
          } else {
            line += '.';
          }
        }
      }
      
      lines.push(line);
    }
    
    return lines.join('\n');
  } catch (error) {
    throw new Error(`XXD encode error: ${error.message}`);
  }
}