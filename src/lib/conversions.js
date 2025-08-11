/**
 * Simple conversion operations for numbers, hex, strings
 */

/**
 * Convert string to number
 * @param {string} input - String representation of number
 * @returns {string} - Number as string
 */
export function stringToNumber(input) {
  const num = parseFloat(String(input).trim());
  return isNaN(num) ? '0' : num.toString();
}

/**
 * Convert hex string to decimal number
 * @param {string} input - Hex string (with or without 0x prefix)
 * @returns {string} - Decimal number as string
 */
export function hexToNumber(input) {
  let hex = String(input).trim();
  
  // Remove 0x prefix if present
  if (hex.toLowerCase().startsWith('0x')) {
    hex = hex.slice(2);
  }
  
  // Validate hex
  if (!/^[0-9a-fA-F]+$/.test(hex)) {
    return '0';
  }
  
  const num = parseInt(hex, 16);
  return isNaN(num) ? '0' : num.toString();
}

/**
 * Convert decimal number to hex
 * @param {string} input - Decimal number
 * @param {boolean} uppercase - Use uppercase hex letters (default: false)
 * @returns {string} - Hex string
 */
export function numberToHex(input, uppercase = false) {
  const num = parseInt(String(input).trim());
  if (isNaN(num)) return '0';
  
  const hex = num.toString(16);
  return uppercase ? hex.toUpperCase() : hex;
}

/**
 * Convert number to different bases
 * @param {string} input - Decimal number
 * @param {number} base - Target base (2, 8, 16, etc.)
 * @returns {string} - Number in target base
 */
export function numberToBase(input, base = 2) {
  const num = parseInt(String(input).trim());
  const targetBase = parseInt(base) || 2;
  
  if (isNaN(num) || targetBase < 2 || targetBase > 36) {
    return '0';
  }
  
  return num.toString(targetBase);
}

/**
 * Convert from any base to decimal
 * @param {string} input - Number in source base
 * @param {number} fromBase - Source base (2, 8, 16, etc.)
 * @returns {string} - Decimal number
 */
export function baseToNumber(input, fromBase = 16) {
  const sourceBase = parseInt(fromBase) || 16;
  
  if (sourceBase < 2 || sourceBase > 36) {
    return '0';
  }
  
  const num = parseInt(String(input).trim(), sourceBase);
  return isNaN(num) ? '0' : num.toString();
}

/**
 * Parse and extract numbers from text
 * @param {string} input - Text containing numbers
 * @returns {string} - First number found
 */
export function extractNumber(input) {
  const match = String(input).match(/-?\d+\.?\d*/);
  return match ? match[0] : '0';
}

/**
 * Convert hex string to ASCII string
 * @param {string} input - Hex string
 * @returns {string} - ASCII string
 */
export function hexToAscii(input) {
  let hex = String(input).trim();
  
  // Remove 0x prefix if present
  if (hex.toLowerCase().startsWith('0x')) {
    hex = hex.slice(2);
  }
  
  // Ensure even length
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  
  let result = '';
  for (let i = 0; i < hex.length; i += 2) {
    const hexByte = hex.substr(i, 2);
    const decimal = parseInt(hexByte, 16);
    if (!isNaN(decimal)) {
      result += String.fromCharCode(decimal);
    }
  }
  
  return result;
}

/**
 * Convert ASCII string to hex
 * @param {string} input - ASCII string
 * @param {boolean} uppercase - Use uppercase hex (default: false)
 * @returns {string} - Hex string
 */
export function asciiToHex(input, uppercase = false) {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    const hex = input.charCodeAt(i).toString(16).padStart(2, '0');
    result += uppercase ? hex.toUpperCase() : hex;
  }
  return result;
}