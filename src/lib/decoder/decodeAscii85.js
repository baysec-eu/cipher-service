export function decodeAscii85(s) {
  try {
    // Remove wrapper
    let data = s.replace(/<~|~>/g, '');
    let result = [];
    
    for (let i = 0; i < data.length; i += 5) {
      let chunk = data.substring(i, i + 5);
      
      if (chunk === 'z') {
        result.push(0, 0, 0, 0);
        continue;
      }
      
      // Pad chunk to 5 characters
      while (chunk.length < 5) {
        chunk += 'u';
      }
      
      // Convert from base 85
      let value = 0;
      for (let j = 0; j < 5; j++) {
        value = value * 85 + (chunk.charCodeAt(j) - 33);
      }
      
      // Extract bytes
      result.push((value >> 24) & 0xFF);
      result.push((value >> 16) & 0xFF);
      result.push((value >> 8) & 0xFF);
      result.push(value & 0xFF);
    }
    
    return new TextDecoder().decode(new Uint8Array(result));
  } catch {
    return s;
  }
}
