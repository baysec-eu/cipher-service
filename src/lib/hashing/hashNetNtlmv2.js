export function hashNetNtlmv2(username, password, domain = '', serverChallenge = '', clientChallenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = username.toUpperCase() + domain.toUpperCase();
  
  const ntlmv2Hash = customHmacMd5(ntlmHash, identity);
  const response = customHmacMd5(ntlmv2Hash, serverChallenge + clientChallenge);
  
  return `${username}::${domain}:${serverChallenge}:${response.substring(0, 32)}:${clientChallenge}`;
}