export function decodeBase16(s) {
  try {
    const cleaned = s.replace(/[^0-9A-Fa-f]/g, '');
    const bytes = cleaned.match(/.{1,2}/g) || [];
    return new TextDecoder().decode(new Uint8Array(bytes.map(hex => parseInt(hex, 16))));
  } catch {
    return s;
  }
}
