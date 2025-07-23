export function decodeNullByte(s) {
  return s.replace(/\x00/g, '');
}
