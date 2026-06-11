import { hashMd4 } from './hashMd4.js';
import { customMd5 } from './hashCustomMd5.js';

// NTLM hash: MD4 of UTF-16LE encoded password
function hashNtlm(password) {
  // Proper UTF-16LE encoding
  const encoder = new TextEncoder();
  const utf8 = encoder.encode(password);
  const utf16le = new Uint8Array(password.length * 2);
  for (let i = 0; i < password.length; i++) {
    const code = password.charCodeAt(i);
    utf16le[i * 2] = code & 0xFF;
    utf16le[i * 2 + 1] = (code >> 8) & 0xFF;
  }

  // Use proper MD4 (not MD5)
  return hashMd4(utf16le);
}

export function hashNtlmv1(username, password, domain = '', challenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = (username + domain).toUpperCase();

  // NTLMv1 challenge-response
  return customMd5(ntlmHash + identity + challenge).substring(0, 24);
}
