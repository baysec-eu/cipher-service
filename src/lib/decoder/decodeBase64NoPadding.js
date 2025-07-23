export function decodeBase64NoPadding(s) {
  const padded = s + '='.repeat((4 - s.length % 4) % 4);
  return decodeBase64(padded);
}
