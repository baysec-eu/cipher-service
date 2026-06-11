/**
 * CyberChef-style flow control operations.
 */

/**
 * Split input by delimiter, return array of parts.
 * @param {string} input
 * @param {string} splitDelimiter - Delimiter to split on (default: '\n')
 * @param {string} mergeDelimiter - Delimiter for rejoining (default: '\n')
 * @returns {string[]}
 */
export function fork(input, splitDelimiter = '\n', mergeDelimiter = '\n') {
  if (typeof input !== 'string') input = String(input);
  return input.split(splitDelimiter);
}

/**
 * Join array or lines with delimiter.
 * @param {string|string[]} input
 * @param {string} delimiter - Join delimiter (default: '\n')
 * @returns {string}
 */
export function merge(input, delimiter = '\n') {
  if (Array.isArray(input)) return input.join(delimiter);
  return String(input);
}

/**
 * Extract regex match from input and store in a register variable.
 * Returns an object with the original input and the captured value.
 * @param {string} input
 * @param {string|RegExp} regex
 * @param {number} captureGroup - Which capture group to extract (default: 0 = full match)
 * @returns {{ output: string, register: string|null }}
 */
export function register(input, regex, captureGroup = 0) {
  if (typeof input !== 'string') input = String(input);
  const re = regex instanceof RegExp ? regex : new RegExp(regex);
  const match = input.match(re);
  const captured = match ? (match[captureGroup] ?? null) : null;
  return { output: input, register: captured };
}

/**
 * No-op annotation. Returns input unchanged.
 * @param {string} input
 * @returns {string}
 */
export function comment(input) {
  return input;
}

/**
 * Reverse the entire input string.
 * @param {string} input
 * @returns {string}
 */
export function reverse(input) {
  if (typeof input !== 'string') input = String(input);
  return [...input].reverse().join('');
}

/**
 * Take first or last N characters.
 * @param {string} input
 * @param {number} count
 * @param {boolean} fromEnd - If true, take from end (default: false)
 * @returns {string}
 */
export function take(input, count, fromEnd = false) {
  if (typeof input !== 'string') input = String(input);
  if (fromEnd) return input.slice(-count);
  return input.slice(0, count);
}

/**
 * Drop first or last N characters.
 * @param {string} input
 * @param {number} count
 * @param {boolean} fromEnd - If true, drop from end (default: false)
 * @returns {string}
 */
export function drop(input, count, fromEnd = false) {
  if (typeof input !== 'string') input = String(input);
  if (fromEnd) return input.slice(0, -count);
  return input.slice(count);
}

/**
 * Take first N lines.
 * @param {string} input
 * @param {number} n
 * @returns {string}
 */
export function head(input, n) {
  if (typeof input !== 'string') input = String(input);
  return input.split('\n').slice(0, n).join('\n');
}

/**
 * Take last N lines.
 * @param {string} input
 * @param {number} n
 * @returns {string}
 */
export function tail(input, n) {
  if (typeof input !== 'string') input = String(input);
  return input.split('\n').slice(-n).join('\n');
}

/**
 * Filter lines matching regex (or not matching if invert=true).
 * @param {string} input
 * @param {string|RegExp} regex
 * @param {boolean} invert - If true, keep non-matching lines (default: false)
 * @returns {string}
 */
export function filter(input, regex, invert = false) {
  if (typeof input !== 'string') input = String(input);
  const re = regex instanceof RegExp ? regex : new RegExp(regex);
  const lines = input.split('\n');
  const filtered = lines.filter(line => invert ? !re.test(line) : re.test(line));
  return filtered.join('\n');
}

/**
 * Sort lines.
 * @param {string} input
 * @param {string} delimiter - Line delimiter (default: '\n')
 * @param {boolean} reverse - Reverse sort order (default: false)
 * @param {boolean} numeric - Use numeric sort (default: false)
 * @returns {string}
 */
export function sort(input, delimiter = '\n', reverse = false, numeric = false) {
  if (typeof input !== 'string') input = String(input);
  const parts = input.split(delimiter);
  parts.sort((a, b) => {
    if (numeric) {
      const diff = parseFloat(a) - parseFloat(b);
      return reverse ? -diff : diff;
    }
    const cmp = a.localeCompare(b);
    return reverse ? -cmp : cmp;
  });
  return parts.join(delimiter);
}

/**
 * Remove duplicate lines.
 * @param {string} input
 * @param {string} delimiter - Line delimiter (default: '\n')
 * @returns {string}
 */
export function unique(input, delimiter = '\n') {
  if (typeof input !== 'string') input = String(input);
  const parts = input.split(delimiter);
  return [...new Set(parts)].join(delimiter);
}

/**
 * Apply operation only to parts of input matching regex.
 * @param {string} input
 * @param {string|RegExp} regex
 * @param {function(string): string} operation - Function to apply to matching sections
 * @returns {string}
 */
export function subsection(input, regex, operation) {
  if (typeof input !== 'string') input = String(input);
  const re = regex instanceof RegExp
    ? new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g')
    : new RegExp(regex, 'g');
  return input.replace(re, match => operation(match));
}
