import { hashMd4 } from './hashMd4.js';
import { hmacMd5 } from './hmacMd5.js';
import { rc4Encrypt } from '../cipher/rc4Encrypt.js';

// Kerberos 5 AS-REQ pre-authentication etype 23 (RC4-HMAC) implementation
// Based on RFC 4757 (RC4-HMAC in Kerberos)
export async function hashKerberos5AsReq23(username, realm, password, timestamp = null) {
  // Validate inputs
  if (!username || !realm || !password) {
    throw new Error('Username, realm, and password are required');
  }
  
  // Generate timestamp if not provided (Kerberos time format)
  if (!timestamp) {
    // Kerberos time is seconds since Jan 1, 1970 UTC
    timestamp = Math.floor(Date.now() / 1000);
  }
  
  // Step 1: Generate the NTLM hash of the password (MD4 of Unicode password)
  // Convert password to UTF-16LE (Windows Unicode format)
  const passwordUtf16 = new Uint8Array(password.length * 2);
  for (let i = 0; i < password.length; i++) {
    const code = password.charCodeAt(i);
    passwordUtf16[i * 2] = code & 0xff;
    passwordUtf16[i * 2 + 1] = (code >> 8) & 0xff;
  }
  
  // NTLM hash is MD4 of UTF-16LE password
  const ntlmHash = hashMd4(passwordUtf16);
  const ntlmHashBytes = new Uint8Array(ntlmHash.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // Step 2: Create the PA-ENC-TIMESTAMP structure
  // Kerberos timestamp format: YYYYMMDDHHMMSSZsss (19 bytes)
  const date = new Date(timestamp * 1000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const timestampStr = `${year}${month}${day}${hours}${minutes}${seconds}Z`;
  
  // Create PA-ENC-TIMESTAMP ASN.1 structure
  // SEQUENCE { [0] KerberosTime, [1] microseconds (optional) }
  const timestampBytes = new TextEncoder().encode(timestampStr);
  
  // Simplified ASN.1 encoding for PA-ENC-TIMESTAMP
  const paEncTimestamp = new Uint8Array([
    0x30, 0x1d,  // SEQUENCE, length 29
    0xa0, 0x13,  // [0] CONTEXT, length 19
    0x18, 0x11,  // GeneralizedTime, length 17
    ...timestampBytes,
    0xa1, 0x06,  // [1] CONTEXT, length 6 (microseconds)
    0x02, 0x04,  // INTEGER, length 4
    0x00, 0x00, 0x00, 0x00  // microseconds = 0
  ]);
  
  // Step 3: Generate the confounder (8 random bytes for RC4)
  const confounder = new Uint8Array(8);
  crypto.getRandomValues(confounder);
  
  // Step 4: Concatenate confounder and timestamp for encryption
  const plaintext = new Uint8Array(confounder.length + paEncTimestamp.length);
  plaintext.set(confounder);
  plaintext.set(paEncTimestamp, confounder.length);
  
  // Step 5: Calculate the HMAC-MD5 checksum
  // Key usage number for AS-REQ PA-ENC-TIMESTAMP is 1
  const keyUsage = new Uint8Array([0x00, 0x00, 0x00, 0x01]);
  
  // Create the key for checksum: K1 = HMAC-MD5(NTLM-hash, key-usage)
  const k1 = await hmacMd5(ntlmHashBytes, keyUsage);
  const k1Bytes = new Uint8Array(k1.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // Calculate checksum: HMAC-MD5(K1, plaintext)
  const checksum = await hmacMd5(k1Bytes, plaintext);
  const checksumBytes = new Uint8Array(checksum.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // Step 6: Create encryption key
  // K2 = HMAC-MD5(NTLM-hash, checksum)
  const k2 = await hmacMd5(ntlmHashBytes, checksumBytes);
  const k2Bytes = new Uint8Array(k2.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  
  // Step 7: Encrypt the plaintext with RC4
  const ciphertext = rc4Encrypt(plaintext, k2Bytes);
  
  // Step 8: Combine checksum and ciphertext
  // EncryptedData ::= SEQUENCE {
  //   etype [0] Int32 -- 23 for RC4-HMAC
  //   kvno  [1] UInt32 OPTIONAL
  //   cipher [2] OCTET STRING -- checksum | encrypted data
  // }
  const encryptedData = checksum + ciphertext;
  
  // Format for hashcat (krb5asrep)
  // $krb5asrep$23$user@realm:checksum$encdata
  const principal = `${username}@${realm.toUpperCase()}`;
  return `$krb5asrep$23$${principal}:${checksum}$${encryptedData}`;
}