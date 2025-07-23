export function atbashCipher(s) {
  return Array.from(s).map(c => {
    if (c >= 'A' && c <= 'Z') {
      return String.fromCharCode(90 - (c.charCodeAt(0) - 65));
    } else if (c >= 'a' && c <= 'z') {
      return String.fromCharCode(122 - (c.charCodeAt(0) - 97));
    }
    return c;
  }).join('');
}