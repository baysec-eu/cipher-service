export function phpPackEncode(s) {
  const codes = Array.from(s).map(c => c.charCodeAt(0));
  return `pack("C*",${codes.join(',')})`;
}