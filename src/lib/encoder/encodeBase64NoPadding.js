export function encodeBase64NoPadding(s) {
  return encodeBase64(s).replace(/=/g, '');
}