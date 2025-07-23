export function hashKerberos5TgsRep23(encryptedTicket, salt = '') {
  console.warn('Simplified Kerberos 5 TGS-REP implementation');
  
  // This is a very simplified version - real implementation would parse ASN.1
  const combined = encryptedTicket + salt;
  return customMd5(combined);
}