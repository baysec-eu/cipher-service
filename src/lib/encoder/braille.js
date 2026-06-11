const BRAILLE_MAP = {
  'A': '\u2801', 'B': '\u2803', 'C': '\u2809', 'D': '\u2819',
  'E': '\u2811', 'F': '\u280B', 'G': '\u281B', 'H': '\u2813',
  'I': '\u280A', 'J': '\u281A', 'K': '\u2805', 'L': '\u2807',
  'M': '\u280D', 'N': '\u281D', 'O': '\u2815', 'P': '\u280F',
  'Q': '\u281F', 'R': '\u2817', 'S': '\u280E', 'T': '\u281E',
  'U': '\u2825', 'V': '\u2827', 'W': '\u283A', 'X': '\u282D',
  'Y': '\u283D', 'Z': '\u2835',

  '1': '\u2801', '2': '\u2803', '3': '\u2809', '4': '\u2819',
  '5': '\u2811', '6': '\u280B', '7': '\u281B', '8': '\u2813',
  '9': '\u280A', '0': '\u281A',

  ' ': '\u2800',
};

const NUM_PREFIX = '\u283C';

const REVERSE_ALPHA = Object.fromEntries(
  Object.entries(BRAILLE_MAP)
    .filter(([k]) => /^[A-Z ]$/.test(k))
    .map(([k, v]) => [v, k])
);

const REVERSE_NUM = Object.fromEntries(
  Object.entries(BRAILLE_MAP)
    .filter(([k]) => /^[0-9]$/.test(k))
    .map(([k, v]) => [v, k])
);

export function brailleEncode(input) {
  let result = '';
  let inNumber = false;

  for (const ch of input.toUpperCase()) {
    if (/[0-9]/.test(ch)) {
      if (!inNumber) {
        result += NUM_PREFIX;
        inNumber = true;
      }
      result += BRAILLE_MAP[ch] || '';
    } else {
      inNumber = false;
      result += BRAILLE_MAP[ch] || '';
    }
  }

  return result;
}

export function brailleDecode(input) {
  let result = '';
  let inNumber = false;

  for (const ch of input) {
    if (ch === NUM_PREFIX) {
      inNumber = true;
      continue;
    }

    if (ch === '\u2800') {
      inNumber = false;
      result += ' ';
      continue;
    }

    if (inNumber && REVERSE_NUM[ch] !== undefined) {
      result += REVERSE_NUM[ch];
    } else {
      inNumber = false;
      result += REVERSE_ALPHA[ch] || '';
    }
  }

  return result;
}
