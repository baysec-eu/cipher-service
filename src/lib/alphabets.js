// Alphabet definitions for different languages to support international cipher operations

// Standard English alphabet
export const ENGLISH_ALPHABET = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  length: 26
};

// Polish alphabet (33 letters)
export const POLISH_ALPHABET = {
  upper: 'AĄBCĆDEĘFGHIJKLŁMNŃOÓPRSŚTUWYZŹŻ',
  lower: 'aąbcćdeęfghijklłmnńoóprsśtuwyzźż',
  length: 33,
  mapping: {
    // Polish diacritics mapping for normalization
    'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
    'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
  }
};

// German alphabet (30 letters including umlauts and ß)
export const GERMAN_ALPHABET = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜß',
  lower: 'abcdefghijklmnopqrstuvwxyzäöüß',
  length: 30
};

// French alphabet (26 + accented characters)
export const FRENCH_ALPHABET = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZÀÂÄÇÉÈÊËÏÎÔÙÛÜŸ',
  lower: 'abcdefghijklmnopqrstuvwxyzàâäçéèêëïîôùûüÿ',
  length: 42
};

// Spanish alphabet (27 letters including ñ)
export const SPANISH_ALPHABET = {
  upper: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnñopqrstuvwxyz', 
  length: 27
};

// Turkish alphabet (29 letters)
export const TURKISH_ALPHABET = {
  upper: 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ',
  lower: 'abcçdefgğhıijklmnoöprsştuüvyz',
  length: 29,
  mapping: {
    // Turkish specific mappings
    'ı': 'i', 'İ': 'I', 'ğ': 'g', 'Ğ': 'G', 'ü': 'u', 'Ü': 'U',
    'ş': 's', 'Ş': 'S', 'ö': 'o', 'Ö': 'O', 'ç': 'c', 'Ç': 'C'
  }
};

// Cyrillic alphabet (33 letters) 
export const CYRILLIC_ALPHABET = {
  upper: 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
  lower: 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя',
  length: 33
};

// Greek alphabet (24 letters)
export const GREEK_ALPHABET = {
  upper: 'ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ',
  lower: 'αβγδεζηθικλμνξοπρστυφχψω',
  length: 24
};

// Alphabet utility functions
export const alphabetUtils = {
  // Get alphabet by language code
  getAlphabet: (language = 'english') => {
    const alphabets = {
      english: ENGLISH_ALPHABET,
      polish: POLISH_ALPHABET,
      german: GERMAN_ALPHABET,
      french: FRENCH_ALPHABET,
      spanish: SPANISH_ALPHABET,
      turkish: TURKISH_ALPHABET,
      cyrillic: CYRILLIC_ALPHABET,
      greek: GREEK_ALPHABET
    };
    return alphabets[language.toLowerCase()] || ENGLISH_ALPHABET;
  },

  // Check if character is in alphabet
  isInAlphabet: (char, alphabet) => {
    return alphabet.upper.includes(char) || alphabet.lower.includes(char);
  },

  // Get character position in alphabet
  getCharPosition: (char, alphabet) => {
    const upperPos = alphabet.upper.indexOf(char);
    const lowerPos = alphabet.lower.indexOf(char);
    return upperPos !== -1 ? upperPos : lowerPos;
  },

  // Get character at position in alphabet
  getCharAtPosition: (position, isUpper, alphabet) => {
    const normalizedPos = ((position % alphabet.length) + alphabet.length) % alphabet.length;
    return isUpper ? alphabet.upper[normalizedPos] : alphabet.lower[normalizedPos];
  },

  // Normalize diacritics (for Polish, Turkish, etc.)
  normalizeDiacritics: (text, alphabet) => {
    if (!alphabet.mapping) return text;
    
    return text.split('').map(char => {
      return alphabet.mapping[char] || char;
    }).join('');
  },

  // Convert between alphabets (transliteration)
  transliterate: (text, fromAlphabet, toAlphabet) => {
    return text.split('').map(char => {
      const position = alphabetUtils.getCharPosition(char, fromAlphabet);
      if (position === -1) return char;
      
      const isUpper = fromAlphabet.upper.includes(char);
      return alphabetUtils.getCharAtPosition(position, isUpper, toAlphabet);
    }).join('');
  }
};

// International cipher implementations using custom alphabets
export const internationalCiphers = {
  // Caesar cipher with custom alphabet
  caesarWithAlphabet: (text, shift = 3, alphabet = ENGLISH_ALPHABET) => {
    return text.split('').map(char => {
      const position = alphabetUtils.getCharPosition(char, alphabet);
      if (position === -1) return char;
      
      const isUpper = alphabet.upper.includes(char);
      const newPosition = position + shift;
      return alphabetUtils.getCharAtPosition(newPosition, isUpper, alphabet);
    }).join('');
  },

  // ROT13 equivalent for any alphabet
  rotNWithAlphabet: (text, n = null, alphabet = ENGLISH_ALPHABET) => {
    const rotation = n || Math.floor(alphabet.length / 2);
    return internationalCiphers.caesarWithAlphabet(text, rotation, alphabet);
  },

  // Atbash cipher with custom alphabet
  atbashWithAlphabet: (text, alphabet = ENGLISH_ALPHABET) => {
    return text.split('').map(char => {
      const position = alphabetUtils.getCharPosition(char, alphabet);
      if (position === -1) return char;
      
      const isUpper = alphabet.upper.includes(char);
      const reversedPosition = alphabet.length - 1 - position;
      return alphabetUtils.getCharAtPosition(reversedPosition, isUpper, alphabet);
    }).join('');
  },

  // Vigenère cipher with custom alphabet
  vigenereWithAlphabet: (text, key, encode = true, alphabet = ENGLISH_ALPHABET) => {
    if (!key) return text;
    
    let keyIndex = 0;
    return text.split('').map(char => {
      const charPosition = alphabetUtils.getCharPosition(char, alphabet);
      if (charPosition === -1) return char;
      
      const keyChar = key[keyIndex % key.length].toUpperCase();
      const keyPosition = alphabetUtils.getCharPosition(keyChar, alphabet);
      
      if (keyPosition === -1) {
        keyIndex++;
        return char;
      }
      
      const isUpper = alphabet.upper.includes(char);
      let newPosition;
      
      if (encode) {
        newPosition = charPosition + keyPosition;
      } else {
        newPosition = charPosition - keyPosition;
      }
      
      keyIndex++;
      return alphabetUtils.getCharAtPosition(newPosition, isUpper, alphabet);
    }).join('');
  },

  // Affine cipher with custom alphabet
  affineWithAlphabet: (text, a = 5, b = 8, encode = true, alphabet = ENGLISH_ALPHABET) => {
    // Check if a is coprime with alphabet length
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    if (gcd(a, alphabet.length) !== 1) {
      throw new Error(`'a' value ${a} is not coprime with alphabet length ${alphabet.length}`);
    }

    // Modular multiplicative inverse
    const modInverse = (a, m) => {
      for (let x = 1; x < m; x++) {
        if ((a * x) % m === 1) return x;
      }
      return 1;
    };

    return text.split('').map(char => {
      const position = alphabetUtils.getCharPosition(char, alphabet);
      if (position === -1) return char;
      
      const isUpper = alphabet.upper.includes(char);
      let newPosition;
      
      if (encode) {
        newPosition = (a * position + b) % alphabet.length;
      } else {
        const aInverse = modInverse(a, alphabet.length);
        newPosition = (aInverse * (position - b + alphabet.length)) % alphabet.length;
      }
      
      return alphabetUtils.getCharAtPosition(newPosition, isUpper, alphabet);
    }).join('');
  }
};

export default {
  ENGLISH_ALPHABET,
  POLISH_ALPHABET,
  GERMAN_ALPHABET,
  FRENCH_ALPHABET,
  SPANISH_ALPHABET,
  TURKISH_ALPHABET,
  CYRILLIC_ALPHABET,
  GREEK_ALPHABET,
  alphabetUtils,
  internationalCiphers
};