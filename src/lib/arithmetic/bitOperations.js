// Bitwise and Arithmetic Operations

export function xorBitwise(input, key = '00', keyType = 'hex', outputFormat = 'hex') {
  
  try {
    const inputBytes = new TextEncoder().encode(input);
    let keyBytes;
    
    if (keyType === 'hex') {
      if (key.length % 2 !== 0) {
        throw new Error('Hex key must have even length');
      }
      keyBytes = new Uint8Array(
        key.match(/.{2}/g).map(byte => parseInt(byte, 16))
      );
    } else {
      keyBytes = new TextEncoder().encode(key);
    }
    
    if (keyBytes.length === 0) {
      throw new Error('Key cannot be empty');
    }
    
    const result = new Uint8Array(inputBytes.length);
    for (let i = 0; i < inputBytes.length; i++) {
      result[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    switch (outputFormat) {
      case 'hex':
        return Array.from(result)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      case 'base64':
        return btoa(String.fromCharCode(...result));
      case 'text':
        return new TextDecoder().decode(result);
      case 'binary':
        return Array.from(result)
          .map(b => b.toString(2).padStart(8, '0'))
          .join(' ');
      default:
        return Array.from(result)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
    }
  } catch (error) {
    throw new Error(`XOR error: ${error.message}`);
  }
}

export function andBitwise(input, key = 'FF', keyType = 'hex', outputFormat = 'hex') {
  
  try {
    const inputBytes = new TextEncoder().encode(input);
    let keyBytes;
    
    if (keyType === 'hex') {
      keyBytes = new Uint8Array(
        key.match(/.{2}/g).map(byte => parseInt(byte, 16))
      );
    } else {
      keyBytes = new TextEncoder().encode(key);
    }
    
    const result = new Uint8Array(inputBytes.length);
    for (let i = 0; i < inputBytes.length; i++) {
      result[i] = inputBytes[i] & keyBytes[i % keyBytes.length];
    }
    
    return formatOutput(result, outputFormat);
  } catch (error) {
    throw new Error(`AND error: ${error.message}`);
  }
}

export function orBitwise(input, key = '00', keyType = 'hex', outputFormat = 'hex') {
  
  try {
    const inputBytes = new TextEncoder().encode(input);
    let keyBytes;
    
    if (keyType === 'hex') {
      keyBytes = new Uint8Array(
        key.match(/.{2}/g).map(byte => parseInt(byte, 16))
      );
    } else {
      keyBytes = new TextEncoder().encode(key);
    }
    
    const result = new Uint8Array(inputBytes.length);
    for (let i = 0; i < inputBytes.length; i++) {
      result[i] = inputBytes[i] | keyBytes[i % keyBytes.length];
    }
    
    return formatOutput(result, outputFormat);
  } catch (error) {
    throw new Error(`OR error: ${error.message}`);
  }
}

export function notBitwise(input, outputFormat = 'hex') {
  
  try {
    const inputBytes = new TextEncoder().encode(input);
    const result = new Uint8Array(inputBytes.length);
    
    for (let i = 0; i < inputBytes.length; i++) {
      result[i] = ~inputBytes[i] & 0xFF;
    }
    
    return formatOutput(result, outputFormat);
  } catch (error) {
    throw new Error(`NOT error: ${error.message}`);
  }
}

export function shiftLeft(input, shifts = 1, outputFormat = 'hex') {
  
  try {
    const inputBytes = new TextEncoder().encode(input);
    const result = new Uint8Array(inputBytes.length);
    
    for (let i = 0; i < inputBytes.length; i++) {
      result[i] = (inputBytes[i] << shifts) & 0xFF;
    }
    
    return formatOutput(result, outputFormat);
  } catch (error) {
    throw new Error(`Shift left error: ${error.message}`);
  }
}

export function shiftRight(input, shifts = 1, outputFormat = 'hex') {
  
  try {
    const inputBytes = new TextEncoder().encode(input);
    const result = new Uint8Array(inputBytes.length);
    
    for (let i = 0; i < inputBytes.length; i++) {
      result[i] = inputBytes[i] >> shifts;
    }
    
    return formatOutput(result, outputFormat);
  } catch (error) {
    throw new Error(`Shift right error: ${error.message}`);
  }
}

export function rotateLeft(input, shifts = 1, outputFormat = 'hex') {
  
  try {
    const inputBytes = new TextEncoder().encode(input);
    const result = new Uint8Array(inputBytes.length);
    
    for (let i = 0; i < inputBytes.length; i++) {
      const byte = inputBytes[i];
      result[i] = ((byte << shifts) | (byte >> (8 - shifts))) & 0xFF;
    }
    
    return formatOutput(result, outputFormat);
  } catch (error) {
    throw new Error(`Rotate left error: ${error.message}`);
  }
}

export function rotateRight(input, shifts = 1, outputFormat = 'hex') {
  
  try {
    const inputBytes = new TextEncoder().encode(input);
    const result = new Uint8Array(inputBytes.length);
    
    for (let i = 0; i < inputBytes.length; i++) {
      const byte = inputBytes[i];
      result[i] = ((byte >> shifts) | (byte << (8 - shifts))) & 0xFF;
    }
    
    return formatOutput(result, outputFormat);
  } catch (error) {
    throw new Error(`Rotate right error: ${error.message}`);
  }
}

export function xorBruteForce(input, maxKeyLength = 4, outputFormat = 'text', minPrintable = 0.8) {
  
  try {
    const inputBytes = new TextEncoder().encode(input);
    const results = [];
    
    for (let keyLength = 1; keyLength <= maxKeyLength; keyLength++) {
      const maxKey = Math.pow(256, keyLength);
      
      for (let keyValue = 0; keyValue < Math.min(maxKey, 65536); keyValue++) {
        const keyBytes = [];
        let tempKey = keyValue;
        
        for (let i = 0; i < keyLength; i++) {
          keyBytes.unshift(tempKey % 256);
          tempKey = Math.floor(tempKey / 256);
        }
        
        const result = new Uint8Array(inputBytes.length);
        for (let i = 0; i < inputBytes.length; i++) {
          result[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
        }
        
        // Check if result is printable
        let printableCount = 0;
        for (let i = 0; i < result.length; i++) {
          if (result[i] >= 32 && result[i] <= 126) {
            printableCount++;
          }
        }
        
        const printableRatio = printableCount / result.length;
        
        if (printableRatio >= minPrintable) {
          const keyHex = keyBytes.map(b => b.toString(16).padStart(2, '0')).join('');
          const text = new TextDecoder().decode(result);
          
          results.push({
            key: keyHex,
            keyLength: keyLength,
            text: text,
            printableRatio: printableRatio
          });
        }
      }
    }
    
    if (outputFormat === 'detailed') {
      return JSON.stringify(results, null, 2);
    } else {
      return results
        .sort((a, b) => b.printableRatio - a.printableRatio)
        .slice(0, 10)
        .map(r => `Key: ${r.key} -> ${r.text}`)
        .join('\n');
    }
  } catch (error) {
    throw new Error(`XOR brute force error: ${error.message}`);
  }
}

function formatOutput(bytes, format) {
  switch (format) {
    case 'base64':
      return btoa(String.fromCharCode(...bytes));
    case 'text':
      return new TextDecoder().decode(bytes);
    case 'binary':
      return Array.from(bytes)
        .map(b => b.toString(2).padStart(8, '0'))
        .join(' ');
    default:
      return Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
  }
}