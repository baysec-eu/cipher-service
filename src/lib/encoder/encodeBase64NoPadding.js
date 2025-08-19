import { encodeBase64 } from "./encodeBase64.js";

export function encodeBase64NoPadding(s) {
  return encodeBase64(s).replace(/=/g, '');
}