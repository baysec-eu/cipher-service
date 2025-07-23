export function encodeBaseX(s, alphabet) {
  if (!alphabet || alphabet.length < 2) {
    throw new Error('Alphabet must contain at least 2 characters');
  }
  
  const base = alphabet.length;
  const bytes = new TextEncoder().encode(s);
  
  // Convert to big integer
  let num = 0n;
  for (const byte of bytes) {
    num = num * 256n + BigInt(byte);
  }
  
  if (num === 0n) return alphabet[0];
  
  let result = '';
  while (num > 0n) {
    result = alphabet[Number(num % BigInt(base))] + result;
    num = num / BigInt(base);
  }
  
  return result;
}