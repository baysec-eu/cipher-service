export function decodeAvro(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length === 0) return s;
    
    let offset = 0;
    let length = 0;
    let shift = 0;
    
    // Decode variable-length integer
    while (offset < bytes.length) {
      const byte = bytes[offset++];
      length |= (byte & 0x7F) << shift;
      if (!(byte & 0x80)) break;
      shift += 7;
    }
    
    const content = bytes.slice(offset, offset + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}
