export function encodeBase16(s) {
  return new TextEncoder().encode(s).reduce((acc, byte) => 
    acc + byte.toString(16).toUpperCase().padStart(2, '0'), '');
}