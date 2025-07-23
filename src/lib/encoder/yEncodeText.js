export function yEncodeText(s) {
  const bytes = new TextEncoder().encode(s);
  let result = '=ybegin line=128 size=' + bytes.length + ' name=data\r\n';
  let lineLength = 0;
  
  for (const byte of bytes) {
    let encoded = (byte + 42) % 256;
    
    // Escape special characters
    if (encoded === 0 || encoded === 10 || encoded === 13 || encoded === 61) {
      result += '=' + String.fromCharCode((encoded + 64) % 256);
      lineLength += 2;
    } else {
      result += String.fromCharCode(encoded);
      lineLength += 1;
    }
    
    // Line wrapping
    if (lineLength >= 128) {
      result += '\r\n';
      lineLength = 0;
    }
  }
  
  if (lineLength > 0) {
    result += '\r\n';
  }
  
  result += '=yend size=' + bytes.length + '\r\n';
  return result;
}