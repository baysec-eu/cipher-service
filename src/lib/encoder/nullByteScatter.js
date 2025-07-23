export function nullByteScatter(s) {
  return Array.from(s).join('\x00');
}