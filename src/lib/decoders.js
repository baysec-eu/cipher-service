// Base decoders
export function decodeUrl(s) {
  return decodeURIComponent(s);
}

export function decodeXml(s) {
  return s.replace(/&#x([0-9A-Fa-f]+);?/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
          .replace(/&#(\d+);?/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));
}

export function decodeBase64(s) {
  try {
    return decodeURIComponent(escape(atob(s)));
  } catch {
    return s;
  }
}

export function decodeBase64Url(s) {
  const base64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  return decodeBase64(padded);
}

export function decodeAsciiHex(s) {
  try {
    return s.match(/.{1,2}/g)?.map(hex => String.fromCharCode(parseInt(hex, 16))).join('') || s;
  } catch {
    return s;
  }
}

export function decodeHex(s) {
  try {
    const cleaned = s.replace(/[^0-9A-Fa-f]/g, '');
    const bytes = cleaned.match(/.{1,2}/g) || [];
    return new TextDecoder().decode(new Uint8Array(bytes.map(hex => parseInt(hex, 16))));
  } catch {
    return s;
  }
}

export function decodeOctal(s) {
  try {
    return s.split(' ').map(oct => String.fromCharCode(parseInt(oct, 8))).join('');
  } catch {
    return s;
  }
}

export function decodeBinary(s) {
  try {
    return s.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
  } catch {
    return s;
  }
}

export function decodeDoubleUrl(s) {
  return decodeURIComponent(decodeURIComponent(s));
}

export function decodeTripleUrl(s) {
  return decodeURIComponent(decodeURIComponent(decodeURIComponent(s)));
}

export function decodeUnicodeEscape(s) {
  return s.replace(/\\u([0-9A-Fa-f]{4})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
          .replace(/\\x([0-9A-Fa-f]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export function decodeBase32(s) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleanInput = s.toUpperCase().replace(/[^A-Z2-7]/g, '');
  
  if (cleanInput.length === 0) return '';
  
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const char of cleanInput) {
    const value = alphabet.indexOf(char);
    if (value === -1) continue;
    
    buffer = (buffer << 5) | value;
    bitsLeft += 5;
    
    if (bitsLeft >= 8) {
      result += String.fromCharCode((buffer >> (bitsLeft - 8)) & 255);
      bitsLeft -= 8;
    }
  }
  
  return result;
}

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

export function decodeBase91(s) {
  try {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,./:;<=>?@[]^_`{|}~"';
    const bytes = [];
    let accumulator = 0;
    let bits = 0;
    
    for (let i = 0; i < s.length; i += 2) {
      let c1 = alphabet.indexOf(s[i]);
      let c2 = i + 1 < s.length ? alphabet.indexOf(s[i + 1]) : 0;
      
      if (c1 === -1 || (i + 1 < s.length && c2 === -1)) continue;
      
      let value = c1 + c2 * 91;
      accumulator |= value << bits;
      
      if (value & 8191) {
        bits += 13;
      } else {
        bits += 14;
      }
      
      while (bits >= 8) {
        bytes.push(accumulator & 255);
        accumulator >>= 8;
        bits -= 8;
      }
    }
    
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch {
    return s;
  }
}

export function decodeBase16(s) {
  try {
    const cleaned = s.replace(/[^0-9A-Fa-f]/g, '');
    const bytes = cleaned.match(/.{1,2}/g) || [];
    return new TextDecoder().decode(new Uint8Array(bytes.map(hex => parseInt(hex, 16))));
  } catch {
    return s;
  }
}

export function decodeBase32Hex(s) {
  const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUV';
  const cleanInput = s.toUpperCase().replace(/[^0-9A-V]/g, '');
  
  if (cleanInput.length === 0) return '';
  
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const char of cleanInput) {
    const value = alphabet.indexOf(char);
    if (value === -1) continue;
    
    buffer = (buffer << 5) | value;
    bitsLeft += 5;
    
    if (bitsLeft >= 8) {
      result += String.fromCharCode((buffer >> (bitsLeft - 8)) & 255);
      bitsLeft -= 8;
    }
  }
  
  return result;
}

export function decodeBase32Z(s) {
  const alphabet = 'ybndrfg8ejkmcpqxot1uwisza345h769';
  let result = '';
  let buffer = 0;
  let bitsLeft = 0;
  
  for (const char of s.toLowerCase()) {
    const value = alphabet.indexOf(char);
    if (value === -1) continue;
    
    buffer = (buffer << 5) | value;
    bitsLeft += 5;
    
    if (bitsLeft >= 8) {
      result += String.fromCharCode((buffer >> (bitsLeft - 8)) & 255);
      bitsLeft -= 8;
    }
  }
  
  return result;
}

export function decodeBase64Safe(s) {
  const base64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
  return decodeBase64(padded);
}

export function decodeBase64NoPadding(s) {
  const padded = s + '='.repeat((4 - s.length % 4) % 4);
  return decodeBase64(padded);
}

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

export function decodeBinarySpaced(s) {
  try {
    return s.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
  } catch {
    return s;
  }
}

export function decodeBinaryPacked(s) {
  try {
    const chunks = s.match(/.{1,8}/g) || [];
    return chunks.map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
  } catch {
    return s;
  }
}

export function decodeDecimal(s) {
  try {
    return s.split(' ').map(dec => String.fromCharCode(parseInt(dec))).join('');
  } catch {
    return s;
  }
}

export function decodeDecimalPacked(s) {
  try {
    return s.split(',').map(dec => String.fromCharCode(parseInt(dec))).join('');
  } catch {
    return s;
  }
}

// ASCII85 decoder
export function decodeAscii85(s) {
  try {
    // Remove wrapper
    let data = s.replace(/<~|~>/g, '');
    let result = [];
    
    for (let i = 0; i < data.length; i += 5) {
      let chunk = data.substring(i, i + 5);
      
      if (chunk === 'z') {
        result.push(0, 0, 0, 0);
        continue;
      }
      
      // Pad chunk to 5 characters
      while (chunk.length < 5) {
        chunk += 'u';
      }
      
      // Convert from base 85
      let value = 0;
      for (let j = 0; j < 5; j++) {
        value = value * 85 + (chunk.charCodeAt(j) - 33);
      }
      
      // Extract bytes
      result.push((value >> 24) & 0xFF);
      result.push((value >> 16) & 0xFF);
      result.push((value >> 8) & 0xFF);
      result.push(value & 0xFF);
    }
    
    return new TextDecoder().decode(new Uint8Array(result));
  } catch {
    return s;
  }
}

// uudecode
export function uudecode(s) {
  try {
    const lines = s.split('\n').filter(line => line.trim());
    let result = [];
    
    for (let i = 1; i < lines.length - 2; i++) { // Skip begin/end lines
      const line = lines[i];
      if (line === '`') break;
      
      const lineLength = line.charCodeAt(0) - 32;
      if (lineLength <= 0) continue;
      
      const data = line.substring(1).replace(/`/g, ' '); // Replace graves with spaces
      
      for (let j = 0; j < data.length; j += 4) {
        const c1 = (data.charCodeAt(j) || 32) - 32;
        const c2 = (data.charCodeAt(j + 1) || 32) - 32;
        const c3 = (data.charCodeAt(j + 2) || 32) - 32;
        const c4 = (data.charCodeAt(j + 3) || 32) - 32;
        
        const combined = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;
        
        result.push((combined >> 16) & 0xFF);
        if (j + 1 < data.length) result.push((combined >> 8) & 0xFF);
        if (j + 2 < data.length) result.push(combined & 0xFF);
      }
    }
    
    return new TextDecoder().decode(new Uint8Array(result));
  } catch {
    return s;
  }
}

// yEnc decoder
export function yDecodeText(s) {
  try {
    const lines = s.split(/\r?\n/);
    let result = [];
    let inData = false;
    
    for (const line of lines) {
      if (line.startsWith('=ybegin')) {
        inData = true;
        continue;
      }
      if (line.startsWith('=yend')) {
        break;
      }
      
      if (!inData) continue;
      
      for (let i = 0; i < line.length; i++) {
        let byte = line.charCodeAt(i);
        
        if (byte === 61) { // Escape character
          i++;
          if (i < line.length) {
            byte = (line.charCodeAt(i) - 64) % 256;
          }
        }
        
        result.push((byte - 42) % 256);
      }
    }
    
    return new TextDecoder().decode(new Uint8Array(result));
  } catch {
    return s;
  }
}

// ASN.1 DER decoder
export function decodeAsn1Der(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length < 2 || bytes[0] !== 0x04) return s; // Not OCTET STRING
    
    let offset = 1;
    let length = bytes[offset++];
    
    if (length & 0x80) {
      const lengthBytes = length & 0x7F;
      length = 0;
      for (let i = 0; i < lengthBytes; i++) {
        length = (length << 8) | bytes[offset++];
      }
    }
    
    const content = bytes.slice(offset, offset + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}

// Bencode decoder
export function decodeBencode(s) {
  try {
    const colonIndex = s.indexOf(':');
    if (colonIndex === -1) return s;
    
    const length = parseInt(s.substring(0, colonIndex));
    return s.substring(colonIndex + 1, colonIndex + 1 + length);
  } catch {
    return s;
  }
}

// MessagePack decoder
export function decodeMessagePack(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length === 0) return s;
    
    let offset = 0;
    const type = bytes[offset++];
    let length = 0;
    
    if ((type & 0xe0) === 0xa0) {
      // fixstr
      length = type & 0x1f;
    } else if (type === 0xd9) {
      // str 8
      length = bytes[offset++];
    } else if (type === 0xda) {
      // str 16
      length = (bytes[offset++] << 8) | bytes[offset++];
    } else if (type === 0xdb) {
      // str 32
      length = (bytes[offset++] << 24) | (bytes[offset++] << 16) | (bytes[offset++] << 8) | bytes[offset++];
    }
    
    const content = bytes.slice(offset, offset + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}

// CBOR decoder
export function decodeCbor(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length === 0) return s;
    
    let offset = 0;
    const type = bytes[offset++];
    let length = 0;
    
    if ((type & 0xe0) === 0x60) {
      // Text string
      const info = type & 0x1f;
      if (info <= 23) {
        length = info;
      } else if (info === 24) {
        length = bytes[offset++];
      } else if (info === 25) {
        length = (bytes[offset++] << 8) | bytes[offset++];
      } else if (info === 26) {
        length = (bytes[offset++] << 24) | (bytes[offset++] << 16) | (bytes[offset++] << 8) | bytes[offset++];
      }
    }
    
    const content = bytes.slice(offset, offset + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}

// Property List decoder
export function decodePlist(s) {
  try {
    const stringMatch = s.match(/<string>(.*?)<\/string>/s);
    if (stringMatch) {
      return stringMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    }
    return s;
  } catch {
    return s;
  }
}

// BSON decoder
export function decodeBson(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length < 8) return s;
    
    // Skip document size (4 bytes) and type (1 byte)
    let offset = 5;
    
    // Skip key name until null terminator
    while (offset < bytes.length && bytes[offset] !== 0) offset++;
    offset++; // Skip null terminator
    
    // Read string length (4 bytes, little endian)
    const strLen = bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24);
    offset += 4;
    
    // Read string content (excluding null terminator)
    const content = bytes.slice(offset, offset + strLen - 1);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}

// AMF0 decoder
export function decodeAmf0(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length < 3 || bytes[0] !== 0x02) return s; // Not string type
    
    const length = (bytes[1] << 8) | bytes[2];
    const content = bytes.slice(3, 3 + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}

// AMF3 decoder
export function decodeAmf3(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length < 2 || bytes[0] !== 0x06) return s; // Not string type
    
    let offset = 1;
    let length = 0;
    let byte = bytes[offset++];
    
    // Decode variable length integer
    if (byte & 0x80) {
      length = (byte & 0x7F) << 7;
      byte = bytes[offset++];
      if (byte & 0x80) {
        length |= (byte & 0x7F) << 14;
        byte = bytes[offset++];
      }
      length |= byte & 0x7F;
    } else {
      length = byte & 0x7F;
    }
    
    length >>= 1; // Remove reference bit
    
    const content = bytes.slice(offset, offset + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}

// Avro decoder
export function decodeAvro(s) {
  try {
    const bytes = s.match(/.{2}/g)?.map(hex => parseInt(hex, 16)) || [];
    if (bytes.length === 0) return s;
    
    let offset = 0;
    let length = 0;
    let shift = 0;
    
    // Decode variable-length integer
    while (offset < bytes.length) {
      const byte = bytes[offset++];
      length |= (byte & 0x7F) << shift;
      if (!(byte & 0x80)) break;
      shift += 7;
    }
    
    const content = bytes.slice(offset, offset + length);
    return new TextDecoder().decode(new Uint8Array(content));
  } catch {
    return s;
  }
}

// XOR cipher with multi-byte key decoder
export function xorCipherMultiKeyDecode(s, keyStr = "key") {
  // XOR is symmetric, so decoding is the same as encoding
  const key = new TextEncoder().encode(keyStr);
  return Array.from(s).map((c, i) => 
    String.fromCharCode(c.charCodeAt(0) ^ key[i % key.length])
  ).join('');
}

// Playfair decoder
export function playfairDecode(s, keyStr = "MONARCHY") {
  // Generate 5x5 key matrix
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // J=I
  const cleanKey = (String(keyStr) + alphabet).toUpperCase().replace(/J/g, 'I');
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
  
  // Prepare text - ensure even length
  let text = s.toUpperCase().replace(/[^A-Z]/g, '');
  let pairs = [];
  
  for (let i = 0; i < text.length; i += 2) {
    if (i + 1 < text.length) {
      pairs.push(text[i] + text[i + 1]);
    }
  }
  
  // Decode pairs
  return pairs.map(pair => {
    const [r1, c1] = findPos(pair[0]);
    const [r2, c2] = findPos(pair[1]);
    
    if (r1 === r2) {
      // Same row - move left
      return grid[r1][(c1 + 4) % 5] + grid[r2][(c2 + 4) % 5];
    } else if (c1 === c2) {
      // Same column - move up
      return grid[(r1 + 4) % 5][c1] + grid[(r2 + 4) % 5][c2];
    } else {
      // Rectangle
      return grid[r1][c2] + grid[r2][c1];
    }
  }).join('');
}

// Bifid decoder
export function bifidDecode(s, keyStr = "MONARCHY") {
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
  
  // Convert cipher to coordinates
  const text = s.toUpperCase().replace(/[^A-Z]/g, '');
  const combined = [];
  
  for (const char of text) {
    if (coords[char]) {
      combined.push(...coords[char]);
    }
  }
  
  // Split into rows and columns
  const midpoint = combined.length / 2;
  const rows = combined.slice(0, midpoint);
  const cols = combined.slice(midpoint);
  
  // Convert back to letters
  let result = '';
  for (let i = 0; i < rows.length; i++) {
    const key = `${rows[i]},${cols[i]}`;
    result += reverseCoords[key] || '';
  }
  
  return result;
}

// Four Square decoder
export function fourSquareDecode(s, keyStr1 = "EXAMPLE", keyStr2 = "KEYWORD") {
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
  const text = s.toUpperCase().replace(/[^A-Z]/g, '');
  
  let result = '';
  for (let i = 0; i < text.length; i += 2) {
    if (i + 1 < text.length) {
      const [r1, c1] = findPos(text[i], 1);
      const [r2, c2] = findPos(text[i + 1], 2);
      
      result += grids[0][r1][c2] + grids[3][r2][c1];
    }
  }
  
  return result;
}

export function decodeZalgo(s) {
  return s.replace(/[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g, '');
}

export function decodeHomograph(s) {
  const homographs = {
    'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'х': 'x',
    'А': 'A', 'В': 'B', 'С': 'C', 'Е': 'E', 'Н': 'H', 'К': 'K',
    'М': 'M', 'О': 'O', 'Р': 'P', 'Т': 'T', 'Х': 'X', 'У': 'Y'
  };
  
  return Array.from(s).map(c => homographs[c] || c).join('');
}

export function decodeCaseVariations(s) {
  return s.toLowerCase();
}

export function decodeInvisibleUnicode(s) {
  const invisibleChars = ['\u200B', '\u200C', '\u200D', '\u2060', '\uFEFF'];
  let result = s;
  
  invisibleChars.forEach(char => {
    result = result.replace(new RegExp(char, 'g'), '');
  });
  
  return result;
}

export function decodeNullByte(s) {
  return s.replace(/\x00/g, '');
}

export function decodeHtmlEntities(s) {
  const entities = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'",
    '&nbsp;': ' ', '&copy;': '©', '&reg;': '®', '&trade;': '™'
  };
  
  let result = s;
  
  // Named entities
  Object.entries(entities).forEach(([entity, char]) => {
    result = result.replace(new RegExp(entity, 'g'), char);
  });
  
  // Numeric entities (hex)
  result = result.replace(/&#x([0-9A-Fa-f]+);?/g, (match, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  );
  
  // Numeric entities (decimal)
  result = result.replace(/&#(\d+);?/g, (match, dec) => 
    String.fromCharCode(parseInt(dec, 10))
  );
  
  return result;
}

export function decodeJsString(s) {
  let result = s;
  
  // Handle String.fromCharCode patterns
  result = result.replace(/String\.fromCharCode\(([0-9,\s]+)\)/g, (match, codes) => {
    return codes.split(',').map(code => String.fromCharCode(parseInt(code.trim()))).join('');
  });
  
  // Handle unicode escapes
  result = result.replace(/\\u([0-9A-Fa-f]{4})/g, (match, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  );
  
  // Handle hex escapes
  result = result.replace(/\\x([0-9A-Fa-f]{2})/g, (match, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  );
  
  return result;
}

export function decodeSqlString(s) {
  let result = s;
  
  // Handle CHAR() functions
  result = result.replace(/CHAR\((\d+)\)/g, (match, code) => 
    String.fromCharCode(parseInt(code))
  );
  
  // Handle hex literals
  result = result.replace(/0x([0-9A-Fa-f]+)/g, (match, hex) => 
    decodeHex(hex)
  );
  
  // Handle UNHEX function
  result = result.replace(/UNHEX\('([0-9A-Fa-f]+)'\)/g, (match, hex) => 
    decodeHex(hex)
  );
  
  return result;
}

export function decodePhpString(s) {
  let result = s;
  
  // Handle chr() functions
  result = result.replace(/chr\((\d+)\)/g, (match, code) => 
    String.fromCharCode(parseInt(code))
  );
  
  // Handle hex strings
  result = result.replace(/"\\x([0-9A-Fa-f]{2})"/g, (match, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  );
  
  // Handle pack function
  result = result.replace(/pack\("C\*",([0-9,\s]+)\)/g, (match, codes) => {
    return codes.split(',').map(code => String.fromCharCode(parseInt(code.trim()))).join('');
  });
  
  return result;
}

export function decodePowershellString(s) {
  let result = s;
  
  // Handle char arrays
  result = result.replace(/\[char\[\]\]@\(([0-9,\s]+)\) -join ''/g, (match, codes) => {
    return codes.split(',').map(code => String.fromCharCode(parseInt(code.trim()))).join('');
  });
  
  // Handle format operator
  result = result.replace(/"([^"]*)" -f ([0-9,\s]+)/g, (match, format, codes) => {
    const codeArray = codes.split(',').map(code => String.fromCharCode(parseInt(code.trim())));
    return codeArray.join('');
  });
  
  return result;
}

export function decodeCrlf(s) {
  return s.replace(/%0D%0A/g, '\n').replace(/%0D/g, '\r').replace(/%0A/g, '\n');
}

export function decodePathTraversal(s) {
  return s.replace(/%2F/g, '/').replace(/%5C/g, '\\').replace(/%2E/g, '.');
}

// Export all decoders in categories
export const decoders = {
  base: {
    decodeUrl,
    decodeXml,
    decodeBase64,
    decodeBase64Url,
    decodeAsciiHex,
    decodeHex,
    decodeOctal,
    decodeBinary,
    decodeBase32
  },
  url: {
    decodeDoubleUrl,
    decodeTripleUrl
  },
  unicode: {
    decodeUnicodeEscape,
    decodeZalgo,
    decodeHomograph,
    decodeInvisibleUnicode
  },
  html: {
    decodeHtmlEntities
  },
  javascript: {
    decodeJsString
  },
  sql: {
    decodeSqlString
  },
  php: {
    decodePhpString
  },
  powershell: {
    decodePowershellString
  },
  base_extended: {
    decodeBase16,
    decodeBase32,
    decodeBase32Hex,
    decodeBase32Z,
    decodeBase36,
    decodeBase58,
    decodeBase62,
    decodeBase64Safe,
    decodeBase64NoPadding,
    decodeBase91,
    decodeBaseX
  },
  binary: {
    decodeBinarySpaced,
    decodeBinaryPacked
  },
  decimal: {
    decodeDecimal,
    decodeDecimalPacked
  },
  serialization: {
    decodeAscii85,
    uudecode,
    yDecodeText,
    decodeAsn1Der,
    decodeBencode,
    decodeMessagePack,
    decodeCbor,
    decodePlist,
    decodeBson,
    decodeAmf0,
    decodeAmf3,
    decodeAvro
  },
  ciphers: {
    xorCipherMultiKeyDecode,
    playfairDecode,
    bifidDecode,
    fourSquareDecode
  },
  advanced: {
    decodeNullByte,
    decodeCrlf,
    decodePathTraversal,
    decodeCaseVariations
  }
};