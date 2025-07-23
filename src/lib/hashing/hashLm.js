const IP = [
  58, 50, 42, 34, 26, 18, 10, 2,
  60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6,
  64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1,
  59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5,
  63, 55, 47, 39, 31, 23, 15, 7
];

const FP = [
  40, 8, 48, 16, 56, 24, 64, 32,
  39, 7, 47, 15, 55, 23, 63, 31,
  38, 6, 46, 14, 54, 22, 62, 30,
  37, 5, 45, 13, 53, 21, 61, 29,
  36, 4, 44, 12, 52, 20, 60, 28,
  35, 3, 43, 11, 51, 19, 59, 27,
  34, 2, 42, 10, 50, 18, 58, 26,
  33, 1, 41, 9, 49, 17, 57, 25
];

const E = [
  32, 1, 2, 3, 4, 5,
  4, 5, 6, 7, 8, 9,
  8, 9, 10, 11, 12, 13,
  12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21,
  20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29,
  28, 29, 30, 31, 32, 1
];

const P = [
  16, 7, 20, 21, 29, 12, 28, 17,
  1, 15, 23, 26, 5, 18, 31, 10,
  2, 8, 24, 14, 32, 27, 3, 9,
  19, 13, 30, 6, 22, 11, 4, 25
];

const PC1 = [
  57, 49, 41, 33, 25, 17, 9,
  1, 58, 50, 42, 34, 26, 18,
  10, 2, 59, 51, 43, 35, 27,
  19, 11, 3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15,
  7, 62, 54, 46, 38, 30, 22,
  14, 6, 61, 53, 45, 37, 29,
  21, 13, 5, 28, 20, 12, 4
];

const PC2 = [
  14, 17, 11, 24, 1, 5,
  3, 28, 15, 6, 21, 10,
  23, 19, 12, 4, 26, 8,
  16, 7, 27, 20, 13, 2,
  41, 52, 31, 37, 47, 55,
  30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53,
  46, 42, 50, 36, 29, 32
];

const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

const SBOXES = [
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
  ],
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
  ],
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
  ],
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
  ],
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
  ],
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
  ],
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
  ],
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
  ]
];

function permute(data, table) {
  const result = new Array(table.length);
  for (let i = 0; i < table.length; i++) {
    result[i] = data[table[i] - 1];
  }
  return result;
}

function leftShift(bits, n) {
  return bits.slice(n).concat(bits.slice(0, n));
}

function xor(a, b) {
  const result = new Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] ^ b[i];
  }
  return result;
}

function sBoxSubstitution(data) {
  const result = [];
  for (let i = 0; i < 8; i++) {
    const chunk = data.slice(i * 6, (i + 1) * 6);
    const row = (chunk[0] << 1) | chunk[5];
    const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
    const val = SBOXES[i][row][col];
    result.push(...[
      (val >> 3) & 1,
      (val >> 2) & 1,
      (val >> 1) & 1,
      val & 1
    ]);
  }
  return result;
}

function generateSubkeys(key) {
  const keyBits = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 7; j >= 0; j--) {
      keyBits.push((key[i] >> j) & 1);
    }
  }
  
  let permutedKey = permute(keyBits, PC1);
  let left = permutedKey.slice(0, 28);
  let right = permutedKey.slice(28, 56);
  
  const subkeys = [];
  for (let i = 0; i < 16; i++) {
    left = leftShift(left, SHIFTS[i]);
    right = leftShift(right, SHIFTS[i]);
    const combined = left.concat(right);
    subkeys.push(permute(combined, PC2));
  }
  
  return subkeys;
}

function feistelFunction(right, subkey) {
  const expanded = permute(right, E);
  const xored = xor(expanded, subkey);
  const substituted = sBoxSubstitution(xored);
  return permute(substituted, P);
}

function desEncrypt(plaintext, key) {
  const plaintextBits = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 7; j >= 0; j--) {
      plaintextBits.push((plaintext[i] >> j) & 1);
    }
  }
  
  let permuted = permute(plaintextBits, IP);
  let left = permuted.slice(0, 32);
  let right = permuted.slice(32, 64);
  
  const subkeys = generateSubkeys(key);
  
  for (let i = 0; i < 16; i++) {
    const newRight = xor(left, feistelFunction(right, subkeys[i]));
    left = right;
    right = newRight;
  }
  
  const combined = right.concat(left);
  const finalPermuted = permute(combined, FP);
  
  const result = new Array(8);
  for (let i = 0; i < 8; i++) {
    result[i] = 0;
    for (let j = 0; j < 8; j++) {
      result[i] |= finalPermuted[i * 8 + j] << (7 - j);
    }
  }
  
  return result;
}

function createDesKey(password7bytes) {
  const key = new Array(8);
  key[0] = password7bytes[0];
  key[1] = (password7bytes[0] << 7) | (password7bytes[1] >> 1);
  key[2] = (password7bytes[1] << 6) | (password7bytes[2] >> 2);
  key[3] = (password7bytes[2] << 5) | (password7bytes[3] >> 3);
  key[4] = (password7bytes[3] << 4) | (password7bytes[4] >> 4);
  key[5] = (password7bytes[4] << 3) | (password7bytes[5] >> 5);
  key[6] = (password7bytes[5] << 2) | (password7bytes[6] >> 6);
  key[7] = password7bytes[6] << 1;
  
  for (let i = 0; i < 8; i++) {
    key[i] &= 0xFE;
  }
  
  return key;
}

export function hashLm(password) {  
  const paddedPassword = password.toUpperCase().padEnd(14, '\0').substring(0, 14);
  const part1 = paddedPassword.substring(0, 7);
  const part2 = paddedPassword.substring(7, 14);
  
  const magic = [0x4B, 0x47, 0x53, 0x21, 0x40, 0x23, 0x24, 0x25]; // "KGS!@#$%"
  
  const key1 = createDesKey(Array.from(part1).map(c => c.charCodeAt(0)));
  const key2 = createDesKey(Array.from(part2).map(c => c.charCodeAt(0)));
  
  const hash1 = desEncrypt(magic, key1);
  const hash2 = desEncrypt(magic, key2);
  
  const result = hash1.concat(hash2).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return result.toUpperCase();
}