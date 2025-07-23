export function encodeBase64Url(s) {
  return encodeBase64(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}