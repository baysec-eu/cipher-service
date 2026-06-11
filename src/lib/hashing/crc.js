/**
 * CRC checksum operations using lookup table approach.
 */

// CRC-32 lookup table (ISO 3309 / ITU-T V.42, polynomial 0xEDB88320)
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let crc = i;
  for (let j = 0; j < 8; j++) {
    crc = (crc & 1) ? (0xEDB88320 ^ (crc >>> 1)) : (crc >>> 1);
  }
  CRC32_TABLE[i] = crc >>> 0;
}

// CRC-16/CCITT lookup table (polynomial 0x1021)
const CRC16_TABLE = new Uint16Array(256);
for (let i = 0; i < 256; i++) {
  let crc = i << 8;
  for (let j = 0; j < 8; j++) {
    crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1);
  }
  CRC16_TABLE[i] = crc & 0xFFFF;
}

// CRC-8 lookup table (polynomial 0x07)
const CRC8_TABLE = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  let crc = i;
  for (let j = 0; j < 8; j++) {
    crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) : (crc << 1);
  }
  CRC8_TABLE[i] = crc & 0xFF;
}

/**
 * Encode input string to bytes.
 * @param {string} input
 * @returns {Uint8Array}
 */
function toBytes(input) {
  return new TextEncoder().encode(typeof input === 'string' ? input : String(input));
}

/**
 * Calculate CRC-32 checksum.
 * @param {string} input
 * @returns {string} Hex string (8 characters)
 */
export function crc32(input) {
  const data = toBytes(input);
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = CRC32_TABLE[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  crc = (crc ^ 0xFFFFFFFF) >>> 0;
  return crc.toString(16).padStart(8, '0');
}

/**
 * Calculate CRC-16/CCITT checksum.
 * @param {string} input
 * @returns {string} Hex string (4 characters)
 */
export function crc16(input) {
  const data = toBytes(input);
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = CRC16_TABLE[((crc >>> 8) ^ data[i]) & 0xFF] ^ ((crc << 8) & 0xFFFF);
  }
  return (crc & 0xFFFF).toString(16).padStart(4, '0');
}

/**
 * Calculate CRC-8 checksum.
 * @param {string} input
 * @returns {string} Hex string (2 characters)
 */
export function crc8(input) {
  const data = toBytes(input);
  let crc = 0x00;
  for (let i = 0; i < data.length; i++) {
    crc = CRC8_TABLE[(crc ^ data[i]) & 0xFF];
  }
  return (crc & 0xFF).toString(16).padStart(2, '0');
}
