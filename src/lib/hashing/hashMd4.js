// MD4 hash implementation - needed for NTLM and other legacy hashes
// Based on RFC 1320 specification

export function hashMd4(input) {
  // Convert input to bytes if it's a string
  const bytes = typeof input === 'string' ? 
    new TextEncoder().encode(input) : 
    new Uint8Array(input);
  
  // MD4 algorithm implementation
  function F(x, y, z) { return (x & y) | (~x & z); }
  function G(x, y, z) { return (x & y) | (x & z) | (y & z); }
  function H(x, y, z) { return x ^ y ^ z; }
  
  function rotateLeft(value, bits) {
    return ((value << bits) | (value >>> (32 - bits))) >>> 0;
  }
  
  function addUnsigned(x, y) {
    return ((x + y) & 0xFFFFFFFF) >>> 0;
  }
  
  // Initialize MD4 hash values (RFC 1320)
  let h0 = 0x67452301;
  let h1 = 0xEFCDAB89;
  let h2 = 0x98BADCFE;
  let h3 = 0x10325476;
  
  // Pre-process the message
  const msgLen = bytes.length;
  const bitLen = msgLen * 8;
  
  // Append padding (1 bit + zeros + 64-bit length)
  const paddedLen = Math.ceil((msgLen + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  padded.set(bytes);
  padded[msgLen] = 0x80; // Append '1' bit
  
  // Append length as 64-bit little-endian
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLen - 8, bitLen, true);  // Low 32 bits
  view.setUint32(paddedLen - 4, 0, true);      // High 32 bits (assuming < 2^32 bits)
  
  // Process message in 512-bit chunks
  for (let i = 0; i < paddedLen; i += 64) {
    // Break chunk into sixteen 32-bit little-endian words
    const w = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4, true);
    }
    
    // Initialize hash value for this chunk
    let a = h0, b = h1, c = h2, d = h3;
    
    // Main loop - Round 1
    function round1(a, b, c, d, x, s) {
      return rotateLeft(addUnsigned(addUnsigned(a, F(b, c, d)), x), s);
    }
    
    a = round1(a, b, c, d, w[0], 3);   d = round1(d, a, b, c, w[1], 7);
    c = round1(c, d, a, b, w[2], 11);  b = round1(b, c, d, a, w[3], 19);
    a = round1(a, b, c, d, w[4], 3);   d = round1(d, a, b, c, w[5], 7);
    c = round1(c, d, a, b, w[6], 11);  b = round1(b, c, d, a, w[7], 19);
    a = round1(a, b, c, d, w[8], 3);   d = round1(d, a, b, c, w[9], 7);
    c = round1(c, d, a, b, w[10], 11); b = round1(b, c, d, a, w[11], 19);
    a = round1(a, b, c, d, w[12], 3);  d = round1(d, a, b, c, w[13], 7);
    c = round1(c, d, a, b, w[14], 11); b = round1(b, c, d, a, w[15], 19);
    
    // Main loop - Round 2
    function round2(a, b, c, d, x, s) {
      return rotateLeft(addUnsigned(addUnsigned(addUnsigned(a, G(b, c, d)), x), 0x5A827999), s);
    }
    
    a = round2(a, b, c, d, w[0], 3);   d = round2(d, a, b, c, w[4], 5);
    c = round2(c, d, a, b, w[8], 9);   b = round2(b, c, d, a, w[12], 13);
    a = round2(a, b, c, d, w[1], 3);   d = round2(d, a, b, c, w[5], 5);
    c = round2(c, d, a, b, w[9], 9);   b = round2(b, c, d, a, w[13], 13);
    a = round2(a, b, c, d, w[2], 3);   d = round2(d, a, b, c, w[6], 5);
    c = round2(c, d, a, b, w[10], 9);  b = round2(b, c, d, a, w[14], 13);
    a = round2(a, b, c, d, w[3], 3);   d = round2(d, a, b, c, w[7], 5);
    c = round2(c, d, a, b, w[11], 9);  b = round2(b, c, d, a, w[15], 13);
    
    // Main loop - Round 3
    function round3(a, b, c, d, x, s) {
      return rotateLeft(addUnsigned(addUnsigned(addUnsigned(a, H(b, c, d)), x), 0x6ED9EBA1), s);
    }
    
    a = round3(a, b, c, d, w[0], 3);   d = round3(d, a, b, c, w[8], 9);
    c = round3(c, d, a, b, w[4], 11);  b = round3(b, c, d, a, w[12], 15);
    a = round3(a, b, c, d, w[2], 3);   d = round3(d, a, b, c, w[10], 9);
    c = round3(c, d, a, b, w[6], 11);  b = round3(b, c, d, a, w[14], 15);
    a = round3(a, b, c, d, w[1], 3);   d = round3(d, a, b, c, w[9], 9);
    c = round3(c, d, a, b, w[5], 11);  b = round3(b, c, d, a, w[13], 15);
    a = round3(a, b, c, d, w[3], 3);   d = round3(d, a, b, c, w[11], 9);
    c = round3(c, d, a, b, w[7], 11);  b = round3(b, c, d, a, w[15], 15);
    
    // Add this chunk's hash to result
    h0 = addUnsigned(h0, a);
    h1 = addUnsigned(h1, b);
    h2 = addUnsigned(h2, c);
    h3 = addUnsigned(h3, d);
  }
  
  // Convert to hex string (little-endian)
  function toHex(n) {
    const bytes = [(n & 0xFF), ((n >> 8) & 0xFF), ((n >> 16) & 0xFF), ((n >> 24) & 0xFF)];
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3);
}

// Export MD4 bytes function for use in other crypto operations
export function hashMd4Bytes(input) {
  const hex = hashMd4(input);
  return new Uint8Array(hex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
}