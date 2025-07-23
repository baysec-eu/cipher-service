export function encodeBase64(s) {
  return btoa(unescape(encodeURIComponent(s)));
}