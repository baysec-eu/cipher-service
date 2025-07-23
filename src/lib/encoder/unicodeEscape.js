export function unicodeEscape(s) {
  return Array.from(s).map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
}