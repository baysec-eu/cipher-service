// Custom SHA-1 implementation that returns byte arrays
// Based on FIPS PUB 180-1 specification

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

export function customSha1Bytes(input) {
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

  // SHA-1 initial hash values
  const h = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
  
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
  
  // Append length as 64-bit big-endian integer
  for (let i = 7; i >= 0; i--) {
    bytes.push((bitLength >>> (i * 8)) & 0xFF);
  }
  
  // Process the message in successive 512-bit chunks
  for (let offset = 0; offset < bytes.length; offset += 64) {
    const w = new Array(80);
    
    // Break chunk into sixteen 32-bit big-endian words
    for (let i = 0; i < 16; i++) {
      w[i] = (bytes[offset + i * 4] << 24) |
             (bytes[offset + i * 4 + 1] << 16) |
             (bytes[offset + i * 4 + 2] << 8) |
             bytes[offset + i * 4 + 3];
    }
    
    // Extend the sixteen 32-bit words into eighty 32-bit words
    for (let i = 16; i < 80; i++) {
      w[i] = rotateLeft(w[i - 3] ^ w[i - 8] ^ w[i - 14] ^ w[i - 16], 1);
    }
    
    // Initialize hash value for this chunk
    let [a, b, c, d, e] = h;
    
    // Main SHA-1 algorithm
    for (let i = 0; i < 80; i++) {
      let f, k;
      
      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5A827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ED9EBA1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8F1BBCDC;
      } else {
        f = b ^ c ^ d;
        k = 0xCA62C1D6;
      }
      
      const temp = addUnsigned(addUnsigned(rotateLeft(a, 5), f), addUnsigned(addUnsigned(e, w[i]), k));
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = temp;
    }
    
    // Add this chunk's hash to result so far
    h[0] = addUnsigned(h[0], a);
    h[1] = addUnsigned(h[1], b);
    h[2] = addUnsigned(h[2], c);
    h[3] = addUnsigned(h[3], d);
    h[4] = addUnsigned(h[4], e);
  }
  
  // Convert result to byte array (big-endian)
  const result = [];
  for (let i = 0; i < 5; i++) {
    result.push((h[i] >>> 24) & 0xFF);
    result.push((h[i] >>> 16) & 0xFF);
    result.push((h[i] >>> 8) & 0xFF);
    result.push((h[i] >>> 0) & 0xFF);
  }
  
  return result;
}

export function customSha1(input) {
  return bytesToHex(customSha1Bytes(input));
}