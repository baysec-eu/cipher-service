import { hashMd4 } from './hashMd4.js';
import { customMd5 } from './hashCustomMd5.js';

// NTLM hash: MD4 of UTF-16LE encoded password
function hashNtlm(password) {
  const utf16le = new Uint8Array(password.length * 2);
  for (let i = 0; i < password.length; i++) {
    const code = password.charCodeAt(i);
    utf16le[i * 2] = code & 0xFF;
    utf16le[i * 2 + 1] = (code >> 8) & 0xFF;
  }

  // Use proper MD4 (not MD5)
  return hashMd4(utf16le);
}

export function hashNetNtlmv1(username, password, domain = '', serverChallenge = '', clientChallenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = username + domain;

  const response1 = customMd5(ntlmHash + serverChallenge + clientChallenge).substring(0, 16);
  const response2 = customMd5(identity + serverChallenge).substring(0, 16);

  return `${identity}::${domain}:${response1}:${response2}:${serverChallenge}`;
}
