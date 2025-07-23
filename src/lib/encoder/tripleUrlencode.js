export function tripleUrlencode(s) {
  const firstEncode = urlencodeAscii(s);
  const secondEncode = encodeURIComponent(firstEncode);
  return encodeURIComponent(secondEncode);
}