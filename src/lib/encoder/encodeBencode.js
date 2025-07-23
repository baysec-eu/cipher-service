export function encodeBencode(s) {
  if (typeof s === 'string') {
    const bytes = new TextEncoder().encode(s);
    return bytes.length + ':' + s;
  }
  return s.length + ':' + s;
}