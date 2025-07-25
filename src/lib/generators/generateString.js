export function generateString(input, length = 10, charset = 'alphanumeric', customCharset = '', seed = '', format = 'plain') {
  
  if (length <= 0) {
    throw new Error('Length must be positive');
  }
  
  if (length > 10000) {
    throw new Error('Length too large (max 10000)');
  }
  
  try {
    let chars = '';
    
    // Define character sets
    const charsets = {
      lowercase: 'abcdefghijklmnopqrstuvwxyz',
      uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      letters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
      digits: '0123456789',
      alphanumeric: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
      ascii_printable: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?`~',
      hex: '0123456789abcdef',
      hex_upper: '0123456789ABCDEF',
      binary: '01',
      octal: '01234567',
      base64: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      base64url: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_',
      safe_filename: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_',
      password: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*',
      uuid: '0123456789abcdef-',
      custom: customCharset
    };
    
    chars = charsets[charset] || charsets.alphanumeric;
    
    if (!chars) {
      throw new Error(`Invalid charset: ${charset}`);
    }
    
    // Initialize random number generator
    let random;
    if (seed !== null) {
      // Simple seeded random (not cryptographically secure)
      let seedValue = typeof seed === 'string' ? hashString(seed) : seed;
      random = () => {
        seedValue = (seedValue * 9301 + 49297) % 233280;
        return seedValue / 233280;
      };
    } else {
      // Use crypto.getRandomValues for better randomness
      const array = new Uint32Array(1);
      random = () => {
        crypto.getRandomValues(array);
        return array[0] / (0xffffffff + 1);
      };
    }
    
    // Generate string
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(random() * chars.length);
      result += chars[randomIndex];
    }
    
    // Apply formatting
    switch (format) {
      case 'plain':
        return result;
      case 'quoted':
        return `"${result}"`;
      case 'hex':
        return Array.from(result)
          .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
          .join('');
      case 'base64':
        return btoa(result);
      case 'uri':
        return encodeURIComponent(result);
      case 'json':
        return JSON.stringify(result);
      case 'c_string':
        return `"${result.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      case 'python_string':
        return `'${result.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
      case 'array':
        return '[' + Array.from(result).map(c => `'${c}'`).join(', ') + ']';
      case 'bytes':
        return '[' + Array.from(result).map(c => c.charCodeAt(0)).join(', ') + ']';
      default:
        return result;
    }
  } catch (error) {
    throw new Error(`String generation error: ${error.message}`);
  }
};

// Simple string hash function for seeding
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function generatePassword(input, length = 12, includeUppercase = true, includeLowercase = true, includeNumbers = true, includeSymbols = true, excludeSimilar = false, excludeAmbiguous = false, customSymbols = '!@#$%^&*()_+-=[]{}|;:,.<>?') {
  
  try {
    let charset = '';
    
    if (includeLowercase) {
      charset += excludeSimilar ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    }
    if (includeUppercase) {
      charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (includeNumbers) {
      charset += excludeSimilar ? '23456789' : '0123456789';
    }
    if (includeSymbols) {
      let symbols = customSymbols;
      if (excludeAmbiguous) {
        symbols = symbols.replace(/[{}[\]()\/\\'"~,;.<>]/g, '');
      }
      charset += symbols;
    }
    
    if (!charset) {
      throw new Error('No character types selected');
    }
    
    const password = generateString('', length, 'custom', charset, '', 'plain');
    
    // Validate minimum requirements
    const hasLower = includeLowercase ? /[a-z]/.test(password) : true;
    const hasUpper = includeUppercase ? /[A-Z]/.test(password) : true;
    const hasNumber = includeNumbers ? /[0-9]/.test(password) : true;
    const hasSymbol = includeSymbols ? new RegExp(`[${customSymbols.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`).test(password) : true;
    
    if (!hasLower || !hasUpper || !hasNumber || !hasSymbol) {
      // Regenerate if requirements not met (simple approach)
      return generatePassword(input, length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar, excludeAmbiguous, customSymbols);
    }
    
    return password;
  } catch (error) {
    throw new Error(`Password generation error: ${error.message}`);
  }
};

