export function decodeAmf3(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length < 2 || bytes[0] !== 0x06) return s; // Not string type
    
    let offset = 1;
    let length = 0;
    let byte = bytes[offset++];
    
    // Decode variable length integer
    if (byte & 0x80) {
      length = (byte & 0x7F) << 7;
      byte = bytes[offset++];
      if (byte & 0x80) {
        length |= (byte & 0x7F) << 14;
        byte = bytes[offset++];
      }
      length |= byte & 0x7F;
    } else {
      length = byte & 0x7F;
    }
    
    length >>= 1; // Remove reference bit
    
    const content = bytes.slice(offset, offset + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}
