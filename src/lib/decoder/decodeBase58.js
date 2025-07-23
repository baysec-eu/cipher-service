export function decodeBase58(s) {
  try {
    const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    
    // Count leading 1s
    let leadingOnes = 0;
    for (const char of s) {
      if (char === '1') leadingOnes++;
      else break;
    }
    
    // Convert to big integer
    let num = 0n;
    for (const char of s) {
      const value = alphabet.indexOf(char);
      if (value === -1) throw new Error('Invalid character');
      num = num * 58n + BigInt(value);
    }
    
    // Convert to bytes
    const bytes = [];
    while (num > 0n) {
      bytes.unshift(Number(num % 256n));
      num = num / 256n;
    }
    
    // Add leading zeros for leading 1s
    const result = new Uint8Array(leadingOnes + bytes.length);
    result.set(bytes, leadingOnes);
    
    return new TextDecoder().decode(result);
  } catch {
    return s;
  }
}
