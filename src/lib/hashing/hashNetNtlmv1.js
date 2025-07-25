
export function hashNetNtlmv1(username, password, domain = '', serverChallenge = '', clientChallenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = username + domain;
  
  // Simplified NetNTLMv1 calculation
  const response1 = customMd5(ntlmHash + serverChallenge + clientChallenge).substring(0, 16);
  const response2 = customMd5(identity + serverChallenge).substring(0, 16);
  
  return `${identity}::${domain}:${response1}:${response2}:${serverChallenge}`;
}