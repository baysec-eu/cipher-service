export function doubleUrlencode(s) {
  const firstEncode = urlencodeAscii(s);
  return encodeURIComponent(firstEncode);
}