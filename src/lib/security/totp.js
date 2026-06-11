/**
 * TOTP (RFC 6238) and HOTP (RFC 4226) implementation using Web Crypto API.
 * No external dependencies.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decode a Base32-encoded string into a Uint8Array.
 * @param {string} input - Base32-encoded string
 * @returns {Uint8Array} Decoded bytes
 */
export function base32Decode(input) {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  // Strip padding and whitespace, uppercase
  const cleaned = input.replace(/[\s=]/g, '').toUpperCase();

  let bits = '';
  for (const char of cleaned) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid Base32 character: ${char}`);
    }
    bits += index.toString(2).padStart(5, '0');
  }

  // Convert bit string to bytes
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substring(i * 8, i * 8 + 8), 2);
  }

  return bytes;
}

/**
 * Map algorithm name to Web Crypto digest name.
 * @param {string} algorithm
 * @returns {string}
 */
function mapAlgorithm(algorithm) {
  const map = {
    'SHA-1': 'SHA-1',
    'SHA1': 'SHA-1',
    'SHA-256': 'SHA-256',
    'SHA256': 'SHA-256',
    'SHA-512': 'SHA-512',
    'SHA512': 'SHA-512',
  };
  const mapped = map[algorithm.toUpperCase().replace(' ', '-')];
  if (!mapped) {
    throw new Error(`Unsupported algorithm: ${algorithm}. Supported: SHA-1, SHA-256, SHA-512`);
  }
  return mapped;
}

/**
 * Compute HMAC using Web Crypto API.
 * @param {Uint8Array} key - The secret key bytes
 * @param {Uint8Array} message - The message to sign
 * @param {string} algorithm - Hash algorithm (SHA-1, SHA-256, SHA-512)
 * @returns {Promise<Uint8Array>} HMAC result
 */
async function hmac(key, message, algorithm) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
  return new Uint8Array(signature);
}

/**
 * Convert a counter value to an 8-byte big-endian Uint8Array.
 * @param {number} counter
 * @returns {Uint8Array}
 */
function counterToBytes(counter) {
  const bytes = new Uint8Array(8);
  let value = counter;
  for (let i = 7; i >= 0; i--) {
    bytes[i] = value & 0xff;
    value = Math.floor(value / 256);
  }
  return bytes;
}

/**
 * Dynamic truncation as defined in RFC 4226.
 * @param {Uint8Array} hmacResult
 * @param {number} digits
 * @returns {string}
 */
function truncate(hmacResult, digits) {
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;

  const code =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  const otp = code % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * Generate an HOTP code per RFC 4226.
 * @param {string|Uint8Array} secret - Base32-encoded secret string or raw bytes
 * @param {number} counter - The counter value
 * @param {object} [options] - Options
 * @param {number} [options.digits=6] - Number of OTP digits (6 or 8)
 * @param {string} [options.algorithm='SHA-1'] - HMAC algorithm
 * @returns {Promise<string>} The HOTP code
 */
export async function generateHOTP(secret, counter, options = {}) {
  const { digits = 6, algorithm = 'SHA-1' } = options;

  const keyBytes = typeof secret === 'string' ? base32Decode(secret) : secret;
  const digestAlg = mapAlgorithm(algorithm);
  const counterBytes = counterToBytes(counter);

  const hmacResult = await hmac(keyBytes, counterBytes, digestAlg);
  return truncate(hmacResult, digits);
}

/**
 * Generate a TOTP code per RFC 6238.
 * @param {string|Uint8Array} secret - Base32-encoded secret string or raw bytes
 * @param {object} [options] - Options
 * @param {number} [options.period=30] - Time step in seconds
 * @param {number} [options.digits=6] - Number of OTP digits
 * @param {string} [options.algorithm='SHA-1'] - HMAC algorithm
 * @param {number} [options.timestamp] - Custom timestamp in milliseconds (defaults to Date.now())
 * @returns {Promise<string>} The TOTP code
 */
export async function generateTOTP(secret, options = {}) {
  const { period = 30, digits = 6, algorithm = 'SHA-1', timestamp } = options;

  const time = timestamp !== undefined ? timestamp : Date.now();
  const counter = Math.floor(time / 1000 / period);

  return generateHOTP(secret, counter, { digits, algorithm });
}
