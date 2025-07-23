import { encodeBase64 } from "./encodeBase64";
export function encodeBase64Url(s) {
  return encodeBase64(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}