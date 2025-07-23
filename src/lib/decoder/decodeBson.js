export function decodeBson(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length < 8) return s;
    
    // Skip document size (4 bytes) and type (1 byte)
    let offset = 5;
    
    // Skip key name until null terminator
    while (offset < bytes.length && bytes[offset] !== 0) offset++;
    offset++; // Skip null terminator
    
    // Read string length (4 bytes, little endian)
    const strLen = bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);
    offset += 4;
    
    // Read string content (excluding null terminator)
    const content = bytes.slice(offset, offset + strLen - 1);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}
