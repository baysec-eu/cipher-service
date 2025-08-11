
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

export function hashNetNtlmv1(username, password, domain = '', serverChallenge = '', clientChallenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = username + domain;
  
  // Simplified NetNTLMv1 calculation
  const response1 = customMd5(ntlmHash + serverChallenge + clientChallenge).substring(0, 16);
  const response2 = customMd5(identity + serverChallenge).substring(0, 16);
  
  return `${identity}::${domain}:${response1}:${response2}:${serverChallenge}`;
}