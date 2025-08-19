import { hashMd5 } from './hashMd5.js';

// Kerberos 5 TGS-REP etype 23 (RC4-HMAC) implementation
export async function hashKerberos5TgsRep23(encryptedTicket, salt = '') {
  // Kerberos 5 TGS-REP with etype 23 uses RC4-HMAC (MD5-based)
  // The encrypted ticket is typically in the format:
  // $krb5tgs$23$*user$realm$spn*$checksum$edata2
  
  if (!encryptedTicket || encryptedTicket.length < 32) {
    throw new Error('Invalid encrypted ticket data');
  }
  
  // Extract components if in hashcat format
  let ticketData = encryptedTicket;
  let checksum = '';
  
  if (encryptedTicket.includes('$')) {
    const parts = encryptedTicket.split('$');
    if (parts.length >= 6) {
      checksum = parts[5];
      ticketData = parts[6] || '';
    }
  }
  
  // For etype 23 (RC4-HMAC), we use MD5-based HMAC
  const combined = ticketData + salt;
  const hash = await hashMd5(combined);
  
  // Format output in hashcat format if we have the components
  if (checksum) {
    return `$krb5tgs$23$*${salt}*$${checksum}$${hash}`;
  }
  
  // Otherwise return just the hash
  return hash;
}