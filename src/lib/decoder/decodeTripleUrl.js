export function decodeTripleUrl(s) {
  return decodeURIComponent(decodeURIComponent(decodeURIComponent(s)));
}
