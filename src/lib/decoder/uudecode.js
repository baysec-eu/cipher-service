export function uudecode(s) {
  try {
    const lines = s.split('\n').filter(line => line.trim());
    let result = [];
    
    for (let i = 1; i < lines.length - 2; i++) { // Skip begin/end lines
      const line = lines[i];
      if (line === '`') break;
      
      const lineLength = line.charCodeAt(0) - 32;
      if (lineLength <= 0) continue;
      
      const data = line.substring(1).replace(/`/g, ' '); // Replace graves with spaces
      
      for (let j = 0; j < data.length; j += 4) {
        const c1 = (data.charCodeAt(j) || 32) - 32;
        const c2 = (data.charCodeAt(j + 1) || 32) - 32;
        const c3 = (data.charCodeAt(j + 2) || 32) - 32;
        const c4 = (data.charCodeAt(j + 3) || 32) - 32;
        
        const combined = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;
        
        result.push((combined >> 16) & 0xFF);
        if (j + 1 < data.length) result.push((combined >> 8) & 0xFF);
        if (j + 2 < data.length) result.push(combined & 0xFF);
      }
    }
    
    return new TextDecoder().decode(new Uint8Array(result));
  } catch {
    return s;
  }
}
