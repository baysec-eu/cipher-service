import {hashNtlm} from "./hashNtlm"
import {hmacMd5} from "./hmacMd5"

export function hashNetNtlmv2(username, password, domain = '', serverChallenge = '', clientChallenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = username.toUpperCase() + domain.toUpperCase();
  
  const ntlmv2Hash = hmacMd5(ntlmHash, identity);
  const response = hmacMd5(ntlmv2Hash, serverChallenge + clientChallenge);
  
  return `${username}::${domain}:${serverChallenge}:${response.substring(0, 32)}:${clientChallenge}`;
}