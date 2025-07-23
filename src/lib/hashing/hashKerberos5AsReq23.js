export function hashKerberos5AsReq23(timestamp, clientChallenge, salt = '') {
  console.warn('Simplified Kerberos 5 AS-REQ implementation');
  
  const combined = timestamp + clientChallenge + salt;
  return customMd5(combined);
}