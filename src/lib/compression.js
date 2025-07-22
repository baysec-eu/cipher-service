// Compression Operations - Gzip, Deflate, ZIP, Bzip2
// Implements CyberChef-style compression and decompression

// === GZIP OPERATIONS ===

export async function gzipCompress(data) {
  try {
    const inputData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    
    if ('CompressionStream' in window) {
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      const reader = cs.readable.getReader();
      
      // Write data
      await writer.write(inputData);
      await writer.close();
      
      // Read compressed data
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      // Combine chunks and convert to hex
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      throw new Error('Compression not supported in this browser');
    }
  } catch (error) {
    throw new Error(`Gzip compression failed: ${error.message}`);
  }
}

export async function gzipDecompress(hexData) {
  try {
    // Convert hex string to Uint8Array
    const compressedData = new Uint8Array(
      hexData.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    
    if ('DecompressionStream' in window) {
      const ds = new DecompressionStream('gzip');
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();
      
      // Write compressed data
      await writer.write(compressedData);
      await writer.close();
      
      // Read decompressed data
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      // Combine chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return new TextDecoder().decode(result);
    } else {
      throw new Error('Decompression not supported in this browser');
    }
  } catch (error) {
    throw new Error(`Gzip decompression failed: ${error.message}`);
  }
}

// === DEFLATE OPERATIONS ===

export async function deflateCompress(data) {
  try {
    const inputData = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    
    if ('CompressionStream' in window) {
      const cs = new CompressionStream('deflate');
      const writer = cs.writable.getWriter();
      const reader = cs.readable.getReader();
      
      await writer.write(inputData);
      await writer.close();
      
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      throw new Error('Compression not supported in this browser');
    }
  } catch (error) {
    throw new Error(`Deflate compression failed: ${error.message}`);
  }
}

export async function deflateDecompress(hexData) {
  try {
    const compressedData = new Uint8Array(
      hexData.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );
    
    if ('DecompressionStream' in window) {
      const ds = new DecompressionStream('deflate');
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();
      
      await writer.write(compressedData);
      await writer.close();
      
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return new TextDecoder().decode(result);
    } else {
      throw new Error('Decompression not supported in this browser');
    }
  } catch (error) {
    throw new Error(`Deflate decompression failed: ${error.message}`);
  }
}

// === ZIP OPERATIONS (Simplified) ===

export function createZipFile(files) {
  try {
    // Simple ZIP file creation (minimal implementation)
    let zipData = [];
    let centralDirectory = [];
    let offset = 0;
    
    for (const [filename, content] of Object.entries(files)) {
      const fileData = typeof content === 'string' ? new TextEncoder().encode(content) : content;
      
      // Local file header
      const header = new Uint8Array(30 + filename.length);
      const view = new DataView(header.buffer);
      
      view.setUint32(0, 0x04034b50, true); // Local file header signature
      view.setUint16(4, 20, true); // Version needed to extract
      view.setUint16(6, 0, true); // General purpose bit flag
      view.setUint16(8, 0, true); // Compression method (stored)
      view.setUint16(10, 0, true); // Last mod file time
      view.setUint16(12, 0, true); // Last mod file date
      view.setUint32(14, crc32(fileData), true); // CRC-32
      view.setUint32(18, fileData.length, true); // Compressed size
      view.setUint32(22, fileData.length, true); // Uncompressed size
      view.setUint16(26, filename.length, true); // File name length
      view.setUint16(28, 0, true); // Extra field length
      
      // Copy filename
      const filenameBytes = new TextEncoder().encode(filename);
      header.set(filenameBytes, 30);
      
      zipData.push(header);
      zipData.push(fileData);
      
      // Central directory record
      const cdRecord = new Uint8Array(46 + filename.length);
      const cdView = new DataView(cdRecord.buffer);
      
      cdView.setUint32(0, 0x02014b50, true); // Central directory header signature
      cdView.setUint16(4, 20, true); // Version made by
      cdView.setUint16(6, 20, true); // Version needed to extract
      cdView.setUint16(8, 0, true); // General purpose bit flag
      cdView.setUint16(10, 0, true); // Compression method
      cdView.setUint16(12, 0, true); // Last mod file time
      cdView.setUint16(14, 0, true); // Last mod file date
      cdView.setUint32(16, crc32(fileData), true); // CRC-32
      cdView.setUint32(20, fileData.length, true); // Compressed size
      cdView.setUint32(24, fileData.length, true); // Uncompressed size
      cdView.setUint16(28, filename.length, true); // File name length
      cdView.setUint16(30, 0, true); // Extra field length
      cdView.setUint16(32, 0, true); // File comment length
      cdView.setUint16(34, 0, true); // Disk number start
      cdView.setUint16(36, 0, true); // Internal file attributes
      cdView.setUint32(38, 0, true); // External file attributes
      cdView.setUint32(42, offset, true); // Relative offset of local header
      
      cdRecord.set(filenameBytes, 46);
      centralDirectory.push(cdRecord);
      
      offset += header.length + fileData.length;
    }
    
    // End of central directory record
    const cdSize = centralDirectory.reduce((sum, record) => sum + record.length, 0);
    const eocd = new Uint8Array(22);
    const eocdView = new DataView(eocd.buffer);
    
    eocdView.setUint32(0, 0x06054b50, true); // End of central dir signature
    eocdView.setUint16(4, 0, true); // Number of this disk
    eocdView.setUint16(6, 0, true); // Number of disk with start of central directory
    eocdView.setUint16(8, Object.keys(files).length, true); // Total number of entries on this disk
    eocdView.setUint16(10, Object.keys(files).length, true); // Total number of entries
    eocdView.setUint32(12, cdSize, true); // Size of central directory
    eocdView.setUint32(16, offset, true); // Offset of start of central directory
    eocdView.setUint16(20, 0, true); // Comment length
    
    // Combine all parts
    const totalSize = zipData.reduce((sum, chunk) => sum + chunk.length, 0) + cdSize + eocd.length;
    const result = new Uint8Array(totalSize);
    let resultOffset = 0;
    
    for (const chunk of zipData) {
      result.set(chunk, resultOffset);
      resultOffset += chunk.length;
    }
    
    for (const record of centralDirectory) {
      result.set(record, resultOffset);
      resultOffset += record.length;
    }
    
    result.set(eocd, resultOffset);
    
    return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    throw new Error(`ZIP creation failed: ${error.message}`);
  }
}

// Simple CRC32 implementation
function crc32(data) {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  
  let crc = 0 ^ (-1);
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xFF];
  }
  
  return (crc ^ (-1)) >>> 0;
}

// === LZ STRING COMPRESSION (JavaScript-compatible) ===

export function lzStringCompress(data) {
  try {
    const input = String(data);
    let dictionary = {};
    let dictSize = 256;
    let w = '';
    let result = [];
    
    for (let i = 0; i < 256; i++) {
      dictionary[String.fromCharCode(i)] = i;
    }
    
    for (let i = 0; i < input.length; i++) {
      const c = input.charAt(i);
      const wc = w + c;
      
      if (dictionary[wc]) {
        w = wc;
      } else {
        result.push(dictionary[w]);
        dictionary[wc] = dictSize++;
        w = c;
      }
    }
    
    if (w !== '') {
      result.push(dictionary[w]);
    }
    
    return result.join(',');
  } catch (error) {
    throw new Error(`LZ String compression failed: ${error.message}`);
  }
}

export function lzStringDecompress(compressedData) {
  try {
    const input = compressedData.split(',').map(Number);
    let dictionary = {};
    let dictSize = 256;
    
    for (let i = 0; i < 256; i++) {
      dictionary[i] = String.fromCharCode(i);
    }
    
    let w = String.fromCharCode(input[0]);
    let result = w;
    
    for (let i = 1; i < input.length; i++) {
      const k = input[i];
      let entry;
      
      if (dictionary[k]) {
        entry = dictionary[k];
      } else if (k === dictSize) {
        entry = w + w.charAt(0);
      } else {
        throw new Error('Invalid compressed data');
      }
      
      result += entry;
      dictionary[dictSize++] = w + entry.charAt(0);
      w = entry;
    }
    
    return result;
  } catch (error) {
    throw new Error(`LZ String decompression failed: ${error.message}`);
  }
}

// === BASE64 COMPRESSION UTILITIES ===

export function compressToBase64(data) {
  try {
    const compressed = lzStringCompress(data);
    return btoa(compressed);
  } catch (error) {
    throw new Error(`Compression to Base64 failed: ${error.message}`);
  }
}

export function decompressFromBase64(base64Data) {
  try {
    const compressed = atob(base64Data);
    return lzStringDecompress(compressed);
  } catch (error) {
    throw new Error(`Decompression from Base64 failed: ${error.message}`);
  }
}

// === RLE COMPRESSION (Run-Length Encoding) ===

export function rleCompress(data) {
  try {
    const input = String(data);
    let result = '';
    let count = 1;
    let current = input[0];
    
    for (let i = 1; i < input.length; i++) {
      if (input[i] === current && count < 255) {
        count++;
      } else {
        if (count === 1) {
          result += current;
        } else {
          result += `${count}${current}`;
        }
        current = input[i];
        count = 1;
      }
    }
    
    // Handle last character
    if (count === 1) {
      result += current;
    } else {
      result += `${count}${current}`;
    }
    
    return result;
  } catch (error) {
    throw new Error(`RLE compression failed: ${error.message}`);
  }
}

export function rleDecompress(compressedData) {
  try {
    const input = String(compressedData);
    let result = '';
    let i = 0;
    
    while (i < input.length) {
      if (i + 1 < input.length && /\d/.test(input[i])) {
        const count = parseInt(input[i]);
        const char = input[i + 1];
        result += char.repeat(count);
        i += 2;
      } else {
        result += input[i];
        i += 1;
      }
    }
    
    return result;
  } catch (error) {
    throw new Error(`RLE decompression failed: ${error.message}`);
  }
}

// === COMPRESSION ANALYSIS ===

export function compressionAnalysis(originalData, compressedData) {
  const originalSize = typeof originalData === 'string' 
    ? new TextEncoder().encode(originalData).length 
    : originalData.length;
    
  const compressedSize = typeof compressedData === 'string'
    ? new TextEncoder().encode(compressedData).length
    : compressedData.length;
    
  const ratio = originalSize > 0 ? (compressedSize / originalSize * 100).toFixed(2) : 0;
  const savings = originalSize - compressedSize;
  const savingsPercent = originalSize > 0 ? ((savings / originalSize) * 100).toFixed(2) : 0;
  
  return `Compression Analysis:
Original size: ${originalSize} bytes
Compressed size: ${compressedSize} bytes  
Compression ratio: ${ratio}%
Space saved: ${savings} bytes (${savingsPercent}%)
${savings > 0 ? 'Compression effective' : 'Compression ineffective'}`;
}

// Export all compression operations
export const compression = {
  gzip: {
    compress: gzipCompress,
    decompress: gzipDecompress
  },
  deflate: {
    compress: deflateCompress,
    decompress: deflateDecompress
  },
  zip: {
    create: createZipFile
  },
  lzString: {
    compress: lzStringCompress,
    decompress: lzStringDecompress
  },
  base64: {
    compress: compressToBase64,
    decompress: decompressFromBase64
  },
  rle: {
    compress: rleCompress,
    decompress: rleDecompress
  },
  utils: {
    analysis: compressionAnalysis
  }
};