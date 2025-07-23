export function decodeBaseX(s, alphabet) {
  try {
    if (!alphabet || alphabet.length < 2) {
      throw new Error('Alphabet must contain at least 2 characters');
    }
    
    const base = BigInt(alphabet.length);
    let num = 0n;
    
    for (const char of s) {
      const value = alphabet.indexOf(char);
      if (value === -1) throw new Error('Invalid character');
      num = num * base + BigInt(value);
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
