export function sqlUnhexEncode(s) {
  const hex = encodeHex(s);
  return `UNHEX('${hex}')`;
}