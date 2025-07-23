export function punycodeEncode(s) {
  try {
    return 'xn--' + punycode.encode(s);
  } catch {
    return s;
  }
}