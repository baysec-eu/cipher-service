export function decodeBase64(s) {
  try {
    return decodeURIComponent(escape(atob(s)));
  } catch {
    return s;
  }
}
