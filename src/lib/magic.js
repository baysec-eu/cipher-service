// Magic detection and multi-operation functionality inspired by CyberChef
import { hashMd5, hashSha1, hashSha256, hashSha384, hashSha512, hashNtlm } from './hashes.js';

// Multi-hash recipe - compute multiple hashes at once
export async function multiHash(input, hashTypes = ['md5', 'sha1', 'sha256', 'sha512', 'ntlm']) {
  const results = {};
  
  for (const hashType of hashTypes) {
    try {
      switch (hashType.toLowerCase()) {
        case 'md5':
          results.md5 = hashMd5(input);
          break;
        case 'sha1':
          results.sha1 = await hashSha1(input);
          break;
        case 'sha256':
          results.sha256 = await hashSha256(input);
          break;
        case 'sha384':
          results.sha384 = await hashSha384(input);
          break;
        case 'sha512':
          results.sha512 = await hashSha512(input);
          break;
        case 'ntlm':
          results.ntlm = hashNtlm(input);
          break;
        default:
          console.warn(`Unknown hash type: ${hashType}`);
      }
    } catch (error) {
      console.error(`Error computing ${hashType} hash:`, error);
      results[hashType] = `Error: ${error.message}`;
    }
  }
  
  return results;
}

// Multi-encoding recipe - encode data in multiple formats at once
export function multiEncode(input, encodingTypes = ['base64', 'hex', 'binary', 'octal']) {
  const results = {};
  
  for (const encodingType of encodingTypes) {
    try {
      switch (encodingType.toLowerCase()) {
        case 'base64':
          results.base64 = btoa(unescape(encodeURIComponent(input)));
          break;
        case 'hex':
          results.hex = new TextEncoder().encode(input).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
          break;
        case 'binary':
          results.binary = Array.from(input).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
          break;
        case 'octal':
          results.octal = Array.from(input).map(c => c.charCodeAt(0).toString(8)).join(' ');
          break;
        case 'url':
          results.url = Array.from(input).map(c => `%${c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`).join('');
          break;
        default:
          console.warn(`Unknown encoding type: ${encodingType}`);
      }
    } catch (error) {
      console.error(`Error encoding with ${encodingType}:`, error);
      results[encodingType] = `Error: ${error.message}`;
    }
  }
  
  return results;
}

// Hash detection - identify what type of hash a string might be
function detectHash(input) {
  const trimmed = input.trim();
  const length = trimmed.length;
  const isHex = /^[a-fA-F0-9]+$/.test(trimmed);
  const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(trimmed);
  
  const possibilities = [];
  
  // Common hash lengths and patterns
  if (isHex) {
    switch (length) {
      case 32:
        possibilities.push('MD5', 'NTLM', 'MD4');
        break;
      case 40:
        possibilities.push('SHA-1', 'MySQL4.1+');
        break;
      case 64:
        possibilities.push('SHA-256', 'SHA3-256');
        break;
      case 96:
        possibilities.push('SHA-384');
        break;
      case 128:
        possibilities.push('SHA-512', 'SHA3-512');
        break;
      case 56:
        possibilities.push('SHA-224');
        break;
      case 16:
        possibilities.push('MySQL <= 3.23');
        break;
    }
  }
  
  // Base64 encoded hashes
  if (isBase64) {
    switch (length) {
      case 24:
        possibilities.push('MD5 (Base64)', 'NTLM (Base64)');
        break;
      case 28:
        possibilities.push('SHA-1 (Base64)');
        break;
      case 44:
        possibilities.push('SHA-256 (Base64)');
        break;
      case 64:
        possibilities.push('SHA-384 (Base64)');
        break;
      case 88:
        possibilities.push('SHA-512 (Base64)');
        break;
    }
  }
  
  // Special patterns
  if (trimmed.startsWith('$1$')) {
    possibilities.push('MD5 Crypt');
  } else if (trimmed.startsWith('$2a$') || trimmed.startsWith('$2b$') || trimmed.startsWith('$2y$')) {
    possibilities.push('Bcrypt');
  } else if (trimmed.startsWith('$5$')) {
    possibilities.push('SHA-256 Crypt');
  } else if (trimmed.startsWith('$6$')) {
    possibilities.push('SHA-512 Crypt');
  } else if (trimmed.startsWith('$argon2')) {
    possibilities.push('Argon2');
  } else if (trimmed.startsWith('$scrypt$')) {
    possibilities.push('Scrypt');
  } else if (trimmed.startsWith('{SHA}')) {
    possibilities.push('SHA-1 (LDAP)');
  } else if (trimmed.startsWith('{SSHA}')) {
    possibilities.push('Salted SHA-1 (LDAP)');
  }
  
  return {
    input: trimmed,
    length: length,
    isHex: isHex,
    isBase64: isBase64,
    possibleTypes: possibilities.length > 0 ? possibilities : ['Unknown format']
  };
}

// Encoding detection - identify what type of encoding a string might be
function detectEncoding(input) {
  const trimmed = input.trim();
  const possibilities = [];
  
  // Base64 detection
  if (/^[A-Za-z0-9+/]+=*$/.test(trimmed) && trimmed.length % 4 === 0) {
    possibilities.push('Base64');
  }
  
  // Hex detection
  if (/^[a-fA-F0-9]+$/.test(trimmed) && trimmed.length % 2 === 0) {
    possibilities.push('Hexadecimal');
  }
  
  // Binary detection
  if (/^[01\s]+$/.test(trimmed)) {
    possibilities.push('Binary');
  }
  
  // Octal detection
  if (/^[0-7\s]+$/.test(trimmed)) {
    possibilities.push('Octal');
  }
  
  // URL encoding detection
  if (/%[0-9a-fA-F]{2}/.test(trimmed)) {
    possibilities.push('URL Encoded');
  }
  
  // HTML entities detection
  if (/&#?\w+;/.test(trimmed)) {
    possibilities.push('HTML Entities');
  }
  
  // Unicode escape detection
  if (/\\u[0-9a-fA-F]{4}/.test(trimmed)) {
    possibilities.push('Unicode Escape');
  }
  
  // ASCII detection (printable characters)
  if (/^[\x20-\x7E]+$/.test(trimmed)) {
    possibilities.push('ASCII Text');
  }
  
  return {
    input: trimmed,
    length: trimmed.length,
    possibleEncodings: possibilities.length > 0 ? possibilities : ['Unknown encoding']
  };
}

// Magic recipe - automatically detect and decode/encode based on input
async function magicRecipe(input, operation = 'auto') {
  const results = {
    original: input,
    detection: {},
    operations: {}
  };
  
  // Detect hash type if it looks like a hash
  const hashDetection = detectHash(input);
  if (hashDetection.possibleTypes[0] !== 'Unknown format') {
    results.detection.hash = hashDetection;
  }
  
  // Detect encoding type
  const encodingDetection = detectEncoding(input);
  results.detection.encoding = encodingDetection;
  
  // If auto operation, perform multiple operations
  if (operation === 'auto' || operation === 'all') {
    // Try multiple hashes if input looks like text
    if (encodingDetection.possibleEncodings.includes('ASCII Text')) {
      results.operations.hashes = await multiHash(input);
    }
    
    // Try multiple encodings
    results.operations.encodings = multiEncode(input);
    
    // Try to decode if it looks encoded
    if (encodingDetection.possibleEncodings.includes('Base64')) {
      try {
        const decoded = atob(input);
        results.operations.base64Decoded = decoded;
        // Try to hash the decoded result too
        results.operations.decodedHashes = await multiHash(decoded);
      } catch (error) {
        results.operations.base64Decoded = `Error: ${error.message}`;
      }
    }
    
    if (encodingDetection.possibleEncodings.includes('Hexadecimal')) {
      try {
        const decoded = input.match(/.{2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
        results.operations.hexDecoded = decoded;
        // Try to hash the decoded result too
        results.operations.decodedHashes = await multiHash(decoded);
      } catch (error) {
        results.operations.hexDecoded = `Error: ${error.message}`;
      }
    }
  }
  
  return results;
}

// Entropy analysis - measure randomness of input (useful for detecting encrypted/encoded data)
function analyzeEntropy(input) {
  const freq = {};
  for (const char of input) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  let entropy = 0;
  const length = input.length;
  
  for (const count of Object.values(freq)) {
    const p = count / length;
    entropy -= p * Math.log2(p);
  }
  
  return {
    entropy: entropy,
    maxEntropy: Math.log2(Object.keys(freq).length),
    randomnessScore: entropy / Math.log2(256), // Normalized to 0-1
    analysis: entropy > 7 ? 'High entropy - likely encrypted/random' :
             entropy > 4 ? 'Medium entropy - possibly encoded' :
             'Low entropy - likely plain text',
    characterDistribution: freq
  };
}

// Format analysis - detect file format signatures
function detectFormat(input) {
  const signatures = [
    { name: 'PNG', pattern: /^.PNG/, hex: '89504E47' },
    { name: 'JPEG', pattern: /^.{0,3}JFIF|^.{0,3}Exif/, hex: 'FFD8FF' },
    { name: 'GIF', pattern: /^GIF8[79]a/, hex: '474946' },
    { name: 'PDF', pattern: /^%PDF/, hex: '25504446' },
    { name: 'ZIP', pattern: /^PK\x03\x04/, hex: '504B0304' },
    { name: 'RAR', pattern: /^Rar!/, hex: '526172' },
    { name: 'ELF', pattern: /^\x7fELF/, hex: '7F454C46' },
    { name: 'PE/EXE', pattern: /^MZ/, hex: '4D5A' }
  ];
  
  const detected = [];
  
  // Check binary patterns
  const bytes = new TextEncoder().encode(input.slice(0, 16));
  const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  
  for (const sig of signatures) {
    if (sig.pattern.test(input) || hex.startsWith(sig.hex)) {
      detected.push(sig.name);
    }
  }
  
  return {
    detectedFormats: detected,
    headerHex: hex,
    isProbablyBinary: bytes.some(b => b < 32 && b !== 9 && b !== 10 && b !== 13)
  };
}

// All magic operations combined
export const magic = {
  // Multi-operation recipes
  multiHash,
  multiEncode,
  
  // Detection recipes
  detectHash,
  detectEncoding,
  detectFormat,
  
  // Magic recipes
  magicRecipe,
  
  // Analysis recipes
  analyzeEntropy,
  
  // Convenience recipes
  hashAndEncode: async (input) => {
    const hashes = await multiHash(input);
    const encodings = multiEncode(input);
    return { hashes, encodings };
  },
  
  identifyAndProcess: async (input) => {
    const magic = await magicRecipe(input);
    const entropy = analyzeEntropy(input);
    const format = detectFormat(input);
    return { ...magic, entropy, format };
  },
  
  // CyberChef-style "Magic" operation
  cyberChefMagic: async (input, depth = 3) => {
    const results = [];
    let currentInput = input;
    
    for (let i = 0; i < depth; i++) {
      const detection = detectEncoding(currentInput);
      const entropy = analyzeEntropy(currentInput);
      
      results.push({
        step: i + 1,
        input: currentInput.length > 100 ? currentInput.slice(0, 100) + '...' : currentInput,
        detection: detection,
        entropy: entropy.analysis,
        entropyScore: entropy.randomnessScore.toFixed(3)
      });
      
      // Try to decode if it looks encoded
      let decoded = null;
      if (detection.possibleEncodings.includes('Base64')) {
        try {
          decoded = atob(currentInput);
        } catch (e) { /* ignore */ }
      } else if (detection.possibleEncodings.includes('Hexadecimal')) {
        try {
          decoded = currentInput.match(/.{2}/g).map(byte => String.fromCharCode(parseInt(byte, 16))).join('');
        } catch (e) { /* ignore */ }
      } else if (detection.possibleEncodings.includes('URL Encoded')) {
        try {
          decoded = decodeURIComponent(currentInput);
        } catch (e) { /* ignore */ }
      }
      
      if (!decoded || decoded === currentInput) {
        break;
      }
      
      currentInput = decoded;
    }
    
    return {
      originalInput: input,
      steps: results,
      finalOutput: currentInput,
      decodingLevels: results.length
    };
  }
};

// Export individual functions for direct access
export {
  detectHash,
  detectEncoding,
  detectFormat,
  magicRecipe,
  analyzeEntropy
};

// multiHash and multiEncode are available through magic.multiHash and magic.multiEncode to avoid duplicate exports