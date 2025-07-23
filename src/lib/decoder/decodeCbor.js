export function decodeCbor(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length === 0) return s;
    
    let offset = 0;
    const type = bytes[offset++];
    let length = 0;
    
    if ((type & 0xe0) === 0x60) {
      // Text string
      const info = type & 0x1f;
      if (info <= 23) {
        length = info;
      } else if (info === 24) {
        length = bytes[offset++];
      } else if (info === 25) {
        length = (bytes[offset++] << 8) | bytes[offset++];
      } else if (info === 26) {
        length = (bytes[offset++] << 24) | (bytes[offset++] << 16) | (bytes[offset++] << 8) | bytes[offset++];
      }
    }
    
    const content = bytes.slice(offset, offset + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}
