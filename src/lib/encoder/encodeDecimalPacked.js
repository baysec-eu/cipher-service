export function encodeDecimalPacked(s) {
  return Array.from(s).map(c => c.charCodeAt(0)).join(',');
}