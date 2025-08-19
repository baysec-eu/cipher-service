// Unified Crypto Operations
// Single operation per algorithm with intelligent parameter handling

// Helper to detect and parse key format
export function parseKey(key, options = {}) {
  if (!key) return null;
  
  const { format = 'auto' } = options;
  
  if (key instanceof Uint8Array) {
    return key;
  }
  
  if (typeof key !== 'string') {
    return new Uint8Array(key);
  }
  
  // Auto-detect format
  if (format === 'auto') {
    // Check if it's hex (even length, all hex chars)
    if (key.match(/^[0-9a-fA-F]+$/) && key.length % 2 === 0) {
      return new Uint8Array(key.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    }
    
    // Try base64
    try {
      const decoded = atob(key);
      return new Uint8Array(decoded.split('').map(c => c.charCodeAt(0)));
    } catch {
      // If not valid base64, treat as raw text
      return new TextEncoder().encode(key);
    }
  }
  
  // Explicit format
  switch (format) {
    case 'hex':
      return new Uint8Array(key.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    case 'base64':
      return new Uint8Array(atob(key).split('').map(c => c.charCodeAt(0)));
    case 'utf8':
    case 'text':
    default:
      return new TextEncoder().encode(key);
  }
}

// Helper to format output
export function formatOutput(data, format = 'base64') {
  if (!(data instanceof Uint8Array)) {
    data = new Uint8Array(data);
  }
  
  switch (format) {
    case 'hex':
      return Array.from(data).map(b => b.toString(16).padStart(2, '0')).join('');
    case 'base64':
      return btoa(String.fromCharCode(...data));
    case 'bytes':
    case 'raw':
      return data;
    case 'utf8':
    case 'text':
      return new TextDecoder().decode(data);
    default:
      return btoa(String.fromCharCode(...data));
  }
}

// Unified AES operation
export async function aesTransform(input, params = {}) {
  const {
    key,
    keyFormat = 'auto',
    keyDerivation,
    salt,
    iterations = 100000,
    mode = 'GCM',
    operation = 'encrypt',
    iv,
    ivFormat = 'auto',
    associatedData,
    tagLength = 128,
    outputFormat = 'base64',
    keySize
  } = params;
  
  try {
    // Parse key
    let keyBytes = parseKey(key, { format: keyFormat });
    if (!keyBytes || keyBytes.length === 0) {
      throw new Error('Key is required for AES operations');
    }
    
    // Apply key derivation if specified
    if (keyDerivation === 'pbkdf2' || keyDerivation === 'hkdf') {
      const { pbkdf2, hkdf } = await import('../crypto.js');
      const targetKeySize = keySize || (mode === 'GCM' ? 32 : 16); // Default 256-bit for GCM, 128-bit otherwise
      
      if (keyDerivation === 'pbkdf2') {
        keyBytes = await pbkdf2(
          keyBytes,
          salt || 'default-salt',
          iterations,
          targetKeySize
        );
      } else {
        keyBytes = await hkdf(
          keyBytes,
          salt || 'default-salt',
          'aes-encryption',
          targetKeySize
        );
      }
    }
    
    // Ensure proper key size
    const validKeySizes = [16, 24, 32]; // 128, 192, 256 bits
    let actualKeySize = keyBytes.length;
    
    if (!validKeySizes.includes(actualKeySize)) {
      // Find nearest valid size
      if (actualKeySize < 16) actualKeySize = 16;
      else if (actualKeySize < 24) actualKeySize = 24;
      else if (actualKeySize < 32) actualKeySize = 32;
      else actualKeySize = 32;
      
      // Resize key
      const newKey = new Uint8Array(actualKeySize);
      if (keyBytes.length >= actualKeySize) {
        newKey.set(keyBytes.slice(0, actualKeySize));
      } else {
        // Pad with key repetition
        for (let i = 0; i < actualKeySize; i++) {
          newKey[i] = keyBytes[i % keyBytes.length];
        }
      }
      keyBytes = newKey;
    }
    
    // Import key
    const algorithm = mode === 'CTR' ? 'AES-CTR' : `AES-${mode}`;
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: algorithm },
      false,
      [operation]
    );
    
    // Handle IV
    let ivBytes;
    if (operation === 'encrypt') {
      if (iv) {
        ivBytes = parseKey(iv, { format: ivFormat });
      } else {
        // Generate IV based on mode
        const ivSize = mode === 'GCM' ? 12 : 16;
        ivBytes = crypto.getRandomValues(new Uint8Array(ivSize));
      }
    } else {
      // Decrypt requires IV
      if (!iv) throw new Error('IV is required for decryption');
      ivBytes = parseKey(iv, { format: ivFormat });
    }
    
    // Configure algorithm parameters
    let algorithmParams = {
      name: algorithm,
      iv: ivBytes
    };
    
    if (mode === 'CTR') {
      algorithmParams.counter = ivBytes;
      algorithmParams.length = 64;
    } else if (mode === 'GCM') {
      algorithmParams.tagLength = tagLength;
      if (associatedData) {
        algorithmParams.additionalData = new TextEncoder().encode(associatedData);
      }
    }
    
    // Perform operation
    if (operation === 'encrypt') {
      const plainBytes = new TextEncoder().encode(input);
      const encrypted = await crypto.subtle.encrypt(
        algorithmParams,
        cryptoKey,
        plainBytes
      );
      
      // Return formatted result
      if (outputFormat === 'object') {
        return {
          data: formatOutput(new Uint8Array(encrypted), 'base64'),
          iv: formatOutput(ivBytes, 'base64'),
          mode: mode,
          keySize: keyBytes.length * 8
        };
      } else {
        // Combined format: iv:data
        return formatOutput(ivBytes, outputFormat) + ':' + formatOutput(new Uint8Array(encrypted), outputFormat);
      }
    } else {
      // Decrypt
      let dataBytes;
      if (typeof input === 'string' && input.includes(':') && !iv) {
        // Combined format
        const [ivPart, dataPart] = input.split(':');
        ivBytes = parseKey(ivPart, { format: outputFormat });
        dataBytes = parseKey(dataPart, { format: outputFormat });
        algorithmParams.iv = ivBytes;
        if (mode === 'CTR') {
          algorithmParams.counter = ivBytes;
        }
      } else {
        dataBytes = parseKey(input, { format: outputFormat });
      }
      
      const decrypted = await crypto.subtle.decrypt(
        algorithmParams,
        cryptoKey,
        dataBytes
      );
      
      return new TextDecoder().decode(decrypted);
    }
  } catch (error) {
    throw new Error(`AES ${operation} failed: ${error.message}`);
  }
}

// Unified DES/3DES operation
export async function desTransform(input, params = {}) {
  const {
    key,
    keyFormat = 'auto',
    mode = 'DES', // DES or 3DES
    operation = 'encrypt',
    outputFormat = 'base64'
  } = params;
  
  // Import the DES implementation
  const { desEncrypt, desDecrypt, tripleDesEncrypt, tripleDesDecrypt } = await import('../cipher/desFixed.js');
  
  try {
    // Parse key
    const keyBytes = parseKey(key, { format: keyFormat });
    if (!keyBytes || keyBytes.length === 0) {
      throw new Error('Key is required for DES operations');
    }
    
    // Convert key to string for the existing DES implementation
    const keyString = new TextDecoder().decode(keyBytes);
    
    if (operation === 'encrypt') {
      if (mode === '3DES' || mode === 'TripleDES') {
        return await tripleDesEncrypt(input, keyString, { outputFormat });
      } else {
        return await desEncrypt(input, keyString, { outputFormat });
      }
    } else {
      if (mode === '3DES' || mode === 'TripleDES') {
        return await tripleDesDecrypt(input, keyString, { inputFormat: outputFormat });
      } else {
        return await desDecrypt(input, keyString, { inputFormat: outputFormat });
      }
    }
  } catch (error) {
    throw new Error(`${mode} ${operation} failed: ${error.message}`);
  }
}

// Unified Blowfish operation
export async function blowfishTransform(input, params = {}) {
  const {
    key,
    keyFormat = 'auto',
    operation = 'encrypt',
    outputFormat = 'base64'
  } = params;
  
  const { blowfishEncrypt, blowfishDecrypt } = await import('../cipher/blowfishFixed.js');
  
  try {
    // Parse key
    const keyBytes = parseKey(key, { format: keyFormat });
    if (!keyBytes || keyBytes.length === 0) {
      throw new Error('Key is required for Blowfish operations');
    }
    
    // Convert key to string for the existing implementation
    const keyString = new TextDecoder().decode(keyBytes);
    
    if (operation === 'encrypt') {
      const result = await blowfishEncrypt(input, keyString);
      if (outputFormat === 'hex') {
        const bytes = parseKey(result, { format: 'base64' });
        return formatOutput(bytes, 'hex');
      }
      return result;
    } else {
      return await blowfishDecrypt(input, keyString);
    }
  } catch (error) {
    throw new Error(`Blowfish ${operation} failed: ${error.message}`);
  }
}

// Unified RC4 operation
export async function rc4Transform(input, params = {}) {
  const {
    key,
    keyFormat = 'auto',
    operation = 'encrypt', // RC4 is symmetric
    outputFormat = 'base64'
  } = params;
  
  const { rc4Encrypt } = await import('../cipher/rc4Encrypt.js');
  
  try {
    // Parse key
    const keyBytes = parseKey(key, { format: keyFormat });
    if (!keyBytes || keyBytes.length === 0) {
      throw new Error('Key is required for RC4 operations');
    }
    
    // Convert key to string for the existing implementation
    const keyString = new TextDecoder().decode(keyBytes);
    
    // RC4 is symmetric, so encrypt/decrypt are the same
    return await rc4Encrypt(input, keyString);
  } catch (error) {
    throw new Error(`RC4 ${operation} failed: ${error.message}`);
  }
}

// Unified RSA operation
export async function rsaTransform(input, params = {}) {
  const {
    key,
    keyFormat = 'auto',
    operation = 'encrypt',
    outputFormat = 'base64',
    oaepHash = 'SHA-256'
  } = params;
  
  const { rsaEncrypt, rsaDecrypt } = await import('../crypto.js');
  
  try {
    if (!key) {
      throw new Error('Key is required for RSA operations');
    }
    
    // RSA expects PEM format keys
    let pemKey = key;
    if (!key.includes('-----BEGIN')) {
      // Try to construct PEM from base64
      const keyType = operation === 'encrypt' ? 'PUBLIC KEY' : 'PRIVATE KEY';
      pemKey = `-----BEGIN ${keyType}-----\n${key}\n-----END ${keyType}-----`;
    }
    
    if (operation === 'encrypt') {
      const result = await rsaEncrypt(input, pemKey);
      if (outputFormat === 'hex') {
        const bytes = parseKey(result, { format: 'base64' });
        return formatOutput(bytes, 'hex');
      }
      return result;
    } else {
      return await rsaDecrypt(input, pemKey);
    }
  } catch (error) {
    throw new Error(`RSA ${operation} failed: ${error.message}`);
  }
}

// Unified XOR cipher
export function xorTransform(input, params = {}) {
  const {
    key,
    keyFormat = 'auto',
    outputFormat = 'base64'
  } = params;
  
  try {
    if (!key) {
      throw new Error('Key is required for XOR operations');
    }
    
    const inputBytes = new TextEncoder().encode(input);
    const keyBytes = parseKey(key, { format: keyFormat });
    const result = new Uint8Array(inputBytes.length);
    
    for (let i = 0; i < inputBytes.length; i++) {
      result[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return formatOutput(result, outputFormat);
  } catch (error) {
    throw new Error(`XOR operation failed: ${error.message}`);
  }
}

// Main unified crypto function
export async function cryptoTransform(input, params = {}) {
  const { algorithm = 'AES', ...otherParams } = params;
  
  switch (algorithm.toUpperCase()) {
    case 'AES':
    case 'AES-GCM':
    case 'AES-CBC':
    case 'AES-CTR':
      return await aesTransform(input, {
        ...otherParams,
        mode: algorithm.includes('-') ? algorithm.split('-')[1] : otherParams.mode
      });
      
    case 'DES':
      return await desTransform(input, { ...otherParams, mode: 'DES' });
      
    case '3DES':
    case 'TRIPLEDES':
      return await desTransform(input, { ...otherParams, mode: '3DES' });
      
    case 'BLOWFISH':
      return await blowfishTransform(input, otherParams);
      
    case 'RC4':
      return await rc4Transform(input, otherParams);
      
    case 'RSA':
      return await rsaTransform(input, otherParams);
      
    case 'XOR':
      return xorTransform(input, otherParams);
      
    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}