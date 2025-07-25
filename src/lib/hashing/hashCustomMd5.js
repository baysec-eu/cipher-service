// Custom MD5 implementation that returns byte arrays
// Based on RFC 1321 specification

function rotateLeft(value, shift) {
  return (value << shift) | (value >>> (32 - shift));
}

function addUnsigned(x, y) {
  return (x + y) >>> 0;
}

function stringToUtf8Bytes(str) {
  const utf8 = new TextEncoder().encode(str);
  return Array.from(utf8);
}

function bytesToHex(bytes) {
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function customMd5Bytes(input) {
  let bytes;
  
  if (typeof input === 'string') {
    bytes = stringToUtf8Bytes(input);
  } else if (Array.isArray(input)) {
    bytes = input;
  } else if (input instanceof Uint8Array) {
    bytes = Array.from(input);
  } else {
    throw new Error('Input must be string, array, or Uint8Array');
  }

  // MD5 constants
  const h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476];
  
  // Pre-processing: adding padding bits
  const msgLength = bytes.length;
  const bitLength = msgLength * 8;
  
  // Append the '1' bit (plus seven '0' bits)
  bytes.push(0x80);
  
  // Append 0 <= k < 512 bits '0', such that the resulting message length
  // in bits is congruent to 448 (mod 512)
  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }
  
  // Append length as 64-bit little-endian integer
  for (let i = 0; i < 8; i++) {
    bytes.push((bitLength >>> (i * 8)) & 0xFF);
  }
  
  // Process the message in successive 512-bit chunks
  for (let offset = 0; offset < bytes.length; offset += 64) {
    const w = new Array(16);
    
    // Break chunk into sixteen 32-bit little-endian words
    for (let i = 0; i < 16; i++) {
      w[i] = bytes[offset + i * 4] |
             (bytes[offset + i * 4 + 1] << 8) |
             (bytes[offset + i * 4 + 2] << 16) |
             (bytes[offset + i * 4 + 3] << 24);
    }
    
    // Initialize hash value for this chunk
    let [a, b, c, d] = h;
    
    // MD5 round functions
    const F = (x, y, z) => (x & y) | (~x & z);
    const G = (x, y, z) => (x & z) | (y & ~z);
    const H = (x, y, z) => x ^ y ^ z;
    const I = (x, y, z) => y ^ (x | ~z);
    
    // Round constants
    const K = [
      0xD76AA478, 0xE8C7B756, 0x242070DB, 0xC1BDCEEE,
      0xF57C0FAF, 0x4787C62A, 0xA8304613, 0xFD469501,
      0x698098D8, 0x8B44F7AF, 0xFFFF5BB1, 0x895CD7BE,
      0x6B901122, 0xFD987193, 0xA679438E, 0x49B40821,
      0xF61E2562, 0xC040B340, 0x265E5A51, 0xE9B6C7AA,
      0xD62F105D, 0x02441453, 0xD8A1E681, 0xE7D3FBC8,
      0x21E1CDE6, 0xC33707D6, 0xF4D50D87, 0x455A14ED,
      0xA9E3E905, 0xFCEFA3F8, 0x676F02D9, 0x8D2A4C8A,
      0xFFFA3942, 0x8771F681, 0x6D9D6122, 0xFDE5380C,
      0xA4BEEA44, 0x4BDECFA9, 0xF6BB4B60, 0xBEBFBC70,
      0x289B7EC6, 0xEAA127FA, 0xD4EF3085, 0x04881D05,
      0xD9D4D039, 0xE6DB99E5, 0x1FA27CF8, 0xC4AC5665,
      0xF4292244, 0x432AFF97, 0xAB9423A7, 0xFC93A039,
      0x655B59C3, 0x8F0CCC92, 0xFFEFF47D, 0x85845DD1,
      0x6FA87E4F, 0xFE2CE6E0, 0xA3014314, 0x4E0811A1,
      0xF7537E82, 0xBD3AF235, 0x2AD7D2BB, 0xEB86D391
    ];
    
    // Shift amounts
    const S = [
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
      5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
      4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
      6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];
    
    // Main MD5 algorithm
    for (let i = 0; i < 64; i++) {
      let f, g;
      
      if (i < 16) {
        f = F(b, c, d);
        g = i;
      } else if (i < 32) {
        f = G(b, c, d);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = H(b, c, d);
        g = (3 * i + 5) % 16;
      } else {
        f = I(b, c, d);
        g = (7 * i) % 16;
      }
      
      const temp = d;
      d = c;
      c = b;
      b = addUnsigned(b, rotateLeft(addUnsigned(addUnsigned(a, f), addUnsigned(K[i], w[g])), S[i]));
      a = temp;
    }
    
    // Add this chunk's hash to result so far
    h[0] = addUnsigned(h[0], a);
    h[1] = addUnsigned(h[1], b);
    h[2] = addUnsigned(h[2], c);
    h[3] = addUnsigned(h[3], d);
  }
  
  // Convert result to byte array (little-endian)
  const result = [];
  for (let i = 0; i < 4; i++) {
    result.push((h[i] >>> 0) & 0xFF);
    result.push((h[i] >>> 8) & 0xFF);
    result.push((h[i] >>> 16) & 0xFF);
    result.push((h[i] >>> 24) & 0xFF);
  }
  
  return result;
}

export function customMd5(input) {
  return bytesToHex(customMd5Bytes(input));
}