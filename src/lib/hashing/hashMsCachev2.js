export function hashMsCachev2(username, password, domain = '', iterations = 10240) {
  const ntlmHash = hashNtlm(password);
  const identity = (username.toLowerCase() + domain.toLowerCase());
  
  let hash = customMd5Bytes(new TextEncoder().encode(ntlmHash + identity));
  
  for (let i = 0; i < iterations; i++) {
    const input = Array.from(hash).map(b => String.fromCharCode(b)).join('') + identity;
    hash = customMd5Bytes(new TextEncoder().encode(input));
  }
  
  return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
}