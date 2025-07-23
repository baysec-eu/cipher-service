export function encodeBase62(s) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const bytes = new TextEncoder().encode(s);
  let result = '';
  let num = 0n;
  
  for (const byte of bytes) {
    num = (num << 8n) + BigInt(byte);
  }
  
  if (num === 0n) return '0';
  
  while (num > 0n) {
    result = alphabet[Number(num % 62n)] + result;
    num = num / 62n;
  }
  
  return result;
}