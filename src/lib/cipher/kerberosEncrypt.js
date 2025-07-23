export function kerberosEncrypt(data, key, keyType = 'RC4') {
  console.warn('Simplified Kerberos implementation - use proper Kerberos library for production');
  
  switch (keyType.toUpperCase()) {
    case 'RC4':
      return rc4Encrypt(data, key);
    case 'AES128':
    case 'AES256':
      // Would use AES in real implementation
      return rc4Encrypt(data, key); // Fallback to RC4
    default:
      throw new Error('Unsupported Kerberos key type');
  }
}