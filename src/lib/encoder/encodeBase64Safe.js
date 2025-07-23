import { encodeBase64 } from "./encodeBase64";

export function encodeBase64Safe(s) {
  // Base64 with URL and filename safe alphabet
  return encodeBase64(s).replace(/\+/g, '-').replace(/\//g, '_');
}