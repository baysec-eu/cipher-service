export function decodeBinary(s) {
  try {
    return s.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
  } catch {
    return s;
  }
}
