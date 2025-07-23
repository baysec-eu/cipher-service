export function encodeOctal(s) {
  return Array.from(s).map(c => c.charCodeAt(0).toString(8)).join(' ');
}