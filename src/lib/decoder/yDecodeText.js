export function yDecodeText(s) {
  try {
    const lines = s.split(/\r?\n/);
    let result = [];
    let inData = false;
    
    for (const line of lines) {
      if (line.startsWith('=ybegin')) {
        inData = true;
        continue;
      }
      if (line.startsWith('=yend')) {
        break;
      }
      
      if (!inData) continue;
      
      for (let i = 0; i < line.length; i++) {
        let byte = line.charCodeAt(i);
        
        if (byte === 61) { // Escape character
          i++;
          if (i < line.length) {
            byte = (line.charCodeAt(i) - 64) % 256;
          }
        }
        
        result.push((byte - 42) % 256);
      }
    }
    
    return new TextDecoder().decode(new Uint8Array(result));
  } catch {
    return s;
  }
}
