export function hashMysql(password) {
  if (!password) return '';
  
  // MySQL uses SHA1 twice: SHA1(SHA1(password))
  const firstSha1 = customSha1Bytes(new TextEncoder().encode(password));
  const secondSha1 = customSha1Bytes(firstSha1);
  
  return Array.from(secondSha1)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').toUpperCase();
}