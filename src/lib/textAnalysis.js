/**
 * Text Analysis Operations
 * Basic text analysis functions for character/word counting
 */

/**
 * Count characters in a string
 * @param {string} input - Input string
 * @returns {string} Character count
 */
export function characterCount(input) {
  if (typeof input !== 'string') {
    return '0';
  }
  return input.length.toString();
}

/**
 * Count words in a string
 * @param {string} input - Input string
 * @returns {string} Word count
 */
export function wordCount(input) {
  if (typeof input !== 'string' || !input.trim()) {
    return '0';
  }
  
  // Split by whitespace and filter out empty strings
  const words = input.trim().split(/\s+/).filter(word => word.length > 0);
  return words.length.toString();
}