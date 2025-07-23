export function jsHexEscape(s) {
  return Array.from(s).map(c => {
    const code = c.charCodeAt(0);
    if (code < 256) {
      return `\\x${code.toString(16).padStart(2, '0')}`;
    } else {
      return `\\u${code.toString(16).padStart(4, '0')}`;
    }
  }).join('');
}