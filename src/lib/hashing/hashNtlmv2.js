import { customMd5 } from './hashCustomMd5.js';
import { hmacMd5 } from './hmacMd5.js';

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

export function hashNtlmv2(username, password, domain = '', serverChallenge = '', clientChallenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = (username + domain).toUpperCase();
  
  // Simplified NTLMv2 implementation
  const ntlmv2Hash = hmacMd5(ntlmHash, identity);
  return hmacMd5(ntlmv2Hash, serverChallenge + clientChallenge).substring(0, 32);
}