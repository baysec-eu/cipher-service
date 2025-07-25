// Import organized hash functions from the main hashes module
import { hashes, hashMd5, hashSha1, hashSha256, hashSha512 } from './hashes.js';

// Import HMAC functions
import { hmacMd5 } from './hashing/hmacMd5.js';
import { hmacSha1 } from './hashing/hmacSha1.js';
import { hmacSha256 } from './hashing/hmacSha256.js';
import { hmacSha512 } from './hashing/hmacSha512.js';

// Import MD4 for completeness  
import { hashMd4 } from './hashing/hashMd4.js';


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

    // Validate hash format
    const targetHash = hash.toLowerCase().trim();
    if (!targetHash) {
      throw new Error('Invalid hash provided');
    }

    this.isRunning = true;
    this.currentJob = {
      hash: targetHash,
      hashType,
      wordlistName,
      startTime: Date.now(),
      tested: 0,
      total: wordlist.length
    };

    let hashFunction;
    try {
      hashFunction = this.getHashFunction(hashType);
    } catch (error) {
      this.isRunning = false;
      this.currentJob = null;
      throw error;
    }

    const batchSize = options.batchSize || 100; // Smaller batch for better responsiveness
    const maxTime = options.maxTimeMs || 300000; // 5 minutes max
    const progressInterval = options.progressInterval || 10; // Report progress every N passwords

    try {
      for (let i = 0; i < wordlist.length; i += batchSize) {
        if (!this.isRunning) break;

        const batch = wordlist.slice(i, i + batchSize);
        
        for (const password of batch) {
          if (!this.isRunning) break;

          try {
            const computed = await hashFunction(password.trim(), options.hashOptions);
            this.currentJob.tested++;

            // Normalize hash comparison
            const computedHash = computed.toLowerCase().trim();
            
            if (computedHash === targetHash) {
              this.isRunning = false;
              return {
                found: true,
                password: password.trim(),
                hash: computedHash,
                tested: this.currentJob.tested,
                timeMs: Date.now() - this.currentJob.startTime,
                hashType: hashType
              };
            }
          } catch (error) {
            console.warn(`Error hashing password "${password}":`, error.message);
            // Continue with next password rather than stopping
          }
        }

        // Check timeout
        if (Date.now() - this.currentJob.startTime > maxTime) {
          console.log('Hash cracking timeout reached');
          break;
        }

        // Report progress periodically
        if (this.currentJob.tested % (progressInterval * batchSize) === 0) {
          console.log(`Progress: ${this.currentJob.tested}/${this.currentJob.total} passwords tested`);
        }

        // Allow UI updates - smaller delay for better responsiveness
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      return {
        found: false,
        password: null,
        hash: null,
        tested: this.currentJob.tested,
        timeMs: Date.now() - this.currentJob.startTime,
        hashType: hashType
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

    // Validate inputs
    const targetHash = hash.toLowerCase().trim();
    if (!targetHash) {
      throw new Error('Invalid hash provided');
    }

    if (minLength < 1 || maxLength > 10 || minLength > maxLength) {
      throw new Error('Invalid length parameters (min: 1, max: 10, minLength <= maxLength)');
    }

    this.isRunning = true;
    const startTime = Date.now();
    let hashFunction;
    
    try {
      hashFunction = this.getHashFunction(hashType);
    } catch (error) {
      this.isRunning = false;
      throw error;
    }
    
    let tested = 0;
    const maxTime = options.maxTimeMs || 300000; 

    console.log(`Starting brute force: ${hashType} hash, length ${minLength}-${maxLength}, charset: ${charset.substring(0, 20)}${charset.length > 20 ? '...' : ''}`);

    try {
      for (let length = minLength; length <= maxLength; length++) {
        console.log(`Brute forcing length ${length}...`);
        const result = await this.bruteForceLength(targetHash, hashFunction, charset, length, options);
        tested += result.tested;

        if (result.found || Date.now() - startTime > maxTime || !this.isRunning) {
          return {
            found: result.found,
            password: result.password,
            hash: result.hash,
            tested,
            timeMs: Date.now() - startTime,
            hashType: hashType
          };
        }
      }

      return {
        found: false,
        password: null,
        hash: null,
        tested,
        timeMs: Date.now() - startTime,
        hashType: hashType
      };
    } finally {
      this.isRunning = false;
    }
  }

  async bruteForceLength(targetHash, hashFunction, charset, length, options) {
    const total = Math.pow(charset.length, length);
    let tested = 0;
    const progressInterval = 1000; // Report progress every 1000 attempts

    console.log(`Brute forcing ${total} combinations for length ${length}`);

    for (let i = 0; i < total; i++) {
      if (!this.isRunning) break;

      const password = this.indexToPassword(i, charset, length);
      
      try {
        const computed = await hashFunction(password, options.hashOptions || {});
        tested++;

        const computedHash = computed.toLowerCase().trim();
        
        if (computedHash === targetHash) {
          console.log(`Password found: "${password}"`);
          return {
            found: true,
            password,
            hash: computedHash,
            tested
          };
        }
      } catch (error) {
        console.warn(`Error hashing password "${password}":`, error.message);
        tested++; // Still count failed attempts
      }

      // Progress reporting and yield control
      if (tested % progressInterval === 0) {
        console.log(`Brute force progress: ${tested}/${total} (${(tested/total*100).toFixed(2)}%)`);
        await new Promise(resolve => setTimeout(resolve, 0));
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
    const normalizedType = hashType.toLowerCase().trim();
    
    const hashFunctions = {
      // Basic hash functions - using organized imports
      'md5': (text) => hashes.hashMd5(text),
      'md4': (text) => hashMd4(text),
      'sha1': async (text) => await hashes.hashSha1(text),
      'sha256': async (text) => await hashes.hashSha256(text),
      'sha384': async (text) => await hashes.hashSha384(text),
      'sha512': async (text) => await hashes.hashSha512(text),
      
      // HMAC functions - newly implemented
      'hmac_md5': async (text, options = {}) => await hmacMd5(options.key || 'key', text),
      'hmac_sha1': async (text, options = {}) => await hmacSha1(options.key || 'key', text),
      'hmac_sha256': async (text, options = {}) => await hmacSha256(options.key || 'key', text),
      'hmac_sha512': async (text, options = {}) => await hmacSha512(options.key || 'key', text),
      
      // Windows hashes
      'ntlm': (text) => hashes.hashNtlm(text),
      'lm': (text) => hashes.hashLm(text),
      'ntlmv1': (text, options = {}) => hashes.hashNtlmv1(text, options.username, options.domain),
      'ntlmv2': (text, options = {}) => hashes.hashNtlmv2(text, options.username, options.domain),
      'net_ntlmv1': (text, options = {}) => hashes.hashNetNtlmv1(text, options.username, options.domain, options.challenge),
      'net_ntlmv2': (text, options = {}) => hashes.hashNetNtlmv2(text, options.username, options.domain, options.challenge),
      
      // Database hashes
      'mysql_old': (text) => hashes.hashMysqlOld(text),
      'mysql': (text) => hashes.hashMysql(text),
      'postgres_md5': (text, options = {}) => hashes.hashPostgresMd5(options.username || 'postgres', text, options.salt || ''),
      'oracle_11g': (text, options = {}) => hashes.hashOracle11g(options.username || 'oracle', text, options.salt || ''),
      'mssql_2000': (text, options = {}) => hashes.hashMssql2000(text, options.salt || ''),
      'mssql_2005': (text, options = {}) => hashes.hashMssql2005(text, options.salt || ''),
      
      // Key derivation functions
      'pbkdf2_sha1': (text, options = {}) => hashes.hashPbkdf2Sha1(text, options.salt || 'salt', options.iterations || 1000),
      'pbkdf2_sha256': async (text, options = {}) => await hashes.hashPbkdf2Sha256(text, options.salt || 'salt', options.iterations || 1000),
      'pbkdf2_sha512': async (text, options = {}) => await hashes.hashPbkdf2Sha512(text, options.salt || 'salt', options.iterations || 1000),
      
      // Unix crypt variants
      'sha512_crypt': (text, options = {}) => hashes.hashSha512Crypt(text, options.salt || '$6$salt$', options.rounds || 5000),
      'des_crypt': (text, options = {}) => hashes.hashDesCrypt(text, options.salt || 'sa'),
      'apr1_md5': (text, options = {}) => hashes.hashApr1Md5(text, options.salt || '$apr1$salt$'),
      
      // Modern password hashing
      'bcrypt': (text, options = {}) => hashes.bcryptHash(text, options.salt || '$2a$10$salt.goes.here.', options.rounds || 10),
      'scrypt': (text, options = {}) => hashes.scryptHash(text, options.salt || 'salt', options.N || 16384, options.r || 8, options.p || 1),
      'argon2': (text, options = {}) => hashes.argon2Hash(text, options.salt || 'salt', options.iterations || 3, options.memory || 4096, options.parallelism || 1),
      
      // Network protocol hashes
      'wpa': (text, options = {}) => hashes.hashWpa(options.ssid || 'network', text),
      'kerberos5_tgs_rep_23': (text, options = {}) => hashes.hashKerberos5TgsRep23(text, options.salt || ''),
      'kerberos5_as_req_23': (text, options = {}) => hashes.hashKerberos5AsReq23(text, options.salt || ''),
      
      // Microsoft caching
      'mscache_v1': (text, options = {}) => hashes.hashMsCachev1(options.username || 'user', text, options.domain || 'domain'),
      'mscache_v2': (text, options = {}) => hashes.hashMsCachev2(options.username || 'user', text, options.domain || 'domain', options.iterations || 10240),
      
      // Cisco hashes
      'cisco_asa_md5': (text, options = {}) => hashes.hashCiscoAsaMd5(text, options.salt || ''),
      'cisco_ios_pbkdf2': (text, options = {}) => hashes.hashCiscoIosPbkdf2(text, options.salt || '')
    };

    const func = hashFunctions[normalizedType];
    if (!func) {
      // Provide helpful error message with supported types
      const supportedTypes = Object.keys(hashFunctions).sort();
      throw new Error(`Unsupported hash type: "${hashType}". Supported types: ${supportedTypes.slice(0, 15).join(', ')}${supportedTypes.length > 15 ? '...' : ''}`);
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

  // Helper method to get supported hash types
  getSupportedHashTypes() {
    const dummyInstance = new HashCracker();
    try {
      dummyInstance.getHashFunction('dummy'); // This will fail
    } catch (error) {
      const match = error.message.match(/Supported types: ([^.]+)/);
      if (match) {
        return match[1].split(', ');
      }
    }
    
    // Fallback list
    return ['md5', 'sha1', 'sha256', 'sha384', 'sha512', 'ntlm', 'lm', 'mysql', 'mysql_old'];
  }

  // Method to create a simple test wordlist
  createTestWordlist() {
    const testWords = [
      'password', '123456', 'admin', 'root', 'test', 'user', 'guest',
      'welcome', 'qwerty', 'abc123', 'pass', 'secret', 'login',
      'demo', 'temp', '1234', 'password1', 'admin123', 'test123'
    ];
    
    this.loadWordlistFromText(testWords.join('\n'), 'test-wordlist');
    return 'test-wordlist';
  }

  // Method to validate hash format
  validateHash(hash, hashType) {
    const trimmedHash = hash.trim();
    const normalizedType = hashType.toLowerCase();
    
    const expectedLengths = {
      'md5': 32,
      'sha1': 40,
      'sha256': 64,
      'sha384': 96,
      'sha512': 128,
      'ntlm': 32,
      'lm': 32
    };
    
    const expectedLength = expectedLengths[normalizedType];
    if (expectedLength && trimmedHash.length !== expectedLength) {
      return {
        valid: false,
        error: `Invalid ${hashType.toUpperCase()} hash length. Expected ${expectedLength} characters, got ${trimmedHash.length}`
      };
    }
    
    // Check if hash contains only hex characters
    if (!/^[a-fA-F0-9]+$/.test(trimmedHash)) {
      return {
        valid: false,
        error: 'Hash must contain only hexadecimal characters (0-9, a-f, A-F)'
      };
    }
    
    return { valid: true };
  }
}

// Export main hash cracker instance
export const hashCracker = new HashCracker();

// Export HMAC functions for external use
export {
  hmacMd5,
  hmacSha1, 
  hmacSha256,
  hmacSha512,
  hashMd4
};

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
      'md5': (text) => hashMd5(text),
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
