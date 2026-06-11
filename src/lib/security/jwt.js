/**
 * JWT operations using Web Crypto API. No external dependencies.
 * Supports HS256, HS384, HS512 algorithms.
 */

const ALGORITHM_MAP = {
  HS256: { name: 'HMAC', hash: 'SHA-256' },
  HS384: { name: 'HMAC', hash: 'SHA-384' },
  HS512: { name: 'HMAC', hash: 'SHA-512' },
};

/**
 * Encode bytes to base64url string.
 * @param {Uint8Array|ArrayBuffer} buffer
 * @returns {string}
 */
function toBase64Url(buffer) {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode a base64url string to Uint8Array.
 * @param {string} str
 * @returns {Uint8Array}
 */
function fromBase64Url(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' to make length a multiple of 4
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Convert a string to Uint8Array using UTF-8 encoding.
 * @param {string} str
 * @returns {Uint8Array}
 */
function stringToBytes(str) {
  return new TextEncoder().encode(str);
}

/**
 * Decode a JWT token without verifying the signature.
 * @param {string} input - The JWT token string
 * @returns {{ header: object, payload: object, signature: string }} Decoded JWT parts
 */
export function jwtDecode(input) {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  const parts = input.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: expected 3 dot-separated parts');
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  let header;
  try {
    header = JSON.parse(new TextDecoder().decode(fromBase64Url(headerB64)));
  } catch {
    throw new Error('Invalid JWT header: failed to parse as JSON');
  }

  let payload;
  try {
    payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadB64)));
  } catch {
    throw new Error('Invalid JWT payload: failed to parse as JSON');
  }

  return {
    header,
    payload,
    signature: signatureB64,
  };
}

/**
 * Sign a payload and produce a JWT token using HMAC.
 * @param {string|object} input - The payload (JSON string or object)
 * @param {string} secret - The HMAC secret key
 * @param {string} [algorithm='HS256'] - The signing algorithm (HS256, HS384, HS512)
 * @returns {Promise<string>} The signed JWT token
 */
export async function jwtSign(input, secret, algorithm = 'HS256') {
  const alg = algorithm.toUpperCase();
  const cryptoAlg = ALGORITHM_MAP[alg];
  if (!cryptoAlg) {
    throw new Error(`Unsupported algorithm: ${algorithm}. Supported: HS256, HS384, HS512`);
  }

  const payload = typeof input === 'string' ? JSON.parse(input) : input;

  const header = { alg, typ: 'JWT' };
  const headerB64 = toBase64Url(stringToBytes(JSON.stringify(header)));
  const payloadB64 = toBase64Url(stringToBytes(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    'raw',
    stringToBytes(secret),
    cryptoAlg,
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    cryptoAlg.name,
    key,
    stringToBytes(signingInput)
  );

  const signatureB64 = toBase64Url(signatureBuffer);

  return `${signingInput}.${signatureB64}`;
}

/**
 * Verify a JWT token's signature using HMAC.
 * @param {string} input - The JWT token string
 * @param {string} secret - The HMAC secret key
 * @returns {Promise<{ valid: boolean, header: object, payload: object }>}
 */
export async function jwtVerify(input, secret) {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Input must be a non-empty string');
  }

  const parts = input.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format: expected 3 dot-separated parts');
  }

  const { header, payload } = jwtDecode(input);

  const alg = header.alg?.toUpperCase();
  const cryptoAlg = ALGORITHM_MAP[alg];
  if (!cryptoAlg) {
    throw new Error(`Unsupported algorithm in token header: ${header.alg}`);
  }

  const signingInput = `${parts[0]}.${parts[1]}`;
  const signatureBytes = fromBase64Url(parts[2]);

  const key = await crypto.subtle.importKey(
    'raw',
    stringToBytes(secret),
    cryptoAlg,
    false,
    ['verify']
  );

  const valid = await crypto.subtle.verify(
    cryptoAlg.name,
    key,
    signatureBytes,
    stringToBytes(signingInput)
  );

  return { valid, header, payload };
}
