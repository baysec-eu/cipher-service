/**
 * UUID generation using crypto.getRandomValues. No external dependencies.
 */

/**
 * Generate a UUID.
 * @param {string|number} [version='v4'] - UUID version (currently only v4 supported)
 * @returns {string} The generated UUID string
 */
export function generateUUID(version = 'v4') {
  const v = String(version).toLowerCase().replace(/^v?/, 'v');

  if (v !== 'v4') {
    throw new Error(`Unsupported UUID version: ${version}. Supported: v4`);
  }

  return generateUUIDv4();
}

/**
 * Generate a version 4 (random) UUID per RFC 4122.
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 * where y is one of [8, 9, a, b].
 * @returns {string}
 */
function generateUUIDv4() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Set version: bits 4-7 of byte 6 to 0100 (version 4)
  bytes[6] = (bytes[6] & 0x0f) | 0x40;

  // Set variant: bits 6-7 of byte 8 to 10 (RFC 4122 variant)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  // Convert to hex string with dashes
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  return [
    hex.substring(0, 8),
    hex.substring(8, 12),
    hex.substring(12, 16),
    hex.substring(16, 20),
    hex.substring(20, 32),
  ].join('-');
}
