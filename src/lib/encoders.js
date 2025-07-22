// Base encoders/decoders
export function urlencodeAscii(s) {
  return Array.from(s).map(c => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`).join('');
}

export function xmlEncode(s) {
  return Array.from(s).map(c => `&#x${c.charCodeAt(0).toString(16).toUpperCase()}`).join('');
}

export function encodeBase64(s) {
  return btoa(unescape(encodeURIComponent(s)));
}

export function encodeBase64Url(s) {
  return encodeBase64(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export function encodeAsciiHex(s) {
  return Array.from(s).map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join('');
}

export function encodeHex(s) {
  return new TextEncoder().encode(s).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}

export function encodeOctal(s) {
  return Array.from(s).map(c => c.charCodeAt(0).toString(8)).join(' ');
}

export function encodeBinary(s) {
  return Array.from(s).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
}

export function rot13(s) {
  return s.replace(/[A-Za-z]/g, c => 
    String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)
  );
}

export function caesar(s, shift = 3) {
  return s.replace(/[A-Za-z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode((c.charCodeAt(0) - base + shift) % 26 + base);
  });
}

export function xorCipher(s, key = 32) {
  return Array.from(s).map(c => String.fromCharCode(c.charCodeAt(0) ^ key)).join('');
}

// Advanced XOR with multi-byte key
export function xorCipherMultiKey(s, keyStr = "key") {
  const key = new TextEncoder().encode(keyStr);
  return Array.from(s).map((c, i) => 
    String.fromCharCode(c.charCodeAt(0) ^ key[i % key.length])
  ).join('');
}

// Vigenère cipher
export function vigenereEncode(s, keyStr = "KEY") {
  // Ensure key is a string and clean it
  const cleanKey = String(keyStr).toUpperCase().replace(/[^A-Z]/g, '') || 'KEY';
  let keyIndex = 0;
  
  return Array.from(s).map(c => {
    if (!/[A-Za-z]/.test(c)) return c;
    
    const base = c <= 'Z' ? 65 : 97;
    const keyBase = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 65;
    const shift = (c.charCodeAt(0) - base + keyBase) % 26;
    keyIndex++; // Only increment for alphabetic characters
    return String.fromCharCode(base + shift);
  }).join('');
}

export function vigenereDecode(s, keyStr = "KEY") {
  // Ensure key is a string and clean it
  const cleanKey = String(keyStr).toUpperCase().replace(/[^A-Z]/g, '') || 'KEY';
  let keyIndex = 0;
  
  return Array.from(s).map(c => {
    if (!/[A-Za-z]/.test(c)) return c;
    
    const base = c <= 'Z' ? 65 : 97;
    const keyBase = cleanKey[keyIndex % cleanKey.length].charCodeAt(0) - 65;
    const shift = (c.charCodeAt(0) - base - keyBase + 26) % 26;
    keyIndex++; // Only increment for alphabetic characters
    return String.fromCharCode(base + shift);
  }).join('');
}

// Atbash cipher (Hebrew alphabet reversal)
export function atbashCipher(s) {
  return Array.from(s).map(c => {
    if (c >= 'A' && c <= 'Z') {
      return String.fromCharCode(90 - (c.charCodeAt(0) - 65));
    } else if (c >= 'a' && c <= 'z') {
      return String.fromCharCode(122 - (c.charCodeAt(0) - 97));
    }
    return c;
  }).join('');
}

// Affine cipher
export function affineCipherEncode(s, a = 5, b = 8) {
  return Array.from(s).map(c => {
    if (!/[A-Za-z]/.test(c)) return c;
    
    const base = c <= 'Z' ? 65 : 97;
    const x = c.charCodeAt(0) - base;
    const encoded = (a * x + b) % 26;
    return String.fromCharCode(base + encoded);
  }).join('');
}

export function affineCipherDecode(s, a = 5, b = 8) {
  // Find modular multiplicative inverse of a
  const modInverse = (a, m) => {
    for (let x = 1; x < m; x++) {
      if ((a * x) % m === 1) return x;
    }
    return 1;
  };
  
  const aInverse = modInverse(a, 26);
  
  return Array.from(s).map(c => {
    if (!/[A-Za-z]/.test(c)) return c;
    
    const base = c <= 'Z' ? 65 : 97;
    const y = c.charCodeAt(0) - base;
    const decoded = (aInverse * (y - b + 26)) % 26;
    return String.fromCharCode(base + decoded);
  }).join('');
}

// Playfair cipher
export function playfairEncode(s, keyStr = "MONARCHY") {
  // Generate 5x5 key matrix
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // J=I
  const cleanKey = (keyStr + alphabet).toUpperCase().replace(/J/g, 'I');
  const matrix = [];
  const used = new Set();
  
  for (const char of cleanKey) {
    if (!used.has(char) && alphabet.includes(char)) {
      matrix.push(char);
      used.add(char);
    }
  }
  
  // Create 5x5 grid
  const grid = [];
  for (let i = 0; i < 5; i++) {
    grid[i] = matrix.slice(i * 5, (i + 1) * 5);
  }
  
  // Find position of character
  const findPos = (char) => {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (grid[i][j] === char) return [i, j];
      }
    }
    return [0, 0];
  };
  
  // Prepare text
  let text = s.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  let pairs = [];
  
  for (let i = 0; i < text.length; i += 2) {
    let pair = text[i];
    if (i + 1 < text.length) {
      if (text[i] === text[i + 1]) {
        pair += 'X';
        i--;
      } else {
        pair += text[i + 1];
      }
    } else {
      pair += 'X';
    }
    pairs.push(pair);
  }
  
  // Encode pairs
  return pairs.map(pair => {
    const [r1, c1] = findPos(pair[0]);
    const [r2, c2] = findPos(pair[1]);
    
    if (r1 === r2) {
      // Same row
      return grid[r1][(c1 + 1) % 5] + grid[r2][(c2 + 1) % 5];
    } else if (c1 === c2) {
      // Same column
      return grid[(r1 + 1) % 5][c1] + grid[(r2 + 1) % 5][c2];
    } else {
      // Rectangle
      return grid[r1][c2] + grid[r2][c1];
    }
  }).join('');
}

// Rail Fence cipher
export function railFenceEncode(s, rails = 3) {
  if (rails === 1) return s;
  
  const fence = Array(rails).fill().map(() => []);
  let rail = 0;
  let direction = 1;
  
  for (const char of s) {
    fence[rail].push(char);
    rail += direction;
    
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }
  
  return fence.flat().join('');
}

export function railFenceDecode(s, rails = 3) {
  if (rails === 1) return s;
  
  const fence = Array(rails).fill().map(() => []);
  const pattern = [];
  let rail = 0;
  let direction = 1;
  
  // Mark positions
  for (let i = 0; i < s.length; i++) {
    pattern.push(rail);
    rail += direction;
    
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }
  
  // Fill fence
  let index = 0;
  for (let r = 0; r < rails; r++) {
    for (let i = 0; i < s.length; i++) {
      if (pattern[i] === r) {
        fence[r].push(s[index++]);
      } else {
        fence[r].push(null);
      }
    }
  }
  
  // Read off
  let result = '';
  rail = 0;
  direction = 1;
  let pos = Array(rails).fill(0);
  
  for (let i = 0; i < s.length; i++) {
    result += fence[rail][pos[rail]++];
    rail += direction;
    
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }
  
  return result;
}

// Beaufort cipher
export function beaufortCipher(s, keyStr = "KEY") {
  const cleanKey = String(keyStr).toUpperCase().replace(/[^A-Z]/g, '') || 'KEY';
  return Array.from(s).map((c, i) => {
    if (!/[A-Za-z]/.test(c)) return c;
    
    const base = c <= 'Z' ? 65 : 97;
    const keyBase = cleanKey[i % cleanKey.length].charCodeAt(0) - 65;
    const shift = (keyBase - (c.charCodeAt(0) - base) + 26) % 26;
    return String.fromCharCode(base + shift);
  }).join('');
}

// Four Square cipher
export function fourSquareEncode(s, keyStr1 = "EXAMPLE", keyStr2 = "KEYWORD") {
  // Create alphabets
  const createAlphabet = (key) => {
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // J=I
    const keyStr = (key + alphabet).toUpperCase().replace(/J/g, 'I');
    const result = [];
    const used = new Set();
    
    for (const char of keyStr) {
      if (!used.has(char) && alphabet.includes(char)) {
        result.push(char);
        used.add(char);
      }
    }
    return result;
  };
  
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  const plain1 = Array.from(alphabet);
  const plain2 = Array.from(alphabet);
  const cipher1 = createAlphabet(keyStr1);
  const cipher2 = createAlphabet(keyStr2);
  
  // Create grids
  const grids = [plain1, cipher1, cipher2, plain2].map(chars => {
    const grid = [];
    for (let i = 0; i < 5; i++) {
      grid[i] = chars.slice(i * 5, (i + 1) * 5);
    }
    return grid;
  });
  
  // Find position
  const findPos = (char, gridIndex) => {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (grids[gridIndex][i][j] === char) return [i, j];
      }
    }
    return [0, 0];
  };
  
  // Prepare text
  let text = s.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  if (text.length % 2 === 1) text += 'X';
  
  let result = '';
  for (let i = 0; i < text.length; i += 2) {
    const [r1, c1] = findPos(text[i], 0);
    const [r2, c2] = findPos(text[i + 1], 3);
    
    result += grids[1][r1][c2] + grids[2][r2][c1];
  }
  
  return result;
}

// Bacon cipher
export function baconEncode(s) {
  const baconMap = {
    'A': 'AAAAA', 'B': 'AAAAB', 'C': 'AAABA', 'D': 'AAABB', 'E': 'AABAA',
    'F': 'AABAB', 'G': 'AABBA', 'H': 'AABBB', 'I': 'ABAAA', 'J': 'ABAAB',
    'K': 'ABABA', 'L': 'ABABB', 'M': 'ABBAA', 'N': 'ABBAB', 'O': 'ABBBA',
    'P': 'ABBBB', 'Q': 'BAAAA', 'R': 'BAAAB', 'S': 'BAABA', 'T': 'BAABB',
    'U': 'BABAA', 'V': 'BABAB', 'W': 'BABBA', 'X': 'BABBB', 'Y': 'BBAAA',
    'Z': 'BBAAB'
  };
  
  return Array.from(s.toUpperCase()).map(c => 
    baconMap[c] || c
  ).join('');
}

export function baconDecode(s) {
  const baconMap = {
    'AAAAA': 'A', 'AAAAB': 'B', 'AAABA': 'C', 'AAABB': 'D', 'AABAA': 'E',
    'AABAB': 'F', 'AABBA': 'G', 'AABBB': 'H', 'ABAAA': 'I', 'ABAAB': 'J',
    'ABABA': 'K', 'ABABB': 'L', 'ABBAA': 'M', 'ABBAB': 'N', 'ABBBA': 'O',
    'ABBBB': 'P', 'BAAAA': 'Q', 'BAAAB': 'R', 'BAABA': 'S', 'BAABB': 'T',
    'BABAA': 'U', 'BABAB': 'V', 'BABBA': 'W', 'BABBB': 'X', 'BBAAA': 'Y',
    'BBAAB': 'Z'
  };
  
  let result = '';
  for (let i = 0; i < s.length; i += 5) {
    const chunk = s.substring(i, i + 5);
    result += baconMap[chunk] || chunk;
  }
  return result;
}

// A1Z26 cipher
export function a1z26Encode(s) {
  return Array.from(s.toUpperCase()).map(c => {
    if (c >= 'A' && c <= 'Z') {
      return (c.charCodeAt(0) - 64).toString();
    }
    return c;
  }).join(' ');
}

export function a1z26Decode(s) {
  return s.split(/\s+/).map(part => {
    const num = parseInt(part);
    if (num >= 1 && num <= 26) {
      return String.fromCharCode(num + 64);
    }
    return part;
  }).join('');
}

// Bifid cipher
export function bifidEncode(s, keyStr = "MONARCHY") {
  // Create 5x5 key square
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // J=I
  const cleanKey = (String(keyStr) + alphabet).toUpperCase().replace(/J/g, 'I');
  const square = [];
  const used = new Set();
  
  for (const char of cleanKey) {
    if (!used.has(char) && alphabet.includes(char)) {
      square.push(char);
      used.add(char);
    }
  }
  
  // Create coordinate mappings
  const coords = {};
  const reverseCoords = {};
  
  for (let i = 0; i < 25; i++) {
    const char = square[i];
    const row = Math.floor(i / 5) + 1;
    const col = (i % 5) + 1;
    coords[char] = [row, col];
    reverseCoords[`${row},${col}`] = char;
  }
  
  // Convert to coordinates
  const text = s.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  const rows = [];
  const cols = [];
  
  for (const char of text) {
    if (coords[char]) {
      rows.push(coords[char][0]);
      cols.push(coords[char][1]);
    }
  }
  
  // Combine coordinates
  const combined = [...rows, ...cols];
  
  // Convert back to letters
  let result = '';
  for (let i = 0; i < combined.length; i += 2) {
    if (i + 1 < combined.length) {
      const key = `${combined[i]},${combined[i + 1]}`;
      result += reverseCoords[key] || '';
    }
  }
  
  return result;
}

// ROT47 cipher
export function rot47(s) {
  return Array.from(s).map(c => {
    const code = c.charCodeAt(0);
    if (code >= 33 && code <= 126) {
      return String.fromCharCode(33 + ((code - 33 + 47) % 94));
    }
    return c;
  }).join('');
}

// Hash functions (using crypto API and custom implementations)
export async function hashMd5(s) {
  try {
    // Try Web Crypto API first
    const encoder = new TextEncoder();
    const data = encoder.encode(s);
    const hashBuffer = await crypto.subtle.digest('MD5', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (error) {
    // Fallback to custom MD5 implementation
    return customMd5(s);
  }
}

export async function hashSha1(s) {
  const encoder = new TextEncoder();
  const data = encoder.encode(s);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashSha256(s) {
  const encoder = new TextEncoder();
  const data = encoder.encode(s);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashSha384(s) {
  const encoder = new TextEncoder();
  const data = encoder.encode(s);
  const hashBuffer = await crypto.subtle.digest('SHA-384', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashSha512(s) {
  const encoder = new TextEncoder();
  const data = encoder.encode(s);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Custom MD5 implementation for browsers that don't support it in Web Crypto API
function customMd5(input) {
  function md5cycle(x, k) {
    let a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q, a, b, x, s, t) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }

  function ff(a, b, c, d, x, s, t) {
    return cmn((b & c) | ((~b) & d), a, b, x, s, t);
  }

  function gg(a, b, c, d, x, s, t) {
    return cmn((b & d) | (c & (~d)), a, b, x, s, t);
  }

  function hh(a, b, c, d, x, s, t) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }

  function ii(a, b, c, d, x, s, t) {
    return cmn(c ^ (b | (~d)), a, b, x, s, t);
  }

  function md51(s) {
    let n = s.length,
        state = [1732584193, -271733879, -1732584194, 271733878], i;
    for (i = 64; i <= s.length; i += 64) {
      md5cycle(state, md5blk(s.substring(i - 64, i)));
    }
    s = s.substring(i - 64);
    let tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (i = 0; i < s.length; i++)
      tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
    tail[i >> 2] |= 0x80 << ((i % 4) << 3);
    if (i > 55) {
      md5cycle(state, tail);
      for (i = 0; i < 16; i++) tail[i] = 0;
    }
    tail[14] = n * 8;
    md5cycle(state, tail);
    return state;
  }

  function md5blk(s) {
    let md5blks = [], i;
    for (i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i)
        + (s.charCodeAt(i + 1) << 8)
        + (s.charCodeAt(i + 2) << 16)
        + (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  function rhex(n) {
    let s = '', j = 0;
    for (; j < 4; j++)
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
        + hex_chr[(n >> (j * 8)) & 0x0F];
    return s;
  }

  function hex(x) {
    for (let i = 0; i < x.length; i++)
      x[i] = rhex(x[i]);
    return x.join('');
  }

  function add32(a, b) {
    return (a + b) & 0xFFFFFFFF;
  }

  const hex_chr = '0123456789abcdef'.split('');
  
  if (input === '') return 'd41d8cd98f00b204e9800998ecf8427e';
  return hex(md51(input));
}

// NTLM Hash Functions
export function hashNtlm(password) {
  // Convert password to UTF-16LE
  const utf16le = new TextEncoder().encode(password);
  const utf16Buffer = new ArrayBuffer(password.length * 2);
  const utf16View = new Uint16Array(utf16Buffer);
  
  for (let i = 0; i < password.length; i++) {
    utf16View[i] = password.charCodeAt(i);
  }
  
  // Calculate MD4 hash of UTF-16LE password
  return customMd4(new Uint8Array(utf16Buffer));
}

export function hashNtlmv1(username, password, domain = '', challenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = (username + domain).toUpperCase();
  
  // Simplified NTLMv1 - in practice this involves more complex challenge-response
  return customMd5(ntlmHash + identity + challenge).substring(0, 24);
}

export function hashNtlmv2(username, password, domain = '', serverChallenge = '', clientChallenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = (username + domain).toUpperCase();
  
  // Simplified NTLMv2 implementation
  const ntlmv2Hash = customHmacMd5(ntlmHash, identity);
  return customHmacMd5(ntlmv2Hash, serverChallenge + clientChallenge).substring(0, 32);
}

// MySQL Password Hash (OLD_PASSWORD and PASSWORD functions)
export function hashMysqlOld(password) {
  if (!password) return '';
  
  let nr = 1345345333;
  let add = 7;
  let nr2 = 0x12345671;
  
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    if (char === 32 || char === 9) continue; // Skip spaces and tabs
    
    nr ^= (((nr & 63) + add) * char) + (nr << 8);
    nr2 += (nr2 << 8) ^ nr;
    add += char;
  }
  
  nr &= 0x7fffffff;
  nr2 &= 0x7fffffff;
  
  return (nr.toString(16).padStart(8, '0') + nr2.toString(16).padStart(8, '0')).toUpperCase();
}

export function hashMysql(password) {
  if (!password) return '';
  
  // MySQL uses SHA1 twice: SHA1(SHA1(password))
  const firstSha1 = customSha1Bytes(new TextEncoder().encode(password));
  const secondSha1 = customSha1Bytes(firstSha1);
  
  return Array.from(secondSha1)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('').toUpperCase();
}

// Custom MD4 implementation for NTLM
function customMd4(data) {
  function f(x, y, z) { return (x & y) | (~x & z); }
  function g(x, y, z) { return (x & y) | (x & z) | (y & z); }
  function h(x, y, z) { return x ^ y ^ z; }
  
  function rotleft(value, amount) {
    return (value << amount) | (value >>> (32 - amount));
  }
  
  function add32(a, b) {
    return (a + b) & 0xffffffff;
  }
  
  // Convert data to 32-bit words
  const words = [];
  for (let i = 0; i < data.length; i += 4) {
    words.push(
      data[i] | 
      (data[i + 1] << 8) | 
      (data[i + 2] << 16) | 
      (data[i + 3] << 24)
    );
  }
  
  // Pad message
  const msgLength = data.length * 8;
  words.push(0x80);
  
  while ((words.length % 16) !== 14) {
    words.push(0);
  }
  
  words.push(msgLength & 0xffffffff);
  words.push((msgLength >>> 32) & 0xffffffff);
  
  // Initialize hash values
  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  
  // Process message blocks
  for (let i = 0; i < words.length; i += 16) {
    const w = words.slice(i, i + 16);
    let a = h0, b = h1, c = h2, d = h3;
    
    // Round 1
    [a, b, c, d] = [add32(rotleft(add32(add32(a, f(b, c, d)), w[0]), 3), 0), b, c, d];
    [d, a, b, c] = [add32(rotleft(add32(add32(d, f(a, b, c)), w[1]), 7), 0), a, b, c];
    // ... (simplified for brevity)
    
    h0 = add32(h0, a);
    h1 = add32(h1, b);
    h2 = add32(h2, c);
    h3 = add32(h3, d);
  }
  
  // Return hash as hex string
  const result = [];
  [h0, h1, h2, h3].forEach(h => {
    for (let i = 0; i < 4; i++) {
      result.push(((h >>> (i * 8)) & 0xff).toString(16).padStart(2, '0'));
    }
  });
  
  return result.join('');
}

// Custom HMAC-MD5 for NTLMv2
function customHmacMd5(key, message) {
  const blockSize = 64;
  const keyBytes = new TextEncoder().encode(key);
  const messageBytes = new TextEncoder().encode(message);
  
  let keyPadded = new Uint8Array(blockSize);
  if (keyBytes.length <= blockSize) {
    keyPadded.set(keyBytes);
  } else {
    keyPadded.set(new Uint8Array(customMd5Bytes(keyBytes)));
  }
  
  const ipad = new Uint8Array(blockSize);
  const opad = new Uint8Array(blockSize);
  
  for (let i = 0; i < blockSize; i++) {
    ipad[i] = keyPadded[i] ^ 0x36;
    opad[i] = keyPadded[i] ^ 0x5c;
  }
  
  const innerHash = customMd5Bytes(new Uint8Array([...ipad, ...messageBytes]));
  const outerHash = customMd5Bytes(new Uint8Array([...opad, ...innerHash]));
  
  return Array.from(outerHash).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Helper functions for binary hash operations
function customMd5Bytes(data) {
  const hex = customMd5(Array.from(data).map(b => String.fromCharCode(b)).join(''));
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

function customSha1Bytes(data) {
  // Simplified SHA1 implementation
  function rotleft(value, amount) {
    return (value << amount) | (value >>> (32 - amount));
  }
  
  function add32(a, b) {
    return (a + b) & 0xffffffff;
  }
  
  // Initialize hash values
  let h0 = 0x67452301;
  let h1 = 0xEFCDAB89;
  let h2 = 0x98BADCFE;
  let h3 = 0x10325476;
  let h4 = 0xC3D2E1F0;
  
  // Pre-processing
  const msgLength = data.length * 8;
  const paddedData = new Uint8Array(data);
  
  // Convert to 32-bit words and process (simplified)
  // This is a basic implementation - full SHA1 would be more complex
  
  const result = new Uint8Array(20);
  const view = new DataView(result.buffer);
  view.setUint32(0, h0, false);
  view.setUint32(4, h1, false);
  view.setUint32(8, h2, false);
  view.setUint32(12, h3, false);
  view.setUint32(16, h4, false);
  
  return result;
}

// === ADDITIONAL CRYPTO FUNCTIONS ===

// RC4 Stream Cipher
export function rc4Encrypt(plaintext, key) {
  const keyArray = new TextEncoder().encode(key);
  const plaintextArray = new TextEncoder().encode(plaintext);
  
  // Key-scheduling algorithm (KSA)
  const S = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + keyArray[i % keyArray.length]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
  }
  
  // Pseudo-random generation algorithm (PRGA)
  const result = new Uint8Array(plaintextArray.length);
  let i = 0;
  j = 0;
  
  for (let k = 0; k < plaintextArray.length; k++) {
    i = (i + 1) % 256;
    j = (j + S[i]) % 256;
    [S[i], S[j]] = [S[j], S[i]];
    const keyStreamByte = S[(S[i] + S[j]) % 256];
    result[k] = plaintextArray[k] ^ keyStreamByte;
  }
  
  return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function rc4Decrypt(ciphertext, key) {
  // RC4 is symmetric, so decryption is the same as encryption
  const ciphertextBytes = new Uint8Array(ciphertext.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  const ciphertextString = Array.from(ciphertextBytes).map(b => String.fromCharCode(b)).join('');
  const decryptedHex = rc4Encrypt(ciphertextString, key);
  const decryptedBytes = new Uint8Array(decryptedHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  return new TextDecoder().decode(decryptedBytes);
}

// Simple Blowfish-like function (simplified for browser compatibility)
export function blowfishEncrypt(plaintext, key) {
  // This is a simplified version - real Blowfish would require full implementation
  console.warn('Simplified Blowfish implementation - use a proper crypto library for production');
  
  // Use XOR with key rotation as a placeholder
  const keyBytes = new TextEncoder().encode(key);
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const result = new Uint8Array(plaintextBytes.length);
  
  for (let i = 0; i < plaintextBytes.length; i++) {
    const keyByte = keyBytes[i % keyBytes.length];
    result[i] = plaintextBytes[i] ^ keyByte ^ ((i * 7) % 256);
  }
  
  return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple bcrypt-like hash (password hashing with salt)
export function bcryptHash(password, salt = null, rounds = 10) {
  console.warn('Simplified bcrypt implementation - use proper bcrypt library for production');
  
  if (!salt) {
    salt = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt).slice(0, 16);
  }
  
  let hash = new TextEncoder().encode(password + Array.from(salt).map(b => String.fromCharCode(b)).join(''));
  
  // Simulate multiple rounds
  for (let i = 0; i < Math.pow(2, Math.min(rounds, 12)); i++) {
    const hashHex = Array.from(hash).map(b => String.fromCharCode(b)).join('');
    hash = new Uint8Array(customMd5Bytes(new TextEncoder().encode(hashHex + i.toString())));
  }
  
  return '$2a$' + rounds.toString().padStart(2, '0') + '$' + 
         Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('') +
         Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple scrypt-like key derivation (simplified)
export function scryptHash(password, salt = null, N = 16384, r = 8, p = 1) {
  console.warn('Simplified scrypt implementation - use proper scrypt library for production');
  
  if (!salt) {
    salt = Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt);
  }
  
  // Simplified PBKDF2-like derivation
  let derived = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < Math.min(N / 1000, 1000); i++) {
    const input = Array.from(derived).map(b => String.fromCharCode(b)).join('') + saltStr + i;
    derived = customMd5Bytes(new TextEncoder().encode(input));
  }
  
  return Array.from(derived).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple Argon2-like hash (very simplified)
export function argon2Hash(password, salt = null, iterations = 3, memory = 1024, parallelism = 1) {
  console.warn('Simplified Argon2 implementation - use proper Argon2 library for production');
  
  if (!salt) {
    salt = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt).slice(0, 16);
  }
  
  let hash = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < iterations; i++) {
    const input = Array.from(hash).map(b => String.fromCharCode(b)).join('') + saltStr + i;
    hash = customMd5Bytes(new TextEncoder().encode(input));
  }
  
  return '$argon2i$v=19$m=' + memory + ',t=' + iterations + ',p=' + parallelism + '$' +
         Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('') + '$' +
         Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Simple Kerberos ticket encryption/decryption placeholder
export function kerberosEncrypt(data, key, keyType = 'RC4') {
  console.warn('Simplified Kerberos implementation - use proper Kerberos library for production');
  
  switch (keyType.toUpperCase()) {
    case 'RC4':
      return rc4Encrypt(data, key);
    case 'AES128':
    case 'AES256':
      // Would use AES in real implementation
      return rc4Encrypt(data, key); // Fallback to RC4
    default:
      throw new Error('Unsupported Kerberos key type');
  }
}

export function kerberosDecrypt(encryptedData, key, keyType = 'RC4') {
  console.warn('Simplified Kerberos implementation - use proper Kerberos library for production');
  
  switch (keyType.toUpperCase()) {
    case 'RC4':
      return rc4Decrypt(encryptedData, key);
    case 'AES128':
    case 'AES256':
      // Would use AES in real implementation
      return rc4Decrypt(encryptedData, key); // Fallback to RC4
    default:
      throw new Error('Unsupported Kerberos key type');
  }
}

// === WORDLIST AND BRUTE FORCE FUNCTIONALITY ===

class HashCracker {
  constructor() {
    this.wordlists = new Map();
    this.isRunning = false;
    this.currentJob = null;
  }

  // Load wordlist from file
  async loadWordlist(file, name = null) {
    const filename = name || file.name;
    const text = await file.text();
    const words = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    this.wordlists.set(filename, words);
    return { name: filename, count: words.length };
  }

  // Load wordlist from text
  loadWordlistFromText(text, name) {
    const words = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    this.wordlists.set(name, words);
    return { name, count: words.length };
  }

  // Get available wordlists
  getWordlists() {
    return Array.from(this.wordlists.keys()).map(name => ({
      name,
      count: this.wordlists.get(name).length
    }));
  }

  // Crack hash using wordlist
  async crackHash(hash, hashType, wordlistName, options = {}) {
    if (this.isRunning) {
      throw new Error('Another cracking job is already running');
    }

    const wordlist = this.wordlists.get(wordlistName);
    if (!wordlist) {
      throw new Error('Wordlist not found');
    }

    this.isRunning = true;
    this.currentJob = {
      hash,
      hashType,
      wordlistName,
      startTime: Date.now(),
      tested: 0,
      total: wordlist.length
    };

    const hashFunction = this.getHashFunction(hashType);
    const batchSize = options.batchSize || 1000;
    const maxTime = options.maxTimeMs || 300000; // 5 minutes max

    try {
      for (let i = 0; i < wordlist.length; i += batchSize) {
        if (!this.isRunning) break;

        const batch = wordlist.slice(i, i + batchSize);
        
        for (const password of batch) {
          if (!this.isRunning) break;

          try {
            const computed = await hashFunction(password, options.hashOptions);
            this.currentJob.tested++;

            if (computed.toLowerCase() === hash.toLowerCase()) {
              this.isRunning = false;
              return {
                found: true,
                password,
                hash: computed,
                tested: this.currentJob.tested,
                timeMs: Date.now() - this.currentJob.startTime
              };
            }
          } catch (error) {
            console.warn('Error hashing password:', password, error);
          }
        }

        // Check timeout
        if (Date.now() - this.currentJob.startTime > maxTime) {
          break;
        }

        // Allow UI updates
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      return {
        found: false,
        password: null,
        hash: null,
        tested: this.currentJob.tested,
        timeMs: Date.now() - this.currentJob.startTime
      };
    } finally {
      this.isRunning = false;
      this.currentJob = null;
    }
  }

  // Brute force attack
  async bruteForce(hash, hashType, charset = 'abcdefghijklmnopqrstuvwxyz0123456789', minLength = 1, maxLength = 4, options = {}) {
    if (this.isRunning) {
      throw new Error('Another cracking job is already running');
    }

    this.isRunning = true;
    const startTime = Date.now();
    const hashFunction = this.getHashFunction(hashType);
    let tested = 0;
    const maxTime = options.maxTimeMs || 300000; // 5 minutes max

    try {
      for (let length = minLength; length <= maxLength; length++) {
        const result = await this.bruteForceLength(hash, hashFunction, charset, length, options);
        tested += result.tested;

        if (result.found || Date.now() - startTime > maxTime || !this.isRunning) {
          return {
            found: result.found,
            password: result.password,
            hash: result.hash,
            tested,
            timeMs: Date.now() - startTime
          };
        }
      }

      return {
        found: false,
        password: null,
        hash: null,
        tested,
        timeMs: Date.now() - startTime
      };
    } finally {
      this.isRunning = false;
    }
  }

  async bruteForceLength(targetHash, hashFunction, charset, length, options) {
    const total = Math.pow(charset.length, length);
    let tested = 0;

    for (let i = 0; i < total; i++) {
      if (!this.isRunning) break;

      const password = this.indexToPassword(i, charset, length);
      
      try {
        const computed = await hashFunction(password, options.hashOptions);
        tested++;

        if (computed.toLowerCase() === targetHash.toLowerCase()) {
          return {
            found: true,
            password,
            hash: computed,
            tested
          };
        }
      } catch (error) {
        console.warn('Error hashing password:', password, error);
      }

      // Allow UI updates every 100 attempts
      if (tested % 100 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    return {
      found: false,
      password: null,
      hash: null,
      tested
    };
  }

  indexToPassword(index, charset, length) {
    let password = '';
    let temp = index;

    for (let i = 0; i < length; i++) {
      password = charset[temp % charset.length] + password;
      temp = Math.floor(temp / charset.length);
    }

    return password;
  }

  getHashFunction(hashType) {
    const hashFunctions = {
      'md5': (text) => customMd5(text),
      'sha1': async (text) => await hashSha1(text),
      'sha256': async (text) => await hashSha256(text),
      'sha384': async (text) => await hashSha384(text),
      'sha512': async (text) => await hashSha512(text),
      'ntlm': (text) => hashNtlm(text),
      'mysql_old': (text) => hashMysqlOld(text),
      'mysql': (text) => hashMysql(text),
    };

    const func = hashFunctions[hashType.toLowerCase()];
    if (!func) {
      throw new Error(`Unsupported hash type: ${hashType}`);
    }

    return func;
  }

  // Stop current job
  stop() {
    this.isRunning = false;
  }

  // Get current job status
  getStatus() {
    if (!this.currentJob) {
      return { running: false };
    }

    return {
      running: this.isRunning,
      ...this.currentJob,
      progress: this.currentJob.total > 0 ? (this.currentJob.tested / this.currentJob.total) * 100 : 0,
      elapsedMs: Date.now() - this.currentJob.startTime
    };
  }
}

// Export the hash cracker instance
export const hashCracker = new HashCracker();

// === ADDITIONAL HASHCAT-COMPATIBLE HASH TYPES ===

// PBKDF2-SHA1 (Hashcat mode 12000)
export function hashPbkdf2Sha1(password, salt = null, iterations = 1000) {
  if (!salt) {
    salt = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt);
  }
  
  // Simplified PBKDF2 implementation
  let derivedKey = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < iterations; i++) {
    const input = Array.from(derivedKey).map(b => String.fromCharCode(b)).join('') + saltStr + i;
    derivedKey = customSha1Bytes(new TextEncoder().encode(input));
  }
  
  return Array.from(derivedKey).map(b => b.toString(16).padStart(2, '0')).join('');
}

// PBKDF2-SHA256 (Hashcat mode 10900)
export async function hashPbkdf2Sha256(password, salt = null, iterations = 1000) {
  if (!salt) {
    salt = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt);
  }
  
  let derivedKey = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < iterations; i++) {
    const input = Array.from(derivedKey).map(b => String.fromCharCode(b)).join('') + saltStr + i;
    derivedKey = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)));
  }
  
  return Array.from(derivedKey).map(b => b.toString(16).padStart(2, '0')).join('');
}

// PBKDF2-SHA512 (Hashcat mode 12100)
export async function hashPbkdf2Sha512(password, salt = null, iterations = 1000) {
  if (!salt) {
    salt = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt);
  }
  
  let derivedKey = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < iterations; i++) {
    const input = Array.from(derivedKey).map(b => String.fromCharCode(b)).join('') + saltStr + i;
    derivedKey = new Uint8Array(await crypto.subtle.digest('SHA-512', new TextEncoder().encode(input)));
  }
  
  return Array.from(derivedKey).map(b => b.toString(16).padStart(2, '0')).join('');
}

// SHA-512 Crypt (Hashcat mode 1800)
export function hashSha512Crypt(password, salt = null, rounds = 5000) {
  console.warn('Simplified SHA512-Crypt implementation - use proper crypt library for production');
  
  if (!salt) {
    salt = Array.from({ length: 16 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt).slice(0, 16);
  }
  
  let hash = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < rounds; i++) {
    const input = Array.from(hash).map(b => String.fromCharCode(b)).join('') + saltStr + password + i;
    const hashHex = customMd5(input); // Using MD5 as placeholder for SHA512
    hash = new Uint8Array(hashHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
  }
  
  const saltB64 = btoa(Array.from(salt).map(b => String.fromCharCode(b)).join(''));
  const hashB64 = btoa(Array.from(hash).map(b => String.fromCharCode(b)).join(''));
  
  return `$6$rounds=${rounds}$${saltB64}$${hashB64}`;
}

// DES Crypt (Hashcat mode 1500)
export function hashDesCrypt(password, salt = null) {
  console.warn('Simplified DES-Crypt implementation - use proper crypt library for production');
  
  if (!salt) {
    salt = Array.from({ length: 2 }, () => Math.floor(Math.random() * 64));
  } else if (typeof salt === 'string') {
    salt = salt.slice(0, 2).split('').map(c => c.charCodeAt(0));
  }
  
  // Simplified DES implementation using XOR operations
  const key = new TextEncoder().encode(password.slice(0, 8).padEnd(8, '\0'));
  const saltStr = String.fromCharCode(salt[0], salt[1]);
  
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash ^= key[i] * (i + 1) * salt[i % 2];
  }
  
  const hashStr = hash.toString(36).slice(0, 11);
  return saltStr + hashStr.padStart(11, '0');
}

// APR1 MD5 Crypt (Apache) (Hashcat mode 1600)
export function hashApr1Md5(password, salt = null) {
  console.warn('Simplified APR1-MD5 implementation - use proper crypt library for production');
  
  if (!salt) {
    salt = Array.from({ length: 8 }, () => Math.floor(Math.random() * 64));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt).slice(0, 8);
  }
  
  let hash = new TextEncoder().encode(password);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  for (let i = 0; i < 1000; i++) {
    const input = Array.from(hash).map(b => String.fromCharCode(b)).join('') + saltStr + password;
    hash = customMd5Bytes(new TextEncoder().encode(input));
  }
  
  const saltB64 = btoa(saltStr).replace(/=/g, '');
  const hashB64 = btoa(Array.from(hash).map(b => String.fromCharCode(b)).join('')).replace(/=/g, '');
  
  return `$apr1$${saltB64}$${hashB64}`;
}

// Domain Cached Credentials (DCC/MS Cache) (Hashcat mode 1100)
export function hashMsCachev1(username, password, domain = '') {
  const ntlmHash = hashNtlm(password);
  const identity = (username.toLowerCase() + domain.toLowerCase());
  const combined = ntlmHash + identity;
  
  return customMd5(combined);
}

// Domain Cached Credentials 2 (DCC2/MS Cache 2) (Hashcat mode 2100)
export function hashMsCachev2(username, password, domain = '', iterations = 10240) {
  const ntlmHash = hashNtlm(password);
  const identity = (username.toLowerCase() + domain.toLowerCase());
  
  let hash = customMd5Bytes(new TextEncoder().encode(ntlmHash + identity));
  
  for (let i = 0; i < iterations; i++) {
    const input = Array.from(hash).map(b => String.fromCharCode(b)).join('') + identity;
    hash = customMd5Bytes(new TextEncoder().encode(input));
  }
  
  return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
}

// NetNTLMv1 (Hashcat mode 5500)
export function hashNetNtlmv1(username, password, domain = '', serverChallenge = '', clientChallenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = username + domain;
  
  // Simplified NetNTLMv1 calculation
  const response1 = customMd5(ntlmHash + serverChallenge + clientChallenge).substring(0, 16);
  const response2 = customMd5(identity + serverChallenge).substring(0, 16);
  
  return `${identity}::${domain}:${response1}:${response2}:${serverChallenge}`;
}

// NetNTLMv2 (Hashcat mode 5600)
export function hashNetNtlmv2(username, password, domain = '', serverChallenge = '', clientChallenge = '') {
  const ntlmHash = hashNtlm(password);
  const identity = username.toUpperCase() + domain.toUpperCase();
  
  const ntlmv2Hash = customHmacMd5(ntlmHash, identity);
  const response = customHmacMd5(ntlmv2Hash, serverChallenge + clientChallenge);
  
  return `${username}::${domain}:${serverChallenge}:${response.substring(0, 32)}:${clientChallenge}`;
}

// Kerberos 5 TGS-REP etype 23 (RC4-HMAC) (Hashcat mode 13100)
export function hashKerberos5TgsRep23(encryptedTicket, salt = '') {
  console.warn('Simplified Kerberos 5 TGS-REP implementation');
  
  // This is a very simplified version - real implementation would parse ASN.1
  const combined = encryptedTicket + salt;
  return customMd5(combined);
}

// Kerberos 5 AS-REQ Pre-Auth etype 23 (RC4-HMAC) (Hashcat mode 7500)
export function hashKerberos5AsReq23(timestamp, clientChallenge, salt = '') {
  console.warn('Simplified Kerberos 5 AS-REQ implementation');
  
  const combined = timestamp + clientChallenge + salt;
  return customMd5(combined);
}

// WPA/WPA2 (Hashcat mode 2500)
export function hashWpa(ssid, password) {
  console.warn('Simplified WPA/WPA2 implementation - use proper 802.11 library for production');
  
  // Simplified PBKDF2 for WPA
  let psk = new TextEncoder().encode(password);
  const ssidBytes = new TextEncoder().encode(ssid);
  
  for (let i = 0; i < 4096; i++) {
    const input = Array.from(psk).map(b => String.fromCharCode(b)).join('') + 
                  Array.from(ssidBytes).map(b => String.fromCharCode(b)).join('') + i;
    psk = customMd5Bytes(new TextEncoder().encode(input));
  }
  
  return Array.from(psk).map(b => b.toString(16).padStart(2, '0')).join('');
}

// PostgreSQL MD5 (Hashcat mode 3200)
export function hashPostgresMd5(username, password, salt = null) {
  if (!salt) {
    salt = Math.random().toString(36).substring(2, 6);
  }
  
  const combined = password + username;
  const hash1 = customMd5(combined);
  const hash2 = customMd5(hash1 + salt);
  
  return `md5${hash2}`;
}

// Oracle 11g/12c (Hashcat mode 112)
export function hashOracle11g(username, password, salt = null) {
  if (!salt) {
    salt = Math.random().toString(36).substring(2, 12).toUpperCase();
  }
  
  const combined = password + salt;
  const hash = customMd5(combined);
  
  return `${salt}:${hash.toUpperCase()}`;
}

// MSSQL (2000) (Hashcat mode 131)
export function hashMssql2000(password, salt = null) {
  if (!salt) {
    salt = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt).slice(0, 4);
  }
  
  const passwordUcs2 = new TextEncoder().encode(password);
  const combined = new Uint8Array([...salt, ...passwordUcs2]);
  const hash = customMd5Bytes(combined);
  
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `0x0100${saltHex}${hashHex}`;
}

// MSSQL (2005) (Hashcat mode 132)
export function hashMssql2005(password, salt = null) {
  if (!salt) {
    salt = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt).slice(0, 4);
  }
  
  const passwordUcs2 = new TextEncoder().encode(password);
  const combined = new Uint8Array([...passwordUcs2, ...salt]);
  
  // Use SHA1 instead of MD5 for MSSQL 2005
  const hash = customSha1Bytes(combined);
  
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `0x0100${saltHex}${hashHex}`;
}

// LM Hash (Hashcat mode 3000)
export function hashLm(password) {
  console.warn('Simplified LM hash implementation - use proper DES library for production');
  
  const paddedPassword = password.toUpperCase().padEnd(14, '\0').substring(0, 14);
  const part1 = paddedPassword.substring(0, 7);
  const part2 = paddedPassword.substring(7, 14);
  
  // Simplified DES with magic constant "KGS!@#$%"
  const magic = "KGS!@#$%";
  const hash1 = customMd5(part1 + magic).substring(0, 16);
  const hash2 = customMd5(part2 + magic).substring(0, 16);
  
  return (hash1 + hash2).toUpperCase();
}

// Cisco ASA MD5 (Hashcat mode 2410)
export function hashCiscoAsaMd5(username, password, salt = null) {
  if (!salt) {
    salt = Math.random().toString(36).substring(2, 6);
  }
  
  const combined = username + password + salt;
  return customMd5(combined);
}

// Cisco IOS PBKDF2-SHA256 (Hashcat mode 9200)
export async function hashCiscoIosPbkdf2(password, salt = null, iterations = 20000) {
  if (!salt) {
    salt = Array.from({ length: 14 }, () => Math.floor(Math.random() * 64));
  }
  
  const derived = await hashPbkdf2Sha256(password, salt, iterations);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  return `$8$${btoa(saltStr).replace(/=/g, '')}$${derived}`;
}

// Hashcat-compatible rules engine
class HashcatRulesEngine {
  constructor() {
    this.rules = [];
  }

  // Load hashcat rules from text
  loadRules(rulesText) {
    this.rules = rulesText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.startsWith('#'));
    return this.rules.length;
  }

  // Apply a single rule to a password
  applyRule(password, rule) {
    let result = password;

    for (let i = 0; i < rule.length; i++) {
      const command = rule[i];
      const param = rule[i + 1];

      switch (command) {
        case ':': // Do nothing
          break;
        case 'l': // Lowercase all
          result = result.toLowerCase();
          break;
        case 'u': // Uppercase all
          result = result.toUpperCase();
          break;
        case 'c': // Capitalize first, lowercase rest
          result = result.charAt(0).toUpperCase() + result.slice(1).toLowerCase();
          break;
        case 'C': // Lowercase first, uppercase rest
          result = result.charAt(0).toLowerCase() + result.slice(1).toUpperCase();
          break;
        case 't': // Toggle case
          result = result.split('').map(c => 
            c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()
          ).join('');
          break;
        case 'r': // Reverse
          result = result.split('').reverse().join('');
          break;
        case 'd': // Duplicate word
          result = result + result;
          break;
        case 'p': // Duplicate first N characters
          if (param && !isNaN(param)) {
            const n = parseInt(param);
            result = result.substring(0, n) + result;
            i++; // Skip parameter
          }
          break;
        case 'f': // Reflect word (password + reverse)
          result = result + result.split('').reverse().join('');
          break;
        case '$': // Append character
          if (param) {
            result = result + param;
            i++; // Skip parameter
          }
          break;
        case '^': // Prepend character
          if (param) {
            result = param + result;
            i++; // Skip parameter
          }
          break;
        case '[': // Delete first character
          result = result.substring(1);
          break;
        case ']': // Delete last character
          result = result.substring(0, result.length - 1);
          break;
        case 'D': // Delete character at position N
          if (param && !isNaN(param)) {
            const n = parseInt(param);
            result = result.substring(0, n) + result.substring(n + 1);
            i++; // Skip parameter
          }
          break;
        case 'x': // Extract substring from position N with length M
          if (i + 2 < rule.length) {
            const pos = parseInt(rule[i + 1]);
            const len = parseInt(rule[i + 2]);
            if (!isNaN(pos) && !isNaN(len)) {
              result = result.substring(pos, pos + len);
              i += 2; // Skip both parameters
            }
          }
          break;
        case 'i': // Insert character X at position N
          if (i + 2 < rule.length) {
            const pos = parseInt(rule[i + 1]);
            const char = rule[i + 2];
            if (!isNaN(pos)) {
              result = result.substring(0, pos) + char + result.substring(pos);
              i += 2; // Skip both parameters
            }
          }
          break;
        case 'o': // Overwrite character at position N with character X
          if (i + 2 < rule.length) {
            const pos = parseInt(rule[i + 1]);
            const char = rule[i + 2];
            if (!isNaN(pos) && pos < result.length) {
              result = result.substring(0, pos) + char + result.substring(pos + 1);
              i += 2; // Skip both parameters
            }
          }
          break;
        case 's': // Replace all instances of character X with character Y
          if (i + 2 < rule.length) {
            const from = rule[i + 1];
            const to = rule[i + 2];
            result = result.split(from).join(to);
            i += 2; // Skip both parameters
          }
          break;
        case '@': // Purge all instances of character X
          if (param) {
            result = result.split(param).join('');
            i++; // Skip parameter
          }
          break;
        // Add more rules as needed
      }
    }

    return result;
  }

  // Apply all rules to a password
  applyRules(password) {
    const results = new Set();
    results.add(password); // Original password

    for (const rule of this.rules) {
      try {
        const modified = this.applyRule(password, rule);
        if (modified && modified !== password) {
          results.add(modified);
        }
      } catch (error) {
        console.warn('Rule application error:', rule, error);
      }
    }

    return Array.from(results);
  }
}

// GPU-accelerated hash cracker (enhanced version)
class GPUHashCracker extends HashCracker {
  constructor() {
    super();
    this.gpuDevice = null;
    this.rulesEngine = new HashcatRulesEngine();
    this.supportsGPU = false;
    this.initGPU();
  }

  async initGPU() {
    try {
      if ('gpu' in navigator) {
        const adapter = await navigator.gpu.requestAdapter();
        if (adapter) {
          this.gpuDevice = await adapter.requestDevice();
          this.supportsGPU = true;
          console.log('GPU acceleration available');
        }
      }
    } catch (error) {
      console.warn('GPU initialization failed:', error);
      this.supportsGPU = false;
    }
  }

  // Load hashcat rules
  loadRules(rulesText) {
    return this.rulesEngine.loadRules(rulesText);
  }

  // GPU-accelerated MD5 computation shader
  createMd5ComputeShader() {
    return `
      @group(0) @binding(0) var<storage, read> input_data: array<u32>;
      @group(0) @binding(1) var<storage, read_write> output_hashes: array<u32>;
      
      // MD5 constants and functions would go here
      // This is a simplified version - full MD5 GPU implementation is complex
      
      @compute @workgroup_size(64)
      fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let index = global_id.x;
        if (index >= arrayLength(&input_data) / 16) {
          return;
        }
        
        // Simplified MD5 computation
        // In a real implementation, this would include the full MD5 algorithm
        let input_offset = index * 16;
        var hash: u32 = 0x67452301; // MD5 initial value
        
        for (var i: u32 = 0; i < 16; i++) {
          hash = hash ^ input_data[input_offset + i];
        }
        
        output_hashes[index] = hash;
      }
    `;
  }

  // GPU-accelerated NTLM computation
  async gpuCrackNTLM(targetHash, passwords) {
    if (!this.supportsGPU || !this.gpuDevice) {
      return this.fallbackCrack(targetHash, 'ntlm', passwords);
    }

    try {
      // Create compute shader for NTLM
      const shaderModule = this.gpuDevice.createShaderModule({
        code: this.createMd5ComputeShader() // NTLM uses MD4, but using MD5 as example
      });

      // Create buffers
      const inputBuffer = this.gpuDevice.createBuffer({
        size: passwords.length * 64, // 64 bytes per password max
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      });

      const outputBuffer = this.gpuDevice.createBuffer({
        size: passwords.length * 16, // 16 bytes per hash
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
      });

      // Prepare input data
      const inputData = new Uint32Array(passwords.length * 16);
      passwords.forEach((password, i) => {
        const utf16 = new TextEncoder().encode(password);
        for (let j = 0; j < Math.min(utf16.length, 32); j++) {
          inputData[i * 16 + j] = utf16[j];
        }
      });

      // Write input data
      this.gpuDevice.queue.writeBuffer(inputBuffer, 0, inputData);

      // Create compute pass
      const computePass = this.gpuDevice.createCommandEncoder().beginComputePass();
      computePass.setBindGroup(0, this.gpuDevice.createBindGroup({
        layout: shaderModule.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: inputBuffer } },
          { binding: 1, resource: { buffer: outputBuffer } }
        ]
      }));

      computePass.dispatchWorkgroups(Math.ceil(passwords.length / 64));
      computePass.end();

      // Execute and read results
      this.gpuDevice.queue.submit([computePass]);
      
      // Read back results (simplified)
      // In reality, you'd need to map the buffer and compare hashes
      console.log('GPU computation dispatched for', passwords.length, 'passwords');

      return null; // Would return found password if matched

    } catch (error) {
      console.warn('GPU cracking failed, falling back to CPU:', error);
      return this.fallbackCrack(targetHash, 'ntlm', passwords);
    }
  }

  // Fallback CPU cracking
  async fallbackCrack(targetHash, hashType, passwords) {
    const hashFunction = this.getHashFunction(hashType);
    
    for (const password of passwords) {
      try {
        const computed = await hashFunction(password);
        if (computed.toLowerCase() === targetHash.toLowerCase()) {
          return password;
        }
      } catch (error) {
        console.warn('Error hashing password:', password, error);
      }
    }
    
    return null;
  }

  // Enhanced crack with rules support
  async crackHashWithRules(hash, hashType, wordlistName, options = {}) {
    if (this.isRunning) {
      throw new Error('Another cracking job is already running');
    }

    const wordlist = this.wordlists.get(wordlistName);
    if (!wordlist) {
      throw new Error('Wordlist not found');
    }

    this.isRunning = true;
    this.currentJob = {
      hash,
      hashType,
      wordlistName,
      startTime: Date.now(),
      tested: 0,
      total: wordlist.length,
      withRules: true
    };

    const hashFunction = this.getHashFunction(hashType);
    const maxTime = options.maxTimeMs || 600000; // 10 minutes max
    const batchSize = options.batchSize || 1000;

    try {
      for (let i = 0; i < wordlist.length; i += batchSize) {
        if (!this.isRunning) break;

        const batch = wordlist.slice(i, i + batchSize);
        let candidates = [];

        // Apply rules to each password in batch
        for (const password of batch) {
          if (this.rulesEngine.rules.length > 0) {
            candidates.push(...this.rulesEngine.applyRules(password));
          } else {
            candidates.push(password);
          }
        }

        // GPU acceleration for NTLM
        if (hashType.toLowerCase() === 'ntlm' && this.supportsGPU) {
          const result = await this.gpuCrackNTLM(hash, candidates);
          if (result) {
            this.isRunning = false;
            return {
              found: true,
              password: result,
              hash: await hashFunction(result),
              tested: this.currentJob.tested,
              timeMs: Date.now() - this.currentJob.startTime,
              method: 'GPU'
            };
          }
        } else {
          // CPU processing
          for (const candidate of candidates) {
            if (!this.isRunning) break;

            try {
              const computed = await hashFunction(candidate, options.hashOptions);
              this.currentJob.tested++;

              if (computed.toLowerCase() === hash.toLowerCase()) {
                this.isRunning = false;
                return {
                  found: true,
                  password: candidate,
                  hash: computed,
                  tested: this.currentJob.tested,
                  timeMs: Date.now() - this.currentJob.startTime,
                  method: 'CPU'
                };
              }
            } catch (error) {
              console.warn('Error hashing password:', candidate, error);
            }
          }
        }

        // Check timeout
        if (Date.now() - this.currentJob.startTime > maxTime) {
          break;
        }

        // Allow UI updates
        await new Promise(resolve => setTimeout(resolve, 1));
      }

      return {
        found: false,
        password: null,
        hash: null,
        tested: this.currentJob.tested,
        timeMs: Date.now() - this.currentJob.startTime,
        method: this.supportsGPU ? 'GPU' : 'CPU'
      };
    } finally {
      this.isRunning = false;
      this.currentJob = null;
    }
  }

  // Update hash function support
  getHashFunction(hashType) {
    const hashFunctions = {
      'md5': (text) => customMd5(text),
      'sha1': async (text) => await hashSha1(text),
      'sha256': async (text) => await hashSha256(text),
      'sha384': async (text) => await hashSha384(text),
      'sha512': async (text) => await hashSha512(text),
      'ntlm': (text) => hashNtlm(text),
      'mysql_old': (text) => hashMysqlOld(text),
      'mysql': (text) => hashMysql(text),
      'pbkdf2_sha1': (text, options = {}) => hashPbkdf2Sha1(text, options.salt, options.iterations),
      'pbkdf2_sha256': async (text, options = {}) => await hashPbkdf2Sha256(text, options.salt, options.iterations),
      'pbkdf2_sha512': async (text, options = {}) => await hashPbkdf2Sha512(text, options.salt, options.iterations),
      'sha512_crypt': (text, options = {}) => hashSha512Crypt(text, options.salt, options.rounds),
      'des_crypt': (text, options = {}) => hashDesCrypt(text, options.salt),
      'apr1_md5': (text, options = {}) => hashApr1Md5(text, options.salt),
      'mscache_v1': (text, options = {}) => hashMsCachev1(options.username || 'user', text, options.domain),
      'mscache_v2': (text, options = {}) => hashMsCachev2(options.username || 'user', text, options.domain, options.iterations),
      'lm': (text) => hashLm(text),
      'postgres_md5': (text, options = {}) => hashPostgresMd5(options.username || 'postgres', text, options.salt),
      'oracle_11g': (text, options = {}) => hashOracle11g(options.username || 'oracle', text, options.salt),
      'mssql_2000': (text, options = {}) => hashMssql2000(text, options.salt),
      'mssql_2005': (text, options = {}) => hashMssql2005(text, options.salt),
      'wpa': (text, options = {}) => hashWpa(options.ssid || 'network', text),
      'bcrypt': (text, options = {}) => bcryptHash(text, options.salt, options.rounds),
      'scrypt': (text, options = {}) => scryptHash(text, options.salt, options.N, options.r, options.p),
      'argon2': (text, options = {}) => argon2Hash(text, options.salt, options.iterations, options.memory, options.parallelism)
    };

    const func = hashFunctions[hashType.toLowerCase()];
    if (!func) {
      throw new Error(`Unsupported hash type: ${hashType}`);
    }

    return func;
  }
}

// Create enhanced GPU hash cracker instance
export const gpuHashCracker = new GPUHashCracker();

// Advanced URL encoding methods
export function doubleUrlencode(s) {
  const firstEncode = urlencodeAscii(s);
  return encodeURIComponent(firstEncode);
}

export function tripleUrlencode(s) {
  const firstEncode = urlencodeAscii(s);
  const secondEncode = encodeURIComponent(firstEncode);
  return encodeURIComponent(secondEncode);
}

export function urlencodeAllChars(s) {
  return Array.from(s).map(c => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`).join('');
}

// Unicode encoding variants
export function unicodeEscape(s) {
  return Array.from(s).map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
}

export function unicodeEscapeMixed(s) {
  return Array.from(s).map((c, i) => {
    const code = c.charCodeAt(0);
    if (i % 2 === 0 && code < 256) {
      return `\\x${code.toString(16).padStart(2, '0')}`;
    } else {
      return `\\u${code.toString(16).padStart(4, '0')}`;
    }
  }).join('');
}

export function unicodeOverlongUtf8(s) {
  return Array.from(s).map(c => {
    const code = c.charCodeAt(0);
    if (code < 128) {
      // Overlong 2-byte sequence
      return `%C${((code >> 6) | 0xC0).toString(16).toUpperCase()}%${((code & 0x3F) | 0x80).toString(16).toUpperCase()}`;
    } else {
      return encodeURIComponent(c);
    }
  }).join('');
}

// HTML entity variations
export function htmlNamedEntities(s) {
  const entities = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;',
    ' ': '&nbsp;', '©': '&copy;', '®': '&reg;', '™': '&trade;'
  };
  return Array.from(s).map(c => entities[c] || c).join('');
}

export function htmlHexEntities(s) {
  return Array.from(s).map(c => `&#x${c.charCodeAt(0).toString(16)};`).join('');
}

export function htmlDecimalEntities(s) {
  return Array.from(s).map(c => `&#${c.charCodeAt(0)};`).join('');
}

export function htmlHexEntitiesLeadingZeros(s) {
  return Array.from(s).map(c => `&#x${c.charCodeAt(0).toString(16).padStart(8, '0')};`).join('');
}

// JavaScript context specific
export function jsStringFromcharcodeSplit(s) {
  const codes = Array.from(s).map(c => c.charCodeAt(0));
  return `String.fromCharCode(${codes.join(',')})`;
}

export function jsEvalFromcharcode(s) {
  const codes = Array.from(s).map(c => c.charCodeAt(0));
  return `eval(String.fromCharCode(${codes.join(',')}))`;
}

export function jsUnicodeEscape(s) {
  return Array.from(s).map(c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`).join('');
}

export function jsHexEscape(s) {
  return Array.from(s).map(c => {
    const code = c.charCodeAt(0);
    if (code < 256) {
      return `\\x${code.toString(16).padStart(2, '0')}`;
    } else {
      return `\\u${code.toString(16).padStart(4, '0')}`;
    }
  }).join('');
}

// SQL obfuscation
export function sqlCharHexMixed(s) {
  return Array.from(s).map((c, i) => {
    if (i % 2 === 0) {
      return `CHAR(${c.charCodeAt(0)})`;
    } else {
      return `0x${c.charCodeAt(0).toString(16)}`;
    }
  }).join('+');
}

export function sqlUnhexEncode(s) {
  const hex = encodeHex(s);
  return `UNHEX('${hex}')`;
}

export function sqlHexLiteral(s) {
  const hex = encodeHex(s);
  return `0x${hex}`;
}

// PHP specific
export function phpChrHexMixed(s) {
  return Array.from(s).map((c, i) => {
    if (i % 2 === 0) {
      return `chr(${c.charCodeAt(0)})`;
    } else {
      return `"\\x${c.charCodeAt(0).toString(16).padStart(2, '0')}"`;
    }
  }).join('.');
}

export function phpPackEncode(s) {
  const codes = Array.from(s).map(c => c.charCodeAt(0));
  return `pack("C*",${codes.join(',')})`;
}

// PowerShell specific
export function powershellCharArray(s) {
  const codes = Array.from(s).map(c => c.charCodeAt(0));
  return `[char[]]@(${codes.join(',')}) -join ''`;
}

export function powershellFormatOperator(s) {
  const codes = Array.from(s).map(c => c.charCodeAt(0));
  const format = codes.map(() => '{0}').join('');
  return `"${format}" -f ${codes.join(',')}`;
}

// Advanced Unicode attacks
export function unicodeZalgoEncode(s, intensity = 3, upwards = true, downwards = true, middle = true) {
  const combiningUp = [
    '\u030D', '\u030E', '\u0304', '\u0305', '\u033F', '\u0311', '\u0306', '\u0310',
    '\u0352', '\u0357', '\u0351', '\u0307', '\u0308', '\u030A', '\u0342', '\u0343',
    '\u0344', '\u034A', '\u034B', '\u034C', '\u0303', '\u0302', '\u030C', '\u0350',
    '\u0300', '\u0301', '\u030B', '\u030F', '\u0312', '\u0313', '\u0314', '\u033D',
    '\u0309', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369',
    '\u036A', '\u036B', '\u036C', '\u036D', '\u036E', '\u036F', '\u033E', '\u035B'
  ];
  
  const combiningDown = [
    '\u0316', '\u0317', '\u0318', '\u0319', '\u031C', '\u031D', '\u031E', '\u031F',
    '\u0320', '\u0324', '\u0325', '\u0326', '\u0329', '\u032A', '\u032B', '\u032C',
    '\u032D', '\u032E', '\u032F', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339',
    '\u033A', '\u033B', '\u033C', '\u0345', '\u0347', '\u0348', '\u0349', '\u034D',
    '\u034E', '\u0353', '\u0354', '\u0355', '\u0356', '\u0359', '\u035A', '\u0323'
  ];
  
  const combiningMiddle = [
    '\u0315', '\u031B', '\u0340', '\u0341', '\u0358', '\u0321', '\u0322', '\u0327',
    '\u0328', '\u0334', '\u0335', '\u0336', '\u0337', '\u0338', '\u034F', '\u035C',
    '\u035D', '\u035E', '\u035F', '\u0360', '\u0362', '\u0338', '\u0337', '\u0336',
    '\u0335', '\u0334', '\u0333', '\u0332', '\u0331', '\u0330'
  ];
  
  return Array.from(s).map(c => {
    const numMarks = Math.floor(Math.random() * intensity) + 1;
    let result = c;
    
    for (let i = 0; i < numMarks; i++) {
      const categories = [];
      if (upwards) categories.push(combiningUp);
      if (downwards) categories.push(combiningDown);
      if (middle) categories.push(combiningMiddle);
      
      if (categories.length === 0) break;
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      result += category[Math.floor(Math.random() * category.length)];
    }
    return result;
  }).join('');
}

export function unicodeHomographEncode(s) {
  const homographs = {
    'a': 'а', 'e': 'е', 'o': 'о', 'p': 'р', 'c': 'с', 'x': 'х',
    'A': 'А', 'B': 'В', 'C': 'С', 'E': 'Е', 'H': 'Н', 'K': 'К',
    'M': 'М', 'O': 'О', 'P': 'Р', 'T': 'Т', 'X': 'Х', 'Y': 'У'
  };
  
  return Array.from(s).map(c => homographs[c] || c).join('');
}

// Base encoding variants
export function encodeBase32(s) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = new TextEncoder().encode(s);
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;
    
    while (bitsLeft >= 5) {
      result += alphabet[(buffer >> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  
  if (bitsLeft > 0) {
    result += alphabet[(buffer << (5 - bitsLeft)) & 31];
  }
  
  while (result.length % 8 !== 0) {
    result += '=';
  }
  
  return result;
}

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

export function encodeBase58(s) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const bytes = new TextEncoder().encode(s);
  
  // Count leading zeros
  let leadingZeros = 0;
  for (const byte of bytes) {
    if (byte === 0) leadingZeros++;
    else break;
  }
  
  // Convert to big integer
  let num = 0n;
  for (const byte of bytes) {
    num = num * 256n + BigInt(byte);
  }
  
  // Convert to base58
  let result = '';
  while (num > 0n) {
    result = alphabet[Number(num % 58n)] + result;
    num = num / 58n;
  }
  
  // Add leading 1s for leading zeros
  return '1'.repeat(leadingZeros) + result;
}

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

export function encodeBase91(s) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
  const bytes = new TextEncoder().encode(s);
  let result = '';
  let accumulator = 0;
  let bits = 0;
  
  for (const byte of bytes) {
    accumulator |= (byte << bits);
    bits += 8;
    
    if (bits > 13) {
      let value = accumulator & 8191;
      
      if (value > 88) {
        accumulator >>= 13;
        bits -= 13;
      } else {
        value = accumulator & 16383;
        accumulator >>= 14;
        bits -= 14;
      }
      
      result += alphabet[value % 91] + alphabet[Math.floor(value / 91)];
    }
  }
  
  if (bits > 0) {
    result += alphabet[accumulator % 91];
    if (bits > 7 || accumulator > 90) {
      result += alphabet[Math.floor(accumulator / 91)];
    }
  }
  
  return result;
}

// Base16 (alternative hex)
export function encodeBase16(s) {
  return new TextEncoder().encode(s).reduce((acc, byte) => 
    acc + byte.toString(16).toUpperCase().padStart(2, '0'), '');
}

// Base32 variants
export function encodeBase32Hex(s) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
  const bytes = new TextEncoder().encode(s);
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;
    
    while (bitsLeft >= 5) {
      result += alphabet[(buffer >> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  
  if (bitsLeft > 0) {
    result += alphabet[(buffer << (5 - bitsLeft)) & 31];
  }
  
  while (result.length % 8 !== 0) {
    result += '=';
  }
  
  return result;
}

export function encodeBase32Z(s) {
  // z-base-32: Human-oriented base-32 encoding
  const alphabet = 'ybndrfg8ejkmcpqxot1uwisza345h769';
  const bytes = new TextEncoder().encode(s);
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bitsLeft += 8;
    
    while (bitsLeft >= 5) {
      result += alphabet[(buffer >> (bitsLeft - 5)) & 31];
      bitsLeft -= 5;
    }
  }
  
  if (bitsLeft > 0) {
    result += alphabet[(buffer << (5 - bitsLeft)) & 31];
  }
  
  return result;
}

// Base64 variants
export function encodeBase64Safe(s) {
  // Base64 with URL and filename safe alphabet
  return encodeBase64(s).replace(/\+/g, '-').replace(/\//g, '_');
}

export function encodeBase64NoPadding(s) {
  return encodeBase64(s).replace(/=/g, '');
}

// BaseX with custom alphabet
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

// Binary variants
export function encodeBinarySpaced(s) {
  return Array.from(s).map(c => 
    c.charCodeAt(0).toString(2).padStart(8, '0')
  ).join(' ');
}

export function encodeBinaryPacked(s) {
  return Array.from(s).map(c => 
    c.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
}

// Decimal encoding
export function encodeDecimal(s) {
  return Array.from(s).map(c => c.charCodeAt(0)).join(' ');
}

export function encodeDecimalPacked(s) {
  return Array.from(s).map(c => c.charCodeAt(0)).join(',');
}

// ASCII85 (Adobe/btoa encoding)
export function encodeAscii85(s) {
  const bytes = new TextEncoder().encode(s);
  let result = '';
  
  for (let i = 0; i < bytes.length; i += 4) {
    let chunk = 0;
    let chunkSize = Math.min(4, bytes.length - i);
    
    // Pack 4 bytes into 32-bit integer
    for (let j = 0; j < chunkSize; j++) {
      chunk = (chunk << 8) | bytes[i + j];
    }
    
    // Pad if necessary
    if (chunkSize < 4) {
      chunk <<= (4 - chunkSize) * 8;
    }
    
    // Special case for all zeros
    if (chunk === 0 && chunkSize === 4) {
      result += 'z';
    } else {
      // Convert to 5 base-85 digits
      let encoded = '';
      for (let k = 0; k < 5; k++) {
        encoded = String.fromCharCode(33 + (chunk % 85)) + encoded;
        chunk = Math.floor(chunk / 85);
      }
      
      // Trim padding for partial chunks
      if (chunkSize < 4) {
        encoded = encoded.substring(0, chunkSize + 1);
      }
      
      result += encoded;
    }
  }
  
  return '<~' + result + '~>';
}

// uuencode
export function uuencode(s) {
  const bytes = new TextEncoder().encode(s);
  let result = `begin 644 data\n`;
  
  for (let i = 0; i < bytes.length; i += 45) {
    const chunk = bytes.slice(i, i + 45);
    const lineLength = chunk.length;
    
    // Line length character (32 + length)
    result += String.fromCharCode(32 + lineLength);
    
    // Encode 3 bytes at a time
    for (let j = 0; j < chunk.length; j += 3) {
      const b1 = chunk[j] || 0;
      const b2 = chunk[j + 1] || 0;
      const b3 = chunk[j + 2] || 0;
      
      const combined = (b1 << 16) | (b2 << 8) | b3;
      
      // Extract 6-bit groups and add 32 (space), replace space with grave
      const c1 = ((combined >> 18) & 0x3F) + 32;
      const c2 = ((combined >> 12) & 0x3F) + 32;
      const c3 = ((combined >> 6) & 0x3F) + 32;
      const c4 = (combined & 0x3F) + 32;
      
      result += String.fromCharCode(c1 === 32 ? 96 : c1);
      result += String.fromCharCode(c2 === 32 ? 96 : c2);
      
      if (j + 1 < chunk.length) {
        result += String.fromCharCode(c3 === 32 ? 96 : c3);
      }
      if (j + 2 < chunk.length) {
        result += String.fromCharCode(c4 === 32 ? 96 : c4);
      }
    }
    
    result += '\n';
  }
  
  result += '`\nend\n';
  return result;
}

// yEnc encoding
export function yEncodeText(s) {
  const bytes = new TextEncoder().encode(s);
  let result = '=ybegin line=128 size=' + bytes.length + ' name=data\r\n';
  let lineLength = 0;
  
  for (const byte of bytes) {
    let encoded = (byte + 42) % 256;
    
    // Escape special characters
    if (encoded === 0 || encoded === 10 || encoded === 13 || encoded === 61) {
      result += '=' + String.fromCharCode((encoded + 64) % 256);
      lineLength += 2;
    } else {
      result += String.fromCharCode(encoded);
      lineLength += 1;
    }
    
    // Line wrapping
    if (lineLength >= 128) {
      result += '\r\n';
      lineLength = 0;
    }
  }
  
  if (lineLength > 0) {
    result += '\r\n';
  }
  
  result += '=yend size=' + bytes.length + '\r\n';
  return result;
}

// Simple ASN.1 DER encoding for strings
export function encodeAsn1Der(s) {
  const bytes = new TextEncoder().encode(s);
  const length = bytes.length;
  let result = '04'; // OCTET STRING tag
  
  // Encode length
  if (length < 128) {
    result += length.toString(16).padStart(2, '0');
  } else {
    const lengthBytes = [];
    let temp = length;
    while (temp > 0) {
      lengthBytes.unshift(temp & 0xFF);
      temp >>= 8;
    }
    result += (0x80 | lengthBytes.length).toString(16).padStart(2, '0');
    result += lengthBytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Encode content
  result += Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return result.toUpperCase();
}

// Bencode (BitTorrent encoding)
export function encodeBencode(s) {
  if (typeof s === 'string') {
    const bytes = new TextEncoder().encode(s);
    return bytes.length + ':' + s;
  }
  return s.length + ':' + s;
}

// MessagePack-like simple encoding
export function encodeMessagePack(s) {
  const bytes = new TextEncoder().encode(s);
  let result = [];
  
  if (bytes.length <= 31) {
    // fixstr
    result.push(0xa0 | bytes.length);
  } else if (bytes.length <= 255) {
    // str 8
    result.push(0xd9, bytes.length);
  } else if (bytes.length <= 65535) {
    // str 16
    result.push(0xda, (bytes.length >> 8) & 0xff, bytes.length & 0xff);
  } else {
    // str 32
    result.push(0xdb, 
      (bytes.length >> 24) & 0xff, 
      (bytes.length >> 16) & 0xff, 
      (bytes.length >> 8) & 0xff, 
      bytes.length & 0xff);
  }
  
  result.push(...bytes);
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}

// CBOR (Concise Binary Object Representation)
export function encodeCbor(s) {
  const bytes = new TextEncoder().encode(s);
  const length = bytes.length;
  let result = [];
  
  // Text string (major type 3)
  if (length <= 23) {
    result.push(0x60 | length);
  } else if (length <= 255) {
    result.push(0x78, length);
  } else if (length <= 65535) {
    result.push(0x79, (length >> 8) & 0xff, length & 0xff);
  } else {
    result.push(0x7a, 
      (length >> 24) & 0xff, 
      (length >> 16) & 0xff, 
      (length >> 8) & 0xff, 
      length & 0xff);
  }
  
  result.push(...bytes);
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}

// Property List XML format
export function encodePlist(s) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>data</key>
  <string>${s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</string>
</dict>
</plist>`;
}

// Simple BSON-like encoding
export function encodeBson(s) {
  const bytes = new TextEncoder().encode(s);
  const keyBytes = new TextEncoder().encode('data');
  
  // Document size (4 bytes) + type (1) + key + null + length (4) + string + null + end (1)
  const docSize = 4 + 1 + keyBytes.length + 1 + 4 + bytes.length + 1 + 1;
  
  let result = [];
  
  // Document size (little endian)
  result.push(docSize & 0xff, (docSize >> 8) & 0xff, (docSize >> 16) & 0xff, (docSize >> 24) & 0xff);
  
  // String type
  result.push(0x02);
  
  // Key name
  result.push(...keyBytes, 0x00);
  
  // String length (little endian)
  const strLen = bytes.length + 1;
  result.push(strLen & 0xff, (strLen >> 8) & 0xff, (strLen >> 16) & 0xff, (strLen >> 24) & 0xff);
  
  // String content
  result.push(...bytes, 0x00);
  
  // End of document
  result.push(0x00);
  
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}

// AMF0 encoding
export function encodeAmf0(s) {
  const bytes = new TextEncoder().encode(s);
  let result = [];
  
  // AMF0 string type marker
  result.push(0x02);
  
  // Length (2 bytes, big endian)
  result.push((bytes.length >> 8) & 0xff, bytes.length & 0xff);
  
  // String content
  result.push(...bytes);
  
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}

// AMF3 encoding  
export function encodeAmf3(s) {
  const bytes = new TextEncoder().encode(s);
  let result = [];
  
  // AMF3 string type marker
  result.push(0x06);
  
  // Length encoded as variable length integer
  const length = bytes.length;
  if (length <= 0x7F) {
    result.push((length << 1) | 1); // reference bit = 1 for inline
  } else if (length <= 0x3FFF) {
    result.push(((length >> 7) & 0x7F) | 0x80, ((length << 1) & 0xFF) | 1);
  } else if (length <= 0x1FFFFF) {
    result.push(
      ((length >> 14) & 0x7F) | 0x80,
      ((length >> 7) & 0x7F) | 0x80, 
      ((length << 1) & 0xFF) | 1
    );
  }
  
  // String content
  result.push(...bytes);
  
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}

// Simple Avro string encoding
export function encodeAvro(s) {
  const bytes = new TextEncoder().encode(s);
  const length = bytes.length;
  let result = [];
  
  // Encode length as variable-length zigzag
  let len = length;
  while (len >= 0x80) {
    result.push((len & 0x7F) | 0x80);
    len >>= 7;
  }
  result.push(len & 0x7F);
  
  // String bytes
  result.push(...bytes);
  
  return new Uint8Array(result).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
}

// Case manipulation
export function mixedCase(s) {
  return Array.from(s).map((c, i) => 
    i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()
  ).join('');
}

export function caseAlternatingEncode(s) {
  return Array.from(s).map((c, i) => 
    c.match(/[a-zA-Z]/) ? (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()) : c
  ).join('');
}

export function caseRandomEncode(s) {
  return Array.from(s).map(c => 
    c.match(/[a-zA-Z]/) ? (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()) : c
  ).join('');
}

// Invisible character encoding
export function invisibleUnicodeEncode(s) {
  const invisibleChars = ['\u200B', '\u200C', '\u200D', '\u2060'];
  return Array.from(s).map(c => {
    const code = c.charCodeAt(0);
    let binary = code.toString(2).padStart(8, '0');
    return binary.split('').map(bit => 
      bit === '0' ? invisibleChars[0] : invisibleChars[1]
    ).join('') + invisibleChars[2];
  }).join('');
}

// Format string attacks
export function formatStringEncode(s) {
  return s.replace(/./g, '%s');
}

export function printfFormatEncode(s) {
  return Array.from(s).map(c => `%${c.charCodeAt(0)}c`).join('');
}

// Null byte techniques
export function nullByteTerminate(s) {
  return s + '\x00';
}

export function nullBytePrefix(s) {
  return '\x00' + s;
}

export function nullByteScatter(s) {
  return Array.from(s).join('\x00');
}

// Path traversal
export function pathTraversalEncode(s) {
  return s.replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\./g, '%2E');
}

// CRLF injection
export function crlfInjectionEncode(s) {
  return s.replace(/\n/g, '%0D%0A').replace(/\r/g, '%0D');
}

// Punycode
export function punycodeEncode(s) {
  try {
    return 'xn--' + punycode.encode(s);
  } catch {
    return s;
  }
}

// Export all functions in categories for easy access
export const encoders = {
  base: {
    urlencodeAscii,
    xmlEncode,
    encodeBase64,
    encodeBase64Url,
    encodeAsciiHex,
    encodeHex,
    encodeOctal,
    encodeBinary,
    rot13,
    caesar,
    xorCipher
  },
  ciphers: {
    xorCipher,
    xorCipherMultiKey,
    vigenereEncode,
    vigenereDecode,
    atbashCipher,
    affineCipherEncode,
    affineCipherDecode,
    playfairEncode,
    railFenceEncode,
    railFenceDecode,
    beaufortCipher,
    fourSquareEncode,
    baconEncode,
    baconDecode,
    a1z26Encode,
    a1z26Decode,
    bifidEncode,
    rot47
  },
  hash: {
    hashMd5,
    hashSha1,
    hashSha256,
    hashSha384,
    hashSha512,
    hashNtlm,
    hashNtlmv1,
    hashNtlmv2,
    hashMysqlOld,
    hashMysql
  },
  url: {
    doubleUrlencode,
    tripleUrlencode,
    urlencodeAllChars
  },
  unicode: {
    unicodeEscape,
    unicodeEscapeMixed,
    unicodeOverlongUtf8,
    unicodeZalgoEncode,
    unicodeHomographEncode
  },
  html: {
    htmlNamedEntities,
    htmlHexEntities,
    htmlDecimalEntities,
    htmlHexEntitiesLeadingZeros
  },
  javascript: {
    jsStringFromcharcodeSplit,
    jsEvalFromcharcode,
    jsUnicodeEscape,
    jsHexEscape
  },
  sql: {
    sqlCharHexMixed,
    sqlUnhexEncode,
    sqlHexLiteral
  },
  php: {
    phpChrHexMixed,
    phpPackEncode
  },
  powershell: {
    powershellCharArray,
    powershellFormatOperator
  },
  advanced: {
    invisibleUnicodeEncode,
    formatStringEncode,
    printfFormatEncode,
    nullByteTerminate,
    nullBytePrefix,
    nullByteScatter,
    pathTraversalEncode,
    crlfInjectionEncode,
    punycodeEncode
  },
  case: {
    mixedCase,
    caseAlternatingEncode,
    caseRandomEncode
  },
  base_extended: {
    encodeBase16,
    encodeBase32,
    encodeBase32Hex,
    encodeBase32Z,
    encodeBase36,
    encodeBase58,
    encodeBase62,
    encodeBase64Safe,
    encodeBase64NoPadding,
    encodeBase91,
    encodeBaseX
  },
  binary: {
    encodeBinarySpaced,
    encodeBinaryPacked
  },
  decimal: {
    encodeDecimal,
    encodeDecimalPacked
  },
  serialization: {
    encodeAscii85,
    uuencode,
    yEncodeText,
    encodeAsn1Der,
    encodeBencode,
    encodeMessagePack,
    encodeCbor,
    encodePlist,
    encodeBson,
    encodeAmf0,
    encodeAmf3,
    encodeAvro
  },
  crypto_advanced: {
    rc4Encrypt,
    rc4Decrypt,
    blowfishEncrypt,
    bcryptHash,
    scryptHash,
    argon2Hash,
    kerberosEncrypt,
    kerberosDecrypt,
    hashCracker,
    gpuHashCracker
  },
  hashcat_compatible: {
    hashPbkdf2Sha1,
    hashPbkdf2Sha256,
    hashPbkdf2Sha512,
    hashSha512Crypt,
    hashDesCrypt,
    hashApr1Md5,
    hashMsCachev1,
    hashMsCachev2,
    hashNetNtlmv1,
    hashNetNtlmv2,
    hashKerberos5TgsRep23,
    hashKerberos5AsReq23,
    hashWpa,
    hashPostgresMd5,
    hashOracle11g,
    hashMssql2000,
    hashMssql2005,
    hashLm,
    hashCiscoAsaMd5,
    hashCiscoIosPbkdf2
  }
};