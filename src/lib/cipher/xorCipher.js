export function xorCipher(s, key = 32) {
  return Array.from(s).map(c => String.fromCharCode(c.charCodeAt(0) ^ key)).join('');
}