export function decodeAsn1Der(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length < 2 || bytes[0] !== 0x04) return s; // Not OCTET STRING
    
    let offset = 1;
    let length = bytes[offset++];
    
    if (length & 0x80) {
      const lengthBytes = length & 0x7F;
      length = 0;
      for (let i = 0; i < lengthBytes; i++) {
        length = (length << 8) | bytes[offset++];
      }
    }
    
    const content = bytes.slice(offset, offset + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}
