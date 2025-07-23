export function hashNtlmv2(username, password, domain = '', serverChallenge = '', clientChallenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = (username + domain).toUpperCase();
  
  // Simplified NTLMv2 implementation
  const ntlmv2Hash = customHmacMd5(ntlmHash, identity);
  return customHmacMd5(ntlmv2Hash, serverChallenge + clientChallenge).substring(0, 32);
}