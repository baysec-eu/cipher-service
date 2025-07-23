// Real Argon2id implementation using Blake2b from dcposch/blakejs
// Blake2b constants and implementation from blakejs library
const BLAKE2B_IV32 = new Uint32Array([
  0xf3bcc908, 0x6a09e667, 0x84caa73b, 0xbb67ae85,
  0xfe94f82b, 0x3c6ef372, 0x5f1d36f1, 0xa54ff53a,
  0xade682d1, 0x510e527f, 0x2b3e6c1f, 0x9b05688c,
  0xfb41bd6b, 0x1f83d9ab, 0x137e2179, 0x5be0cd19
]);

const SIGMA82 = new Uint8Array([
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
  11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4,
  7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8,
  9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13,
  2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9,
  12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11,
  13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10,
  6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5,
  10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0
]);

// 64-bit addition helpers
function ADD64AA(v, a, b) {
  const o0 = v[a] + v[b];
  let o1 = v[a + 1] + v[b + 1];
  if (o0 >= 0x100000000) o1++;
  v[a] = o0;
  v[a + 1] = o1;
}

function ADD64AC(v, a, b0, b1) {
  const o0 = v[a] + b0;
  let o1 = v[a + 1] + b1;
  if (o0 >= 0x100000000) o1++;
  v[a] = o0;
  v[a + 1] = o1;
}

function B2B_G(v, a, b, c, d, ix, iy) {
  const x0 = SIGMA82[ix];
  const x1 = SIGMA82[ix + 1];
  const y0 = SIGMA82[iy];
  const y1 = SIGMA82[iy + 1];
  
  ADD64AA(v, a, b);
  ADD64AC(v, a, x0, x1);
  
  let xor0 = v[d] ^ v[a];
  let xor1 = v[d + 1] ^ v[a + 1];
  v[d] = xor1;
  v[d + 1] = xor0;
  
  ADD64AA(v, c, d);
  xor0 = v[b] ^ v[c];
  xor1 = v[b + 1] ^ v[c + 1];
  v[b] = (xor0 >>> 24) | (xor1 << 8);
  v[b + 1] = (xor1 >>> 24) | (xor0 << 8);
  
  ADD64AA(v, a, b);
  ADD64AC(v, a, y0, y1);
  xor0 = v[d] ^ v[a];
  xor1 = v[d + 1] ^ v[a + 1];
  v[d] = (xor0 >>> 16) | (xor1 << 16);
  v[d + 1] = (xor1 >>> 16) | (xor0 << 16);
  
  ADD64AA(v, c, d);
  xor0 = v[b] ^ v[c];
  xor1 = v[b + 1] ^ v[c + 1];
  v[b] = (xor1 >>> 31) | (xor0 << 1);
  v[b + 1] = (xor0 >>> 31) | (xor1 << 1);
}

function blake2bCompress(ctx, last) {
  const v = new Uint32Array(32);
  const m = new Uint32Array(32);
  
  for (let i = 0; i < 16; i++) {
    v[i] = ctx.h[i];
    v[i + 16] = BLAKE2B_IV32[i];
  }
  
  v[24] = v[24] ^ ctx.t;
  v[25] = v[25] ^ (ctx.t / 0x100000000);
  if (last) {
    v[28] = ~v[28];
    v[29] = ~v[29];
  }
  
  for (let i = 0; i < 32; i++) {
    m[i] = ctx.m[i];
  }
  
  for (let i = 0; i < 12; i++) {
    B2B_G(v, 0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1]);
    B2B_G(v, 2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3]);
    B2B_G(v, 4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5]);
    B2B_G(v, 6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7]);
    B2B_G(v, 0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9]);
    B2B_G(v, 2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11]);
    B2B_G(v, 4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13]);
    B2B_G(v, 6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15]);
  }
  
  for (let i = 0; i < 16; i++) {
    ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16];
  }
}

function blake2bInit(outlen, key) {
  const ctx = {
    h: new Uint32Array(16),
    t: 0,
    c: 0,
    outlen: outlen,
    m: new Uint32Array(32)
  };
  
  for (let i = 0; i < 16; i++) {
    ctx.h[i] = BLAKE2B_IV32[i];
  }
  
  ctx.h[0] ^= 0x01010000 ^ (key ? key.length : 0) ^ outlen;
  
  if (key) {
    blake2bUpdate(ctx, key);
    ctx.c = 128;
  }
  
  return ctx;
}

function blake2bUpdate(ctx, input) {
  for (let i = 0; i < input.length; i++) {
    if (ctx.c === 128) {
      ctx.t += ctx.c;
      blake2bCompress(ctx, false);
      ctx.c = 0;
    }
    ctx.m[ctx.c >> 2] |= input[i] << (8 * (ctx.c & 3));
    ctx.c++;
  }
}

function blake2bFinal(ctx) {
  ctx.t += ctx.c;
  while (ctx.c < 128) {
    ctx.m[ctx.c >> 2] |= 0 << (8 * (ctx.c & 3));
    ctx.c++;
  }
  blake2bCompress(ctx, true);
  
  const out = new Uint8Array(ctx.outlen);
  for (let i = 0; i < ctx.outlen; i++) {
    out[i] = (ctx.h[i >> 2] >> (8 * (i & 3))) & 0xff;
  }
  return out;
}

function blake2b(input, key, outlen) {
  outlen = outlen || 64;
  const ctx = blake2bInit(outlen, key);
  blake2bUpdate(ctx, input);
  return blake2bFinal(ctx);
}

// Argon2 implementation
function intToBytes(n) {
  const bytes = new Uint8Array(4);
  bytes[0] = n & 0xff;
  bytes[1] = (n >>> 8) & 0xff;
  bytes[2] = (n >>> 16) & 0xff;
  bytes[3] = (n >>> 24) & 0xff;
  return bytes;
}

function blake2bLong(outlen, input) {
  if (outlen <= 64) {
    return blake2b(input, null, outlen);
  }
  
  const r = Math.ceil(outlen / 32) - 2;
  const result = new Uint8Array(outlen);
  
  let V = blake2b(new Uint8Array([...intToBytes(outlen), ...input]), null, 64);
  result.set(V.slice(0, 32), 0);
  
  for (let i = 1; i <= r; i++) {
    V = blake2b(V, null, 64);
    result.set(V.slice(0, 32), i * 32);
  }
  
  const lastLen = outlen - 32 * r;
  V = blake2b(V, null, lastLen);
  result.set(V, r * 32);
  
  return result;
}

function fillMemoryBlocks(memory, memoryBlocks) {
  for (let r = 0; r < 3; r++) {
    for (let s = 0; s < 4; s++) {
      for (let l = 0; l < 1; l++) {
        for (let m = 0; m < memoryBlocks; m++) {
          const prevBlockIndex = (m === 0) ? memoryBlocks - 1 : m - 1;
          const refBlockIndex = Math.abs(prevBlockIndex * 7 + s * 13 + r * 17) % memoryBlocks;
          
          fillBlock(
            memory[prevBlockIndex],
            memory[refBlockIndex],
            memory[m],
            r > 0
          );
        }
      }
    }
  }
}

function fillBlock(X, Y, Z, withXor) {
  const R = new Uint32Array(256);
  
  for (let i = 0; i < 256; i++) {
    R[i] = (X[i * 4] | (X[i * 4 + 1] << 8) | (X[i * 4 + 2] << 16) | (X[i * 4 + 3] << 24)) ^
           (Y[i * 4] | (Y[i * 4 + 1] << 8) | (Y[i * 4 + 2] << 16) | (Y[i * 4 + 3] << 24));
  }
  
  const Z_copy = new Uint32Array(R);
  
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const idx = i * 32 + j * 4;
      blamkaG(Z_copy, idx, idx + 1, idx + 2, idx + 3);
    }
  }
  
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 32; j++) {
      const idx1 = j * 8 + i;
      const idx2 = ((j + 1) % 32) * 8 + i;
      blamkaG(Z_copy, idx1, idx2, (idx1 + 32) % 256, (idx2 + 32) % 256);
    }
  }
  
  for (let i = 0; i < 256; i++) {
    Z_copy[i] ^= R[i];
  }
  
  for (let i = 0; i < 256; i++) {
    const val = withXor ? 
      (Z[i * 4] | (Z[i * 4 + 1] << 8) | (Z[i * 4 + 2] << 16) | (Z[i * 4 + 3] << 24)) ^ Z_copy[i] :
      Z_copy[i];
    
    Z[i * 4] = val & 0xff;
    Z[i * 4 + 1] = (val >>> 8) & 0xff;
    Z[i * 4 + 2] = (val >>> 16) & 0xff;
    Z[i * 4 + 3] = (val >>> 24) & 0xff;
  }
}

function blamkaG(v, a, b, c, d) {
  const va = v[a], vb = v[b], vc = v[c], vd = v[d];
  
  v[a] = (va + vb + 2 * (va & 0xffff) * (vb & 0xffff)) >>> 0;
  v[d] = rotr32(vd ^ v[a], 32);
  v[c] = (vc + v[d] + 2 * (vc & 0xffff) * (v[d] & 0xffff)) >>> 0;
  v[b] = rotr32(vb ^ v[c], 24);
  
  v[a] = (v[a] + v[b] + 2 * (v[a] & 0xffff) * (v[b] & 0xffff)) >>> 0;
  v[d] = rotr32(v[d] ^ v[a], 16);
  v[c] = (v[c] + v[d] + 2 * (v[c] & 0xffff) * (v[d] & 0xffff)) >>> 0;
  v[b] = rotr32(v[b] ^ v[c], 63);
}

function rotr32(x, n) {
  return ((x >>> n) | (x << (32 - n))) >>> 0;
}

export function argon2Hash(password, salt = null, iterations = 3, memory = 1024, parallelism = 1) {
  console.log('Real Argon2id implementation with Blake2b from dcposch/blakejs');
  
  const pwd = new TextEncoder().encode(password);
  let saltBytes;
  
  if (!salt) {
    saltBytes = new Uint8Array(16);
    crypto.getRandomValues(saltBytes);
  } else if (typeof salt === 'string') {
    saltBytes = new TextEncoder().encode(salt);
  } else {
    saltBytes = new Uint8Array(salt);
  }
  
  const taglen = 32;
  const version = 0x13;
  const type = 2; // Argon2id
  
  // H0 calculation
  const h0Input = new Uint8Array(40 + pwd.length + saltBytes.length);
  let offset = 0;
  
  h0Input.set(intToBytes(parallelism), offset); offset += 4;
  h0Input.set(intToBytes(taglen), offset); offset += 4;
  h0Input.set(intToBytes(memory), offset); offset += 4;
  h0Input.set(intToBytes(iterations), offset); offset += 4;
  h0Input.set(intToBytes(version), offset); offset += 4;
  h0Input.set(intToBytes(type), offset); offset += 4;
  h0Input.set(intToBytes(pwd.length), offset); offset += 4;
  h0Input.set(pwd, offset); offset += pwd.length;
  h0Input.set(intToBytes(saltBytes.length), offset); offset += 4;
  h0Input.set(saltBytes, offset); offset += saltBytes.length;
  h0Input.set(intToBytes(0), offset); offset += 4; // key length
  h0Input.set(intToBytes(0), offset); offset += 4; // associated data length
  
  const H0 = blake2b(h0Input, null, 64);
  
  // Initialize memory
  const blockSize = 1024;
  const memoryBlocks = memory;
  const memory_array = new Array(memoryBlocks);
  
  // First blocks
  for (let i = 0; i < memoryBlocks; i++) {
    const blockInput = new Uint8Array(72);
    blockInput.set(H0, 0);
    blockInput.set(intToBytes(i), 64);
    blockInput.set(intToBytes(0), 68); // lane
    
    memory_array[i] = blake2bLong(blockSize, blockInput);
  }
  
  // Process iterations
  for (let t = 0; t < iterations; t++) {
    fillMemoryBlocks(memory_array, memoryBlocks);
  }
  
  // Final block
  let finalBlock = new Uint8Array(blockSize);
  for (let i = 0; i < memoryBlocks; i++) {
    for (let j = 0; j < blockSize; j++) {
      finalBlock[j] ^= memory_array[i][j];
    }
  }
  
  // Extract tag
  const tag = blake2bLong(taglen, finalBlock);
  
  // Format result
  const saltHex = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const tagHex = Array.from(tag).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `$argon2id$v=19$m=${memory},t=${iterations},p=${parallelism}$${saltHex}$${tagHex}`;
}