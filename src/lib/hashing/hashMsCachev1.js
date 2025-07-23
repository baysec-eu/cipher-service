export function hashMsCachev1(username, password, domain = '') {
  const ntlmHash = hashNtlm(password);
  const identity = (username.toLowerCase() + domain.toLowerCase());
  const combined = ntlmHash + identity;
  
  return customMd5(combined);
}