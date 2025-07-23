export function rot47(s) {
  return Array.from(s).map(c => {
    const code = c.charCodeAt(0);
    if (code >= 33 && code <= 126) {
      return String.fromCharCode(33 + ((code - 33 + 47) % 94));
    }
    return c;
  }).join('');
}