// Real ZSTD decompression using fzstd library
// Compression uses a basic implementation since fzstd is decompress-only

import { decompress as fzstdDecompress } from 'fzstd';

export const compressZstd = async (input, options = {}) => {
  if (!input) return new Uint8Array();

  try {
    const inputBytes = typeof input === 'string'
      ? new TextEncoder().encode(input)
      : new Uint8Array(input);

    // fzstd is decompress-only. For compression, we store data in a valid
    // ZSTD frame with a raw (uncompressed) block so it roundtrips correctly.
    const magic = new Uint8Array([0x28, 0xB5, 0x2F, 0xFD]);

    // Frame header: FHD byte + window descriptor
    // Single_Segment=1, FCS_Field_Size=1 byte (if size < 256) or 2 bytes
    const contentSize = inputBytes.length;
    let fhd, fcsBytes;

    if (contentSize <= 255) {
      fhd = new Uint8Array([0x20]); // Single_Segment=1, FCS=0 (1 byte)
      fcsBytes = new Uint8Array([contentSize]);
    } else {
      fhd = new Uint8Array([0x60]); // Single_Segment=1, FCS=1 (2 bytes)
      fcsBytes = new Uint8Array([contentSize & 0xFF, (contentSize >> 8) & 0xFF]);
    }

    // Raw block header: Last_Block=1, Block_Type=00 (raw), Block_Size
    const blockSize = inputBytes.length;
    const blockHeader = new Uint8Array([
      0x01 | ((blockSize & 0x1F) << 3),
      (blockSize >> 5) & 0xFF,
      (blockSize >> 13) & 0xFF
    ]);

    // Assemble frame
    const output = new Uint8Array(
      magic.length + fhd.length + fcsBytes.length + blockHeader.length + inputBytes.length
    );
    let offset = 0;
    output.set(magic, offset); offset += magic.length;
    output.set(fhd, offset); offset += fhd.length;
    output.set(fcsBytes, offset); offset += fcsBytes.length;
    output.set(blockHeader, offset); offset += blockHeader.length;
    output.set(inputBytes, offset);

    return output;
  } catch (error) {
    throw new Error(`ZSTD compression error: ${error.message}`);
  }
};

export const decompressZstd = async (input, options = {}) => {
  try {
    const inputBytes = input instanceof Uint8Array ? input : new Uint8Array(input);

    // Verify ZSTD magic number
    if (inputBytes.length < 4 ||
        inputBytes[0] !== 0x28 || inputBytes[1] !== 0xB5 ||
        inputBytes[2] !== 0x2F || inputBytes[3] !== 0xFD) {
      throw new Error('Invalid ZSTD magic number');
    }

    const decompressed = fzstdDecompress(inputBytes);
    return decompressed;
  } catch (error) {
    throw new Error(`ZSTD decompression error: ${error.message}`);
  }
};

export const getZstdCompressionRatio = (original, compressed) => {
  if (!original || !compressed) return 0;
  const originalSize = original.length || original.byteLength || 0;
  const compressedSize = compressed.length || compressed.byteLength || 0;
  return originalSize > 0 ? (compressedSize / originalSize) : 0;
};

export const compressZstdOperation = {
  id: 'compress_zstd',
  name: 'ZSTD Compress',
  type: 'compression',
  description: 'Compress data using ZSTD format (raw block storage)',
  params: [],
  operation: async (input, params) => {
    const result = await compressZstd(input, params);
    return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
  }
};

export const decompressZstdOperation = {
  id: 'decompress_zstd',
  name: 'ZSTD Decompress',
  type: 'compression',
  description: 'Decompress ZSTD compressed data using fzstd',
  params: [],
  operation: async (input, params) => {
    const bytes = new Uint8Array(
      typeof input === 'string'
        ? input.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        : input
    );
    const result = await decompressZstd(bytes, params);
    return new TextDecoder().decode(result);
  }
};
