export function sqlHexLiteral(s) {
  const hex = Array.from(new TextEncoder().encode(s)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `0x${hex}`;
}