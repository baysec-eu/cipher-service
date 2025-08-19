import { urlencodeAscii } from './urlencodeAscii.js';

export function doubleUrlencode(s) {
  const firstEncode = urlencodeAscii(s);
  return encodeURIComponent(firstEncode);
}