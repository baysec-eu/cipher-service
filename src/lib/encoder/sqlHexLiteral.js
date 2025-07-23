export function sqlHexLiteral(s) {
  const hex = encodeHex(s);
  return `0x${hex}`;
}