export function unicodeEscapeMixed(s) {
  return Array.from(s).map((c, i) => {
    const code = c.charCodeAt(0);
    if (i % 2 === 0 && code < 256) {
      return `\\x${code.toString(16).padStart(2, '0')}`;
    } else {
      return `\\u${code.toString(16).padStart(4, '0')}`;
    }
  }).join('');
}