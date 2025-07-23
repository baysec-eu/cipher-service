export function decodeDecimalPacked(s) {
  try {
    return s.split(',').map(dec => String.fromCharCode(parseInt(dec))).join('');
  } catch {
    return s;
  }
}
