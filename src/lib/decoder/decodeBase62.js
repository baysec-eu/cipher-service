export function decodeBase62(s) {
  try {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let num = 0n;
    
    for (const char of s) {
      const value = alphabet.indexOf(char);
      if (value === -1) throw new Error('Invalid character');
      num = num * 62n + BigInt(value);
    }
    
    if (num === 0n) return '\x00';
    
    const bytes = [];
    while (num > 0n) {
      bytes.unshift(Number(num % 256n));
      num = num / 256n;
    }
    
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return s;
  }
}
