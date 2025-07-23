export function encodeHex(s) {
  return new TextEncoder().encode(s).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}