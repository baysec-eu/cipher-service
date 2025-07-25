export function decodeXxd(input, strict = false, ignoreOffset = false) {
  if (!input) return '';
  
  try {
    const lines = input.split('\n').filter(line => line.trim());
    const hexBytes = [];
    
    for (const line of lines) {
      let hexPart = line.trim();
      
      // Skip empty lines
      if (!hexPart) continue;
      
      // Remove offset if present (format: 00000000: )
      if (!ignoreOffset && hexPart.match(/^[0-9a-fA-F]{8}:\s*/)) {
        hexPart = hexPart.replace(/^[0-9a-fA-F]{8}:\s*/, '');
      }
      
      // Remove ASCII part if present (everything after double space)
      const doubleSpaceIndex = hexPart.indexOf('  ');
      if (doubleSpaceIndex !== -1) {
        hexPart = hexPart.substring(0, doubleSpaceIndex);
      }
      
      // Extract hex bytes (handle various spacing formats)
      const hexMatches = hexPart.match(/[0-9a-fA-F]{2}/g);
      if (hexMatches) {
        hexBytes.push(...hexMatches);
      } else if (strict) {
        throw new Error(`Invalid hex format in line: ${line}`);
      }
    }
    
    // Convert hex bytes to binary data
    const bytes = new Uint8Array(hexBytes.length);
    for (let i = 0; i < hexBytes.length; i++) {
      bytes[i] = parseInt(hexBytes[i], 16);
    }
    
    // Convert to string
    return new TextDecoder().decode(bytes);
  } catch (error) {
    throw new Error(`XXD decode error: ${error.message}`);
  }
};

export function parseHexdump(input, format = 'auto', extractHex = true, extractAscii = false) {
  
  try {
    const lines = input.split('\n').filter(line => line.trim());
    const result = {
      hex: [],
      ascii: [],
      raw: ''
    };
    
    for (const line of lines) {
      let hexPart = '';
      let asciiPart = '';
      
      if (format === 'auto' || format === 'xxd') {
        // XXD format: 00000000: 48656c6c 6f20576f 726c6421  Hello World!
        const xxdMatch = line.match(/^([0-9a-fA-F]{8}):\s*([0-9a-fA-F\s]+)\s+(.*)$/);
        if (xxdMatch) {
          hexPart = xxdMatch[2];
          asciiPart = xxdMatch[3];
        }
      }
      
      if (format === 'auto' || format === 'hexdump') {
        // hexdump format: 0000000 6548 6c6c 206f 6f57 6c72 2164
        const hexdumpMatch = line.match(/^([0-9a-fA-F]+)\s+([0-9a-fA-F\s]+)$/);
        if (hexdumpMatch) {
          hexPart = hexdumpMatch[2];
        }
      }
      
      if (format === 'auto' || format === 'od') {
        // od format: 0000000 H e l l o   W o r l d !
        const odMatch = line.match(/^([0-9a-fA-F]+)\s+(.+)$/);
        if (odMatch) {
          const chars = odMatch[2].split(/\s+/);
          for (const char of chars) {
            if (char.length === 1) {
              const hex = char.charCodeAt(0).toString(16).padStart(2, '0');
              result.hex.push(hex);
              result.ascii.push(char);
            }
          }
          continue;
        }
      }
      
      // Extract hex bytes
      if (hexPart && extractHex) {
        const hexBytes = hexPart.match(/[0-9a-fA-F]{2}/g) || [];
        result.hex.push(...hexBytes);
      }
      
      // Extract ASCII
      if (asciiPart && extractAscii) {
        result.ascii.push(asciiPart);
      }
    }
    
    // Convert hex to raw string
    if (result.hex.length > 0) {
      const bytes = new Uint8Array(result.hex.length);
      for (let i = 0; i < result.hex.length; i++) {
        bytes[i] = parseInt(result.hex[i], 16);
      }
      result.raw = new TextDecoder().decode(bytes);
    }
    
    return extractHex ? result.raw : result;
  } catch (error) {
    throw new Error(`Hexdump parse error: ${error.message}`);
  }
};

