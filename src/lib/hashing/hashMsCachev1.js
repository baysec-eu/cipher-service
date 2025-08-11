import {customMd5} from "./hashCustomMd5.js"
import {hashNtlm} from "./hashNtlm.js"

export function hashMsCachev1(username, password, domain = '') {
  const ntlmHash = hashNtlm(password);
  const identity = (username.toLowerCase() + domain.toLowerCase());
  const combined = ntlmHash + identity;
  
  return customMd5(combined);
}