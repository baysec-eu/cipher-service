// Pseudo-Random Number Generators
// CSPRNG, Mersenne Twister, LCG, xorshift128+, HMAC-DRBG

// CSPRNG - Generate cryptographically secure random bytes
export function generateRandomBytes(input, length = 32, format = 'hex') {
  const len = parseInt(length) || 32;
  if (len < 1 || len > 65536) throw new Error('Length must be 1-65536');

  const bytes = crypto.getRandomValues(new Uint8Array(len));

  switch (format) {
    case 'hex':
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    case 'base64':
      return btoa(String.fromCharCode(...bytes));
    case 'decimal':
      return Array.from(bytes).join(' ');
    case 'binary':
      return Array.from(bytes).map(b => b.toString(2).padStart(8, '0')).join(' ');
    case 'raw':
      return new TextDecoder('latin1').decode(bytes);
    default:
      return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

// Generate random integer in range
export function generateRandomInt(input, min = 0, max = 100, count = 1) {
  const lo = parseInt(min) || 0;
  const hi = parseInt(max) || 100;
  const n = Math.min(parseInt(count) || 1, 10000);

  if (lo >= hi) throw new Error('min must be less than max');

  const results = [];
  const range = hi - lo + 1;
  for (let i = 0; i < n; i++) {
    const arr = crypto.getRandomValues(new Uint32Array(1));
    results.push(lo + (arr[0] % range));
  }
  return results.join('\n');
}

// Mersenne Twister (MT19937)
export function mersenneTwister(input, seed = 0, count = 10, format = 'decimal') {
  const s = parseInt(seed) || Date.now();
  const n = Math.min(parseInt(count) || 10, 10000);

  const N = 624;
  const M = 397;
  const mt = new Uint32Array(N);
  let mti = N + 1;

  // Initialize
  mt[0] = s >>> 0;
  for (mti = 1; mti < N; mti++) {
    mt[mti] = (1812433253 * (mt[mti - 1] ^ (mt[mti - 1] >>> 30)) + mti) >>> 0;
  }

  function next() {
    let y;
    const mag01 = [0, 0x9908b0df];

    if (mti >= N) {
      let kk;
      for (kk = 0; kk < N - M; kk++) {
        y = (mt[kk] & 0x80000000) | (mt[kk + 1] & 0x7fffffff);
        mt[kk] = mt[kk + M] ^ (y >>> 1) ^ mag01[y & 1];
      }
      for (; kk < N - 1; kk++) {
        y = (mt[kk] & 0x80000000) | (mt[kk + 1] & 0x7fffffff);
        mt[kk] = mt[kk + (M - N)] ^ (y >>> 1) ^ mag01[y & 1];
      }
      y = (mt[N - 1] & 0x80000000) | (mt[0] & 0x7fffffff);
      mt[N - 1] = mt[M - 1] ^ (y >>> 1) ^ mag01[y & 1];
      mti = 0;
    }

    y = mt[mti++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }

  const results = [];
  for (let i = 0; i < n; i++) {
    const val = next();
    switch (format) {
      case 'hex': results.push(val.toString(16).padStart(8, '0')); break;
      case 'binary': results.push(val.toString(2).padStart(32, '0')); break;
      case 'float': results.push((val / 0xffffffff).toFixed(10)); break;
      default: results.push(val.toString()); break;
    }
  }
  return results.join('\n');
}

// Linear Congruential Generator (LCG)
export function lcg(input, seed = 1, count = 10, a = 1664525, c = 1013904223, m = 4294967296) {
  let s = (parseInt(seed) || 1) >>> 0;
  const n = Math.min(parseInt(count) || 10, 10000);
  const A = parseInt(a) || 1664525;
  const C = parseInt(c) || 1013904223;
  const M = parseInt(m) || 4294967296;

  const results = [];
  for (let i = 0; i < n; i++) {
    s = (A * s + C) % M;
    results.push(s >>> 0);
  }
  return results.join('\n');
}

// xorshift128+
export function xorshift128plus(input, seed = 0, count = 10) {
  const n = Math.min(parseInt(count) || 10, 10000);
  let s0 = (parseInt(seed) || Date.now()) >>> 0;
  let s1 = (s0 * 2654435761) >>> 0;
  if (s0 === 0) s0 = 1;
  if (s1 === 0) s1 = 1;

  const results = [];
  for (let i = 0; i < n; i++) {
    let x = s0;
    const y = s1;
    s0 = y;
    x ^= (x << 23) >>> 0;
    x ^= x >>> 17;
    x ^= y;
    x ^= y >>> 26;
    s1 = x;
    results.push(((s0 + s1) >>> 0).toString());
  }
  return results.join('\n');
}

// HMAC-DRBG (Deterministic Random Bit Generator) - simplified
export async function hmacDrbg(input, seed = '', count = 10, format = 'hex') {
  const n = Math.min(parseInt(count) || 10, 100);
  const seedBytes = new TextEncoder().encode(seed || String(Date.now()));

  const key = await crypto.subtle.importKey(
    'raw', new Uint8Array(32),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  );

  let K = new Uint8Array(32); // key
  let V = new Uint8Array(32).fill(1); // value

  async function hmac(k, data) {
    const importedKey = await crypto.subtle.importKey(
      'raw', k, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', importedKey, data);
    return new Uint8Array(sig);
  }

  // Update
  async function update(providedData) {
    const concat0 = new Uint8Array(V.length + 1 + (providedData ? providedData.length : 0));
    concat0.set(V);
    concat0[V.length] = 0x00;
    if (providedData) concat0.set(providedData, V.length + 1);

    K = await hmac(K, concat0);
    V = await hmac(K, V);

    if (providedData) {
      const concat1 = new Uint8Array(V.length + 1 + providedData.length);
      concat1.set(V);
      concat1[V.length] = 0x01;
      concat1.set(providedData, V.length + 1);
      K = await hmac(K, concat1);
      V = await hmac(K, V);
    }
  }

  // Seed
  await update(seedBytes);

  // Generate
  const results = [];
  for (let i = 0; i < n; i++) {
    V = await hmac(K, V);
    const hex = Array.from(V).map(b => b.toString(16).padStart(2, '0')).join('');
    switch (format) {
      case 'decimal': results.push(BigInt('0x' + hex).toString()); break;
      case 'base64': results.push(btoa(String.fromCharCode(...V))); break;
      default: results.push(hex); break;
    }
    await update(null);
  }
  return results.join('\n');
}
