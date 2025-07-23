export function decodeBinaryPacked(s) {
  try {
    const chunks = s.match(/.{1,8}/g) || [];
    return chunks.map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
  } catch {
    return s;
  }
}
