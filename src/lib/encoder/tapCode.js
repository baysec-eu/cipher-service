// 5x5 Polybius square (K is merged with C)
//       1    2    3    4    5
//  1    A    B    C/K  D    E
//  2    F    G    H    I    J
//  3    L    M    N    O    P
//  4    Q    R    S    T    U
//  5    V    W    X    Y    Z

const GRID = [
  ['A', 'B', 'C', 'D', 'E'],
  ['F', 'G', 'H', 'I', 'J'],
  ['L', 'M', 'N', 'O', 'P'],
  ['Q', 'R', 'S', 'T', 'U'],
  ['V', 'W', 'X', 'Y', 'Z'],
];

const CHAR_TO_TAP = {};
const TAP_TO_CHAR = {};

for (let r = 0; r < 5; r++) {
  for (let c = 0; c < 5; c++) {
    const code = `${r + 1}.${c + 1}`;
    CHAR_TO_TAP[GRID[r][c]] = code;
    TAP_TO_CHAR[code] = GRID[r][c];
  }
}
// K maps to C (1.3)
CHAR_TO_TAP['K'] = CHAR_TO_TAP['C'];

export function tapEncode(input) {
  return input
    .toUpperCase()
    .split('')
    .map(ch => {
      if (ch === ' ') return '/';
      return CHAR_TO_TAP[ch] || '';
    })
    .filter(Boolean)
    .join(' ');
}

export function tapDecode(input) {
  return input
    .split(/\s*\/\s*/)
    .map(word =>
      word
        .trim()
        .split(/\s+/)
        .map(code => TAP_TO_CHAR[code] || '')
        .join('')
    )
    .join(' ');
}
