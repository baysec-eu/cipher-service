export function decodeMessagePack(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length === 0) return s;
    
    let offset = 0;
    const type = bytes[offset++];
    let length = 0;
    
    if ((type & 0xe0) === 0xa0) {
      // fixstr
      length = type & 0x1f;
    } else if (type === 0xd9) {
      // str 8
      length = bytes[offset++];
    } else if (type === 0xda) {
      // str 16
      length = (bytes[offset++] << 8) | bytes[offset++];
    } else if (type === 0xdb) {
      // str 32
      length = (bytes[offset++] << 24) | (bytes[offset++] << 16) | (bytes[offset++] << 8) | bytes[offset++];
    }
    
    const content = bytes.slice(offset, offset + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}
