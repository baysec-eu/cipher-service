// Bitwise operations for data manipulation and cipher operations
// Essential for XOR ciphers, data masking, and cryptographic operations

// XOR two data inputs (bytes, hex strings, or text)
export function bitwiseXOR(input1, input2, format = 'auto') {
  try {
    const bytes1 = parseInput(input1, format);
    const bytes2 = parseInput(input2, format);
    
    // Handle different length inputs
    const maxLength = Math.max(bytes1.length, bytes2.length);
    const result = new Uint8Array(maxLength);
    
    for (let i = 0; i < maxLength; i++) {
      const byte1 = bytes1[i % bytes1.length] || 0;
      const byte2 = bytes2[i % bytes2.length] || 0;
      result[i] = byte1 ^ byte2;
    }
    
    return {
      result: result,
      hex: Array.from(result).map(b => b.toString(16).padStart(2, '0')).join(''),
      text: new TextDecoder('utf-8', { fatal: false }).decode(result),
      bytes: Array.from(result),
      length: result.length
    };
  } catch (error) {
    return { error: `XOR operation failed: ${error.message}` };
  }
}

// AND two data inputs
export function bitwiseAND(input1, input2, format = 'auto') {
  try {
    const bytes1 = parseInput(input1, format);
    const bytes2 = parseInput(input2, format);
    
    const maxLength = Math.max(bytes1.length, bytes2.length);
    const result = new Uint8Array(maxLength);
    
    for (let i = 0; i < maxLength; i++) {
      const byte1 = bytes1[i % bytes1.length] || 0;
      const byte2 = bytes2[i % bytes2.length] || 0;
      result[i] = byte1 & byte2;
    }
    
    return {
      result: result,
      hex: Array.from(result).map(b => b.toString(16).padStart(2, '0')).join(''),
      text: new TextDecoder('utf-8', { fatal: false }).decode(result),
      bytes: Array.from(result),
      length: result.length
    };
  } catch (error) {
    return { error: `AND operation failed: ${error.message}` };
  }
}

// OR two data inputs
export function bitwiseOR(input1, input2, format = 'auto') {
  try {
    const bytes1 = parseInput(input1, format);
    const bytes2 = parseInput(input2, format);
    
    const maxLength = Math.max(bytes1.length, bytes2.length);
    const result = new Uint8Array(maxLength);
    
    for (let i = 0; i < maxLength; i++) {
      const byte1 = bytes1[i % bytes1.length] || 0;
      const byte2 = bytes2[i % bytes2.length] || 0;
      result[i] = byte1 | byte2;
    }
    
    return {
      result: result,
      hex: Array.from(result).map(b => b.toString(16).padStart(2, '0')).join(''),
      text: new TextDecoder('utf-8', { fatal: false }).decode(result),
      bytes: Array.from(result),
      length: result.length
    };
  } catch (error) {
    return { error: `OR operation failed: ${error.message}` };
  }
}

// NOT operation (bitwise complement)
export function bitwiseNOT(input, format = 'auto') {
  try {
    const bytes = parseInput(input, format);
    const result = new Uint8Array(bytes.length);
    
    for (let i = 0; i < bytes.length; i++) {
      result[i] = ~bytes[i] & 0xFF; // Keep only 8 bits
    }
    
    return {
      result: result,
      hex: Array.from(result).map(b => b.toString(16).padStart(2, '0')).join(''),
      text: new TextDecoder('utf-8', { fatal: false }).decode(result),
      bytes: Array.from(result),
      length: result.length
    };
  } catch (error) {
    return { error: `NOT operation failed: ${error.message}` };
  }
}

// NAND operation (NOT AND)
export function bitwiseNAND(input1, input2, format = 'auto') {
  const andResult = bitwiseAND(input1, input2, format);
  if (andResult.error) return andResult;
  
  return bitwiseNOT(andResult.result, 'bytes');
}

// NOR operation (NOT OR)
export function bitwiseNOR(input1, input2, format = 'auto') {
  const orResult = bitwiseOR(input1, input2, format);
  if (orResult.error) return orResult;
  
  return bitwiseNOT(orResult.result, 'bytes');
}

// XOR with repeating key (classic cipher operation)
export function xorWithKey(input, key, format = 'auto') {
  try {
    const inputBytes = parseInput(input, format);
    const keyBytes = parseInput(key, format);
    
    if (keyBytes.length === 0) {
      throw new Error('Key cannot be empty');
    }
    
    const result = new Uint8Array(inputBytes.length);
    
    for (let i = 0; i < inputBytes.length; i++) {
      result[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
    }
    
    return {
      result: result,
      hex: Array.from(result).map(b => b.toString(16).padStart(2, '0')).join(''),
      text: new TextDecoder('utf-8', { fatal: false }).decode(result),
      bytes: Array.from(result),
      length: result.length,
      key: key,
      keyLength: keyBytes.length
    };
  } catch (error) {
    return { error: `XOR with key failed: ${error.message}` };
  }
}

// Bit shift operations
export function bitShiftLeft(input, positions, format = 'auto') {
  try {
    const bytes = parseInput(input, format);
    const result = new Uint8Array(bytes.length);
    
    for (let i = 0; i < bytes.length; i++) {
      result[i] = (bytes[i] << positions) & 0xFF;
    }
    
    return {
      result: result,
      hex: Array.from(result).map(b => b.toString(16).padStart(2, '0')).join(''),
      text: new TextDecoder('utf-8', { fatal: false }).decode(result),
      bytes: Array.from(result),
      positions: positions
    };
  } catch (error) {
    return { error: `Left shift failed: ${error.message}` };
  }
}

export function bitShiftRight(input, positions, format = 'auto') {
  try {
    const bytes = parseInput(input, format);
    const result = new Uint8Array(bytes.length);
    
    for (let i = 0; i < bytes.length; i++) {
      result[i] = bytes[i] >> positions;
    }
    
    return {
      result: result,
      hex: Array.from(result).map(b => b.toString(16).padStart(2, '0')).join(''),
      text: new TextDecoder('utf-8', { fatal: false }).decode(result),
      bytes: Array.from(result),
      positions: positions
    };
  } catch (error) {
    return { error: `Right shift failed: ${error.message}` };
  }
}

// Rotate bits (circular shift)
export function rotateLeft(input, positions, format = 'auto') {
  try {
    const bytes = parseInput(input, format);
    const result = new Uint8Array(bytes.length);
    const pos = positions % 8; // Only rotate within byte boundary
    
    for (let i = 0; i < bytes.length; i++) {
      result[i] = ((bytes[i] << pos) | (bytes[i] >> (8 - pos))) & 0xFF;
    }
    
    return {
      result: result,
      hex: Array.from(result).map(b => b.toString(16).padStart(2, '0')).join(''),
      text: new TextDecoder('utf-8', { fatal: false }).decode(result),
      bytes: Array.from(result),
      positions: positions
    };
  } catch (error) {
    return { error: `Rotate left failed: ${error.message}` };
  }
}

export function rotateRight(input, positions, format = 'auto') {
  try {
    const bytes = parseInput(input, format);
    const result = new Uint8Array(bytes.length);
    const pos = positions % 8; // Only rotate within byte boundary
    
    for (let i = 0; i < bytes.length; i++) {
      result[i] = ((bytes[i] >> pos) | (bytes[i] << (8 - pos))) & 0xFF;
    }
    
    return {
      result: result,
      hex: Array.from(result).map(b => b.toString(16).padStart(2, '0')).join(''),
      text: new TextDecoder('utf-8', { fatal: false }).decode(result),
      bytes: Array.from(result),
      positions: positions
    };
  } catch (error) {
    return { error: `Rotate right failed: ${error.message}` };
  }
}

// Bit manipulation utilities
export function setBit(input, bitPosition, value, format = 'auto') {
  try {
    const bytes = parseInput(input, format);
    const result = new Uint8Array(bytes);
    
    const byteIndex = Math.floor(bitPosition / 8);
    const bitIndex = bitPosition % 8;
    
    if (byteIndex >= bytes.length) {
      throw new Error('Bit position out of range');
    }
    
    if (value) {
      result[byteIndex] |= (1 << bitIndex);
    } else {
      result[byteIndex] &= ~(1 << bitIndex);
    }
    
    return {
      result: result,
      hex: Array.from(result).map(b => b.toString(16).padStart(2, '0')).join(''),
      text: new TextDecoder('utf-8', { fatal: false }).decode(result),
      bytes: Array.from(result),
      bitPosition: bitPosition,
      value: value
    };
  } catch (error) {
    return { error: `Set bit failed: ${error.message}` };
  }
}

export function getBit(input, bitPosition, format = 'auto') {
  try {
    const bytes = parseInput(input, format);
    
    const byteIndex = Math.floor(bitPosition / 8);
    const bitIndex = bitPosition % 8;
    
    if (byteIndex >= bytes.length) {
      throw new Error('Bit position out of range');
    }
    
    const bit = (bytes[byteIndex] >> bitIndex) & 1;
    
    return {
      bitPosition: bitPosition,
      value: bit,
      byteIndex: byteIndex,
      bitIndex: bitIndex,
      byte: bytes[byteIndex],
      byteHex: bytes[byteIndex].toString(16).padStart(2, '0'),
      byteBinary: bytes[byteIndex].toString(2).padStart(8, '0')
    };
  } catch (error) {
    return { error: `Get bit failed: ${error.message}` };
  }
}

// Convert between different representations
export function toBinary(input, format = 'auto') {
  try {
    const bytes = parseInput(input, format);
    const binary = Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(' ');
    
    return {
      input: typeof input === 'string' ? input : Array.from(input),
      binary: binary,
      binaryCompact: binary.replace(/ /g, ''),
      bytes: Array.from(bytes),
      length: bytes.length
    };
  } catch (error) {
    return { error: `Binary conversion failed: ${error.message}` };
  }
}

// Hamming weight (count of 1 bits)
export function hammingWeight(input, format = 'auto') {
  try {
    const bytes = parseInput(input, format);
    let totalBits = 0;
    const byteCounts = [];
    
    for (const byte of bytes) {
      let count = 0;
      let temp = byte;
      while (temp) {
        count += temp & 1;
        temp >>= 1;
      }
      byteCounts.push(count);
      totalBits += count;
    }
    
    return {
      totalOneBits: totalBits,
      totalZeroBits: (bytes.length * 8) - totalBits,
      byteCounts: byteCounts,
      density: (totalBits / (bytes.length * 8)).toFixed(4),
      bytes: Array.from(bytes)
    };
  } catch (error) {
    return { error: `Hamming weight failed: ${error.message}` };
  }
}

// Helper function to parse different input formats
function parseInput(input, format) {
  if (format === 'bytes' && input instanceof Uint8Array) {
    return input;
  }
  
  if (typeof input === 'string') {
    // Auto-detect format
    if (format === 'auto') {
      // Check if it's hex (even length, only hex chars)
      if (/^[0-9a-fA-F]+$/.test(input) && input.length % 2 === 0) {
        format = 'hex';
      } else if (/^[01\s]+$/.test(input.trim())) {
        format = 'binary';
      } else {
        format = 'text';
      }
    }
    
    switch (format) {
      case 'hex':
        if (input.length % 2 !== 0) {
          throw new Error('Hex string must have even length');
        }
        const hexBytes = [];
        for (let i = 0; i < input.length; i += 2) {
          hexBytes.push(parseInt(input.substr(i, 2), 16));
        }
        return new Uint8Array(hexBytes);
        
      case 'binary':
        const cleanBinary = input.replace(/\s/g, '');
        if (cleanBinary.length % 8 !== 0) {
          throw new Error('Binary string must be multiple of 8 bits');
        }
        const binBytes = [];
        for (let i = 0; i < cleanBinary.length; i += 8) {
          binBytes.push(parseInt(cleanBinary.substr(i, 8), 2));
        }
        return new Uint8Array(binBytes);
        
      case 'text':
      default:
        return new TextEncoder().encode(input);
    }
  }
  
  if (Array.isArray(input)) {
    return new Uint8Array(input);
  }
  
  throw new Error('Unsupported input format');
}

// Export all bitwise operations
export const bitwise = {
  // Basic operations
  XOR: bitwiseXOR,
  AND: bitwiseAND,
  OR: bitwiseOR,
  NOT: bitwiseNOT,
  NAND: bitwiseNAND,
  NOR: bitwiseNOR,
  
  // XOR cipher operations
  xorWithKey: xorWithKey,
  
  // Bit shifting
  shiftLeft: bitShiftLeft,
  shiftRight: bitShiftRight,
  rotateLeft: rotateLeft,
  rotateRight: rotateRight,
  
  // Bit manipulation
  setBit: setBit,
  getBit: getBit,
  
  // Analysis
  toBinary: toBinary,
  hammingWeight: hammingWeight
};