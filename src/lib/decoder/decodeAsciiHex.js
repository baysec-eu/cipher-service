export function decodeAsciiHex(s) {
  try {
    return s.match(/.{1,2}/g)?.map(hex => String.fromCharCode(parseInt(hex, 16))).join('') || s;
  } catch {
    return s;
  }
}
