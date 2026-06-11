/**
 * Defang/Refang operations for URLs and IP addresses.
 * Used to safely share indicators of compromise (IOCs) without creating clickable links.
 */

/**
 * Defang a URL by replacing protocol and dots to make it non-clickable.
 * - `http` / `https` -> `hxxp` / `hxxps`
 * - `://` -> `[://]`
 * - dots in the domain portion -> `[.]`
 * @param {string} input - The URL to defang
 * @returns {string} The defanged URL
 */
export function defangUrl(input) {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  let result = input;

  // Replace http/https with hxxp/hxxps
  result = result.replace(/https?/gi, (match) =>
    match.replace(/t/gi, (t) => (t === 'T' ? 'X' : 'x')).replace(/tt/gi, 'xx')
  );
  // Simpler approach: direct replacements
  result = input;
  result = result.replace(/https/gi, 'hxxps');
  result = result.replace(/http/gi, 'hxxp');

  // Replace :// with [://]
  result = result.replace(/:\/\//g, '[://]');

  // Replace dots in the domain portion (everything before the first /)
  // Split on [://] to find the domain part
  const protocolSplit = result.split('[://]');
  if (protocolSplit.length > 1) {
    const afterProtocol = protocolSplit.slice(1).join('[://]');
    const pathIndex = afterProtocol.indexOf('/');
    let domain, rest;
    if (pathIndex !== -1) {
      domain = afterProtocol.substring(0, pathIndex);
      rest = afterProtocol.substring(pathIndex);
    } else {
      domain = afterProtocol;
      rest = '';
    }
    domain = domain.replace(/\./g, '[.]');
    result = protocolSplit[0] + '[://]' + domain + rest;
  } else {
    // No protocol found, defang all dots
    result = result.replace(/\./g, '[.]');
  }

  return result;
}

/**
 * Refang a previously defanged URL back to its original form.
 * @param {string} input - The defanged URL
 * @returns {string} The refanged (original) URL
 */
export function refangUrl(input) {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  let result = input;

  // Replace hxxps/hxxp back to https/http
  result = result.replace(/hxxps/gi, 'https');
  result = result.replace(/hxxp/gi, 'http');

  // Replace [://] back to ://
  result = result.replace(/\[:\/\/\]/g, '://');

  // Replace [.] back to .
  result = result.replace(/\[\.\]/g, '.');

  return result;
}

/**
 * Defang an IP address by replacing dots with [.]
 * @param {string} input - The IP address to defang
 * @returns {string} The defanged IP address
 */
export function defangIp(input) {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  return input.replace(/\./g, '[.]');
}

/**
 * Refang a previously defanged IP address.
 * @param {string} input - The defanged IP address
 * @returns {string} The refanged IP address
 */
export function refangIp(input) {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  return input.replace(/\[\.\]/g, '.');
}
