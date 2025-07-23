export function encodeBase36(s) {
  const bytes = new TextEncoder().encode(s);
  let result = '';
  let num = 0n;
  
  // Convert bytes to big integer
  for (const byte of bytes) {
    num = (num << 8n) + BigInt(byte);
  }
  
  if (num === 0n) return '0';
  
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  while (num > 0n) {
    result = alphabet[Number(num % 36n)] + result;
    num = num / 36n;
  }
  
  return result;
}