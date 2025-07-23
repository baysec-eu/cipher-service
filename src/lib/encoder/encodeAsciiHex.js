export function encodeAsciiHex(s) {
  return Array.from(s).map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join('');
}