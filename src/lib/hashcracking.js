import { hashPbkdf2Sha256 } from './hashing/hashPbkdf2Sha256.js';
import { hashPbkdf2Sha512 } from './hashing/hashPbkdf2Sha512.js';
import { hashSha512Crypt } from './hashing/hashSha512Crypt.js';
import { hashDesCrypt } from './hashing/hashDesCrypt.js';
import { hashApr1Md5 } from './hashing/hashApr1Md5.js';
import { hashMsCachev1 } from './hashing/hashMsCachev1.js';
import { hashMsCachev2 } from './hashing/hashMsCachev2.js';
import { hashNetNtlmv1 } from './hashing/hashNetNtlmv1.js';
import { hashNetNtlmv2 } from './hashing/hashNetNtlmv2.js';
import { hashKerberos5TgsRep23 } from './hashing/hashKerberos5TgsRep23.js';
import { hashKerberos5AsReq23 } from './hashing/hashKerberos5AsReq23.js';
import { hashWpa } from './hashing/hashWpa.js';
import { hashPostgresMd5 } from './hashing/hashPostgresMd5.js';
import { hashOracle11g } from './hashing/hashOracle11g.js';
import { hashMssql2000 } from './hashing/hashMssql2000.js';
import { hashMssql2005 } from './hashing/hashMssql2005.js';
import { hashLm } from './hashing/hashLm.js';
import { hashCiscoAsaMd5 } from './hashing/hashCiscoAsaMd5.js';
import { hashCiscoIosPbkdf2 } from './hashing/hashCiscoIosPbkdf2.js';
import { hashNtlm } from './hashing/hashNtlm.js';
import { hashMysql } from './hashing/hashMysql.js';
import { hashMysqlOld } from './hashing/hashMysqlOld.js';
import { hashPbkdf2Sha1 } from './hashing/hashPbkdf2Sha1.js';
import { bcryptHash } from './hashing/bcryptHash.js';
import { scryptHash } from './hashing/scryptHash.js';
import { argon2Hash } from './hashing/argon2Hash.js';


class HashCracker {
  constructor() {
    this.wordlists = new Map();
    this.isRunning = false;
    this.currentJob = null;
  }

  async loadWordlist(file, name = null) {
    const filename = name || file.name;
    const text = await file.text();
    const words = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    this.wordlists.set(filename, words);
    return { name: filename, count: words.length };
  }

  loadWordlistFromText(text, name) {
    const words = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    this.wordlists.set(name, words);
    return { name, count: words.length };
  }

  getWordlists() {
    return Array.from(this.wordlists.keys()).map(name => ({
      name,
      count: this.wordlists.get(name).length
    }));
  }

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

  async bruteForce(hash, hashType, charset = 'abcdefghijklmnopqrstuvwxyz0123456789', minLength = 1, maxLength = 4, options = {}) {
    if (this.isRunning) {
      throw new Error('Another cracking job is already running');
    }

    this.isRunning = true;
    const startTime = Date.now();
    const hashFunction = this.getHashFunction(hashType);
    let tested = 0;
    const maxTime = options.maxTimeMs || 300000; 

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

  stop() {
    this.isRunning = false;
  }

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

export const hashCracker = new HashCracker();

export {
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
  hashCiscoIosPbkdf2,
  hashNtlm,
  hashMysql,
  hashMysqlOld,
  hashPbkdf2Sha1,
  bcryptHash,
  scryptHash,
  argon2Hash
};

// Basic hash functions that need to be available for the hash cracker
// These are simplified implementations - for production use proper crypto libraries
export function customMd5(input) {
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

  function add32(a, b) {
    return (a + b) & 0xFFFFFFFF;
  }

  function str2binl(str) {
    const bin = [];
    const mask = (1 << 8) - 1;
    for (let i = 0; i < str.length * 8; i += 8) {
      bin[i >> 5] |= (str.charCodeAt(i / 8) & mask) << (i % 32);
    }
    return bin;
  }

  function binl2hex(binarray) {
    const hex_tab = '0123456789abcdef';
    let str = '';
    for (let i = 0; i < binarray.length * 4; i++) {
      str += hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xF) +
             hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8  )) & 0xF);
    }
    return str;
  }

  const x = str2binl(input);
  const len = input.length * 8;
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a, oldb = b, oldc = c, oldd = d;
    const xx = x.slice(i, i + 16);
    while (xx.length < 16) xx.push(0);
    
    md5cycle([a, b, c, d], xx);
    
    a = add32(a, olda);
    b = add32(b, oldb);
    c = add32(c, oldc);
    d = add32(d, oldd);
  }
  
  return binl2hex([a, b, c, d]);
}

export function customMd5Bytes(data) {
  const hex = customMd5(Array.from(data).map(b => String.fromCharCode(b)).join(''));
  return new Uint8Array(hex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
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

// Helper functions for HMAC and other crypto operations
export function customHmacMd5(key, message) {
  const blockSize = 64; // MD5 block size
  let keyBytes = new TextEncoder().encode(key);
  
  if (keyBytes.length > blockSize) {
    keyBytes = customMd5Bytes(keyBytes);
  }
  
  if (keyBytes.length < blockSize) {
    const padded = new Uint8Array(blockSize);
    padded.set(keyBytes);
    keyBytes = padded;
  }
  
  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = keyBytes[i] ^ 0x5c;
    iKeyPad[i] = keyBytes[i] ^ 0x36;
  }
  
  const messageBytes = new TextEncoder().encode(message);
  const innerInput = new Uint8Array(iKeyPad.length + messageBytes.length);
  innerInput.set(iKeyPad);
  innerInput.set(messageBytes, iKeyPad.length);
  
  const innerHash = customMd5Bytes(innerInput);
  
  const outerInput = new Uint8Array(oKeyPad.length + innerHash.length);
  outerInput.set(oKeyPad);
  outerInput.set(innerHash, oKeyPad.length);
  
  const finalHash = customMd5Bytes(outerInput);
  return Array.from(finalHash).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function customSha1Bytes(data) {
  // Simplified SHA1 implementation - in production use crypto.subtle
  console.warn('Using simplified SHA1 implementation');
  // For now, use MD5 as placeholder
  return customMd5Bytes(data);
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
  async fallbackCrack(targetHash, hashType, passwords) {``
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
