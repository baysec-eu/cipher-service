export function unicodeOverlongUtf8(s) {
  return Array.from(s).map(c => {
    const code = c.charCodeAt(0);
    if (code < 128) {
      // Overlong 2-byte sequence
      return `%C${((code >> 6) | 0xC0).toString(16).toUpperCase()}%${((code & 0x3F) | 0x80).toString(16).toUpperCase()}`;
    } else {
      return encodeURIComponent(c);
    }
  }).join('');
}