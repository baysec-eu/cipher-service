import {customMd5} from "./hashMd5"
import {hashNtlm} from "./hashNtlm"

export function hashMsCachev1(username, password, domain = '') {
  const ntlmHash = hashNtlm(password);
  const identity = (username.toLowerCase() + domain.toLowerCase());
  const combined = ntlmHash + identity;
  
  return customMd5(combined);
}