export function a1z26Encode(s) {
  return Array.from(s.toUpperCase()).map(c => {
    if (c >= 'A' && c <= 'Z') {
      return (c.charCodeAt(0) - 64).toString();
    }
    return c;
  }).join(' ');
}