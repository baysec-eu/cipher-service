export function hashNtlmv1(username, password, domain = '', challenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = (username + domain).toUpperCase();
  
  // Simplified NTLMv1 - in practice this involves more complex challenge-response
  return customMd5(ntlmHash + identity + challenge).substring(0, 24);
}