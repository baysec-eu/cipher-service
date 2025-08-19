// Parameter definitions for crypto operations
// This provides detailed metadata for UI generation and validation

export const parameterDefinitions = {
  // Common crypto parameters
  key: {
    type: 'string',
    label: 'Encryption Key',
    description: 'The encryption/decryption key',
    placeholder: 'Enter key or passphrase',
    validation: {
      required: true,
      minLength: 1
    }
  },
  
  iv: {
    type: 'string',
    label: 'Initialization Vector (IV)',
    description: 'IV for block cipher modes (auto-generated if empty)',
    placeholder: 'Leave empty for auto-generation',
    validation: {
      required: false,
      pattern: /^[0-9a-fA-F]*$/,
      message: 'IV must be hexadecimal'
    }
  },
  
  mode: {
    type: 'select',
    label: 'Encryption Mode',
    description: 'Block cipher mode of operation',
    options: [
      { value: 'GCM', label: 'GCM (Authenticated)', recommended: true },
      { value: 'CBC', label: 'CBC (Cipher Block Chaining)' },
      { value: 'CTR', label: 'CTR (Counter)' },
      { value: 'ECB', label: 'ECB (Not recommended)', warning: true }
    ],
    default: 'GCM'
  },
  
  keyFormat: {
    type: 'select',
    label: 'Key Format',
    description: 'Format of the encryption key',
    options: [
      { value: 'auto', label: 'Auto-detect' },
      { value: 'text', label: 'Text/Passphrase' },
      { value: 'hex', label: 'Hexadecimal' },
      { value: 'base64', label: 'Base64' }
    ],
    default: 'auto'
  },
  
  keyDerivation: {
    type: 'select',
    label: 'Key Derivation',
    description: 'Derive key from password using KDF',
    options: [
      { value: 'none', label: 'None (use key directly)' },
      { value: 'pbkdf2', label: 'PBKDF2 (recommended)' },
      { value: 'hkdf', label: 'HKDF' },
      { value: 'scrypt', label: 'scrypt (memory-hard)' }
    ],
    default: 'none',
    showIf: { keyFormat: 'text' }
  },
  
  salt: {
    type: 'string',
    label: 'Salt',
    description: 'Salt for key derivation (auto-generated if empty)',
    placeholder: 'Leave empty for random salt',
    showIf: { keyDerivation: ['pbkdf2', 'hkdf', 'scrypt'] }
  },
  
  iterations: {
    type: 'number',
    label: 'Iterations',
    description: 'Number of iterations for key derivation',
    default: 100000,
    min: 1000,
    max: 10000000,
    showIf: { keyDerivation: 'pbkdf2' }
  },
  
  outputFormat: {
    type: 'select',
    label: 'Output Format',
    description: 'Format of the encrypted output',
    options: [
      { value: 'base64', label: 'Base64 (default)' },
      { value: 'hex', label: 'Hexadecimal' },
      { value: 'raw', label: 'Raw bytes' }
    ],
    default: 'base64'
  },
  
  associatedData: {
    type: 'string',
    label: 'Associated Data',
    description: 'Additional authenticated data (GCM mode only)',
    placeholder: 'Optional authenticated data',
    showIf: { mode: 'GCM' }
  },
  
  // Hash parameters
  rounds: {
    type: 'number',
    label: 'Cost Factor',
    description: 'Number of rounds (2^n iterations)',
    default: 10,
    min: 4,
    max: 31
  },
  
  // Scrypt parameters
  N: {
    type: 'number',
    label: 'CPU/Memory Cost (N)',
    description: 'Must be power of 2',
    default: 16384,
    validation: {
      powerOfTwo: true
    }
  },
  
  r: {
    type: 'number',
    label: 'Block Size (r)',
    description: 'Block size parameter',
    default: 8,
    min: 1,
    max: 32
  },
  
  p: {
    type: 'number',
    label: 'Parallelization (p)',
    description: 'Parallelization parameter',
    default: 1,
    min: 1,
    max: 16
  },
  
  // Argon2 parameters
  memory: {
    type: 'number',
    label: 'Memory Cost (KB)',
    description: 'Memory usage in kilobytes',
    default: 4096,
    min: 8,
    max: 4194304
  },
  
  parallelism: {
    type: 'number',
    label: 'Parallelism',
    description: 'Number of parallel threads',
    default: 1,
    min: 1,
    max: 255
  },
  
  // RSA parameters
  keySize: {
    type: 'select',
    label: 'Key Size',
    description: 'RSA key size in bits',
    options: [
      { value: 1024, label: '1024 bits (legacy)' },
      { value: 2048, label: '2048 bits (recommended)' },
      { value: 3072, label: '3072 bits' },
      { value: 4096, label: '4096 bits (high security)' }
    ],
    default: 2048
  },
  
  // Kerberos parameters
  keyType: {
    type: 'select',
    label: 'Encryption Type',
    description: 'Kerberos encryption type',
    options: [
      { value: 'RC4', label: 'RC4-HMAC (etype 23)' },
      { value: 'AES128', label: 'AES128-CTS-HMAC-SHA1-96 (etype 17)' },
      { value: 'AES256', label: 'AES256-CTS-HMAC-SHA1-96 (etype 18)' }
    ],
    default: 'RC4'
  },
  
  keyUsage: {
    type: 'number',
    label: 'Key Usage Number',
    description: 'Kerberos key usage number',
    default: 0,
    min: 0,
    max: 255
  },
  
  // String generation parameters
  length: {
    type: 'number',
    label: 'Length',
    description: 'Length of string to generate',
    default: 100,
    min: 1,
    max: 100000
  },
  
  charset: {
    type: 'select',
    label: 'Character Set',
    description: 'Type of characters to generate',
    options: [
      { value: 'alphanumeric', label: 'Alphanumeric (a-z, A-Z, 0-9)' },
      { value: 'metasploit', label: 'Metasploit Pattern (Aa0Aa1...)' },
      { value: 'pattern', label: 'Metasploit Pattern (alias)' },
      { value: 'lowercase', label: 'Lowercase (a-z)' },
      { value: 'uppercase', label: 'Uppercase (A-Z)' },
      { value: 'letters', label: 'Letters (a-z, A-Z)' },
      { value: 'digits', label: 'Digits (0-9)' },
      { value: 'hex', label: 'Hex (0-9, a-f)' },
      { value: 'hex_upper', label: 'Hex Uppercase (0-9, A-F)' },
      { value: 'binary', label: 'Binary (0-1)' },
      { value: 'octal', label: 'Octal (0-7)' },
      { value: 'base64', label: 'Base64 Characters' },
      { value: 'base64url', label: 'Base64 URL Safe' },
      { value: 'ascii_printable', label: 'ASCII Printable' },
      { value: 'symbols', label: 'Symbols Only' },
      { value: 'safe_filename', label: 'Filename Safe' },
      { value: 'uuid', label: 'UUID Characters' },
      { value: 'custom', label: 'Custom Characters' }
    ],
    default: 'alphanumeric'
  },
  
  customCharset: {
    type: 'string',
    label: 'Custom Characters',
    description: 'Custom character set to use',
    placeholder: 'Enter custom characters',
    showIf: { charset: 'custom' }
  },
  
  seed: {
    type: 'string',
    label: 'Seed',
    description: 'Seed for reproducible generation (empty for random)',
    placeholder: 'Leave empty for random'
  },
  
  format: {
    type: 'select',
    label: 'Output Format',
    description: 'Format of the generated string',
    options: [
      { value: 'plain', label: 'Plain Text' },
      { value: 'quoted', label: 'Quoted String' },
      { value: 'hex', label: 'Hex Encoded' },
      { value: 'base64', label: 'Base64 Encoded' },
      { value: 'uri', label: 'URI Encoded' },
      { value: 'json', label: 'JSON String' },
      { value: 'c_string', label: 'C String' },
      { value: 'python_string', label: 'Python String' },
      { value: 'array', label: 'Character Array' },
      { value: 'bytes', label: 'Byte Array' }
    ],
    default: 'plain'
  },
  
  searchString: {
    type: 'string',
    label: 'Search Pattern',
    description: 'Pattern to find in Metasploit pattern (min 3 chars)',
    placeholder: 'e.g., Aa9 or 41613941'
  }
};

// Operation-specific parameter configurations
export const operationParameters = {
  aes_encrypt: {
    parameters: ['key', 'iv', 'mode', 'keyFormat', 'keyDerivation', 'salt', 'iterations', 'associatedData', 'outputFormat'],
    defaults: {
      mode: 'GCM',
      keyFormat: 'auto',
      outputFormat: 'base64'
    }
  },
  
  aes_decrypt: {
    parameters: ['key', 'iv', 'mode', 'keyFormat', 'keyDerivation', 'salt', 'iterations', 'associatedData', 'outputFormat'],
    defaults: {
      mode: 'GCM',
      keyFormat: 'auto',
      outputFormat: 'text'
    }
  },
  
  rsa_generate: {
    parameters: ['keySize'],
    defaults: {
      keySize: 2048
    }
  },
  
  bcrypt_hash: {
    parameters: ['rounds'],
    defaults: {
      rounds: 10
    }
  },
  
  scrypt_hash: {
    parameters: ['salt', 'N', 'r', 'p'],
    defaults: {
      N: 16384,
      r: 8,
      p: 1
    }
  },
  
  argon2_hash: {
    parameters: ['salt', 'iterations', 'memory', 'parallelism'],
    defaults: {
      iterations: 3,
      memory: 4096,
      parallelism: 1
    }
  },
  
  kerberos_encrypt: {
    parameters: ['key', 'keyType', 'keyUsage'],
    defaults: {
      keyType: 'RC4',
      keyUsage: 0
    }
  },
  
  generate_string: {
    parameters: ['length', 'charset', 'customCharset', 'seed', 'format'],
    defaults: {
      length: 100,
      charset: 'alphanumeric',
      format: 'plain'
    }
  },
  
  find_pattern_offset: {
    parameters: ['searchString'],
    defaults: {}
  }
};

// Helper function to get parameter definitions for an operation
export function getOperationParameters(operationId) {
  const config = operationParameters[operationId];
  if (!config) return [];
  
  return config.parameters.map(paramId => ({
    id: paramId,
    ...parameterDefinitions[paramId],
    value: config.defaults[paramId]
  }));
}

// Validation helper
export function validateParameter(paramId, value) {
  const def = parameterDefinitions[paramId];
  if (!def) return { valid: true };
  
  const validation = def.validation || {};
  
  if (validation.required && !value) {
    return { valid: false, message: `${def.label} is required` };
  }
  
  if (validation.minLength && value.length < validation.minLength) {
    return { valid: false, message: `${def.label} must be at least ${validation.minLength} characters` };
  }
  
  if (validation.pattern && !validation.pattern.test(value)) {
    return { valid: false, message: validation.message || `Invalid format for ${def.label}` };
  }
  
  if (validation.powerOfTwo && value && (value & (value - 1)) !== 0) {
    return { valid: false, message: `${def.label} must be a power of 2` };
  }
  
  if (def.type === 'number') {
    if (def.min !== undefined && value < def.min) {
      return { valid: false, message: `${def.label} must be at least ${def.min}` };
    }
    if (def.max !== undefined && value > def.max) {
      return { valid: false, message: `${def.label} must be at most ${def.max}` };
    }
  }
  
  return { valid: true };
}