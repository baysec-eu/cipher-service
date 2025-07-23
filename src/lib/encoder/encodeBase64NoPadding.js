import { encodeBase64 } from "./encodeBase64";

export function encodeBase64NoPadding(s) {
  return encodeBase64(s).replace(/=/g, '');
}