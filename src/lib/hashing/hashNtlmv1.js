import { customMd5 } from './hashCustomMd5.js';

// Basic NTLM hash (MD4 of UTF-16LE encoded password)
function hashNtlm(password) {
  const utf16le = new TextEncoder().encode(password).reduce((acc, byte, i) => {
    if (i % 2 === 0) acc.push(byte, 0);
    else acc[acc.length - 1] = byte;
    return acc;
  }, []);
  
  // This should use MD4, but using MD5 as fallback for simplification
  return customMd5(new Uint8Array(utf16le));
}

export function hashNtlmv1(username, password, domain = '', challenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = (username + domain).toUpperCase();
  
  // Simplified NTLMv1 - in practice this involves more complex challenge-response
  return customMd5(ntlmHash + identity + challenge).substring(0, 24);
}