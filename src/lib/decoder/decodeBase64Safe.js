import { decodeBase64 } from "./decodeBase64";

export function decodeBase64Safe(s) {
  const base64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  return decodeBase64(padded);
}
