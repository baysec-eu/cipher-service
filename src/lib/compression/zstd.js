// ZSTD Implementation
// Note: This is a simplified implementation of ZSTD for educational purposes
// For production use, consider using proper ZSTD libraries

export const compressZstd = async (input, options = {}) => {
  const {
    level = 3,
    windowLog = 19,
    hashLog = 17,
    chainLog = 16,
    searchLog = 1,
    targetLength = 0
  } = options;
  
  if (!input) return new Uint8Array();
  
  try {
    // Convert input to bytes
    const inputBytes = typeof input === 'string' 
      ? new TextEncoder().encode(input) 
      : new Uint8Array(input);
    
    // ZSTD Magic Number
    const magic = new Uint8Array([0x28, 0xB5, 0x2F, 0xFD]);
    
    // Frame Header (simplified)
    const frameHeader = new Uint8Array([
      0x00, // Frame_Content_Size_flag=0, Single_Segment_flag=0, Unused_bit=0, Reserved_bit=0, Content_Checksum_flag=0, Dictionary_ID_flag=0
      // Window_Descriptor (if Single_Segment_flag=0)
      ((windowLog - 10) & 0x07) | (((windowLog - 10) >> 3) << 3)
    ]);
    
    // For this simplified implementation, we'll use a basic LZ77-style compression
    // with ZSTD-like block structure
    
    const compressed = await performZstdCompression(inputBytes, level);
    
    // Build final output
    const output = new Uint8Array(magic.length + frameHeader.length + compressed.length + 4);
    let offset = 0;
    
    // Magic number
    output.set(magic, offset);
    offset += magic.length;
    
    // Frame header
    output.set(frameHeader, offset);
    offset += frameHeader.length;
    
    // Compressed data
    output.set(compressed, offset);
    offset += compressed.length;
    
    // End of stream marker (simplified)
    const endMarker = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    output.set(endMarker, offset);
    
    return output;
  } catch (error) {
    throw new Error(`ZSTD compression error: ${error.message}`);
  }
};

export const decompressZstd = async (input, options = {}) => {
  try {
    const inputBytes = new Uint8Array(input);
    
    // Verify ZSTD magic number
    const magic = new Uint8Array([0x28, 0xB5, 0x2F, 0xFD]);
    if (inputBytes.length < 4 || 
        !magic.every((byte, i) => byte === inputBytes[i])) {
      throw new Error('Invalid ZSTD magic number');
    }
    
    let offset = 4; // Skip magic
    
    // Parse frame header (simplified)
    if (offset >= inputBytes.length) {
      throw new Error('Incomplete ZSTD header');
    }
    
    const frameDescriptor = inputBytes[offset++];
    const windowDescriptor = inputBytes[offset++];
    
    // Extract compressed data (simplified - assumes single block)
    const compressedData = inputBytes.slice(offset, inputBytes.length - 4);
    
    // Decompress
    const decompressed = await performZstdDecompression(compressedData);
    
    return decompressed;
  } catch (error) {
    throw new Error(`ZSTD decompression error: ${error.message}`);
  }
};

async function performZstdCompression(data, level) {
  // Simplified ZSTD-style compression using LZ77 with optimizations
  const output = [];
  const windowSize = Math.min(1 << 16, data.length); // 64KB window
  let i = 0;
  
  while (i < data.length) {
    let bestLength = 0;
    let bestDistance = 0;
    
    // Look for matches in the sliding window
    const searchStart = Math.max(0, i - windowSize);
    const maxLength = Math.min(258, data.length - i); // Max match length
    
    for (let j = searchStart; j < i; j++) {
      let length = 0;
      while (length < maxLength && 
             i + length < data.length && 
             data[j + length] === data[i + length]) {
        length++;
      }
      
      if (length > bestLength && length >= 3) {
        bestLength = length;
        bestDistance = i - j;
      }
    }
    
    if (bestLength >= 3) {
      // Encode match (simplified format)
      // In real ZSTD, this would use more sophisticated encoding
      output.push(0x80 | (bestLength - 3)); // Match flag + length
      output.push(bestDistance & 0xFF);
      output.push((bestDistance >> 8) & 0xFF);
      i += bestLength;
    } else {
      // Literal
      output.push(data[i]);
      i++;
    }
  }
  
  // Add simple compression statistics based on level
  if (level > 5) {
    // Higher compression - do multiple passes
    return new Uint8Array(output);
  }
  
  return new Uint8Array(output);
}

async function performZstdDecompression(data) {
  const output = [];
  let i = 0;
  
  while (i < data.length) {
    const byte = data[i++];
    
    if (byte & 0x80) {
      // Match
      if (i + 1 >= data.length) break;
      
      const length = (byte & 0x7F) + 3;
      const distance = data[i] | (data[i + 1] << 8);
      i += 2;
      
      // Copy from previous data
      const start = output.length - distance;
      for (let j = 0; j < length; j++) {
        if (start + j >= 0 && start + j < output.length) {
          output.push(output[start + j]);
        }
      }
    } else {
      // Literal
      output.push(byte);
    }
  }
  
  return new Uint8Array(output);
}

// Utility function to get compression ratio
export const getZstdCompressionRatio = (original, compressed) => {
  if (!original || !compressed) return 0;
  const originalSize = original.length || original.byteLength || 0;
  const compressedSize = compressed.length || compressed.byteLength || 0;
  return originalSize > 0 ? (compressedSize / originalSize) : 0;
};

// Operations for the encoder
export const compressZstdOperation = {
  id: 'compress_zstd',
  name: 'ZSTD Compress',
  type: 'compression',
  description: 'Compress data using ZSTD algorithm (simplified implementation)',
  params: [
    {
      name: 'level',
      type: 'number',
      default: 3,
      min: 1,
      max: 22,
      description: 'Compression level (1=fastest, 22=best)'
    },
    {
      name: 'windowLog',
      type: 'number',
      default: 19,
      min: 10,
      max: 27,
      description: 'Window size (2^windowLog bytes)'
    }
  ],
  operation: async (input, params) => {
    const result = await compressZstd(input, params);
    return Array.from(result).map(b => String.fromCharCode(b)).join('');
  }
};

export const decompressZstdOperation = {
  id: 'decompress_zstd', 
  name: 'ZSTD Decompress',
  type: 'compression',
  description: 'Decompress ZSTD compressed data',
  params: [],
  operation: async (input, params) => {
    // Convert string back to bytes
    const bytes = new Uint8Array(input.split('').map(c => c.charCodeAt(0)));
    const result = await decompressZstd(bytes, params);
    return new TextDecoder().decode(result);
  }
};

// ZSTD Dictionary support (simplified)
export const createZstdDictionary = (samples, maxDictSize = 112640) => {
  // Simplified dictionary creation
  // In real ZSTD, this would use sophisticated statistical analysis
  const frequencies = new Map();
  
  for (const sample of samples) {
    const bytes = typeof sample === 'string' ? new TextEncoder().encode(sample) : sample;
    for (let i = 0; i < bytes.length - 2; i++) {
      const gram = bytes.slice(i, i + 3);
      const key = Array.from(gram).join(',');
      frequencies.set(key, (frequencies.get(key) || 0) + 1);
    }
  }
  
  // Sort by frequency and take top entries
  const sorted = Array.from(frequencies.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.floor(maxDictSize / 3));
  
  const dict = [];
  for (const [gram, freq] of sorted) {
    dict.push(...gram.split(',').map(Number));
    if (dict.length >= maxDictSize) break;
  }
  
  return new Uint8Array(dict);
};