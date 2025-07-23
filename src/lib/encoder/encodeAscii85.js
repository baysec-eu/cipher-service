export function encodeAscii85(s) {
  const bytes = new TextEncoder().encode(s);
  let result = '';
  
  for (let i = 0; i < bytes.length; i += 4) {
    let chunk = 0;
    let chunkSize = Math.min(4, bytes.length - i);
    
    // Pack 4 bytes into 32-bit integer
    for (let j = 0; j < chunkSize; j++) {
      chunk = (chunk << 8) | bytes[i + j];
    }
    
    // Pad if necessary
    if (chunkSize < 4) {
      chunk <<= (4 - chunkSize) * 8;
    }
    
    // Special case for all zeros
    if (chunk === 0 && chunkSize === 4) {
      result += 'z';
    } else {
      // Convert to 5 base-85 digits
      let encoded = '';
      for (let k = 0; k < 5; k++) {
        encoded = String.fromCharCode(33 + (chunk % 85)) + encoded;
        chunk = Math.floor(chunk / 85);
      }
      
      // Trim padding for partial chunks
      if (chunkSize < 4) {
        encoded = encoded.substring(0, chunkSize + 1);
      }
      
      result += encoded;
    }
  }
  
  return '<~' + result + '~>';
}