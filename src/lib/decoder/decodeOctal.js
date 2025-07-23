export function decodeOctal(s) {
  try {
    return s.split(' ').map(oct => String.fromCharCode(parseInt(oct, 8))).join('');
  } catch {
    return s;
  }
}
