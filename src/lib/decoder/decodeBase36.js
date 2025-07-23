export function decodeBase36(s) {
  try {
    let num = 0n;
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    for (const char of s.toUpperCase()) {
      const value = alphabet.indexOf(char);
      if (value === -1) throw new Error('Invalid character');
      num = num * 36n + BigInt(value);
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
