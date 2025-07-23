export function decodeAmf0(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length < 3 || bytes[0] !== 0x02) return s; // Not string type
    
    const length = (bytes[1] << 8) | bytes[2];
    const content = bytes.slice(3, 3 + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}
