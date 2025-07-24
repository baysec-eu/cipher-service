// Unicode directional override and embedding operations
// Homoglyph generation including Turkish letter substitutions

// Unicode directional formatting characters
const UNICODE_BIDI_CONTROLS = {
  LRO: '\u202D', // Left-to-Right Override
  RLO: '\u202E', // Right-to-Left Override
  LRE: '\u202A', // Left-to-Right Embedding
  RLE: '\u202B', // Right-to-Left Embedding
  PDF: '\u202C', // Pop Directional Formatting
  LRI: '\u2066', // Left-to-Right Isolate
  RLI: '\u2067', // Right-to-Left Isolate
  FSI: '\u2068', // First Strong Isolate
  PDI: '\u2069'  // Pop Directional Isolate
};

// Turkish letter homoglyphs and similar characters
const TURKISH_HOMOGLYPHS = {
  'I': ['İ', 'Ι', 'Ӏ', '𝐈', '𝐼', '𝑰', '𝒊', '𝓘', '𝕀', '𝗜', '𝘐', '𝙄'],
  'i': ['ı', 'і', '𝐢', '𝑖', '𝒾', '𝓲', '𝔦', '𝕚', '𝗂', '𝗶', '𝘪', '𝙞'],
  'O': ['Ο', 'О', '𝐎', '𝑂', '𝑶', '𝒪', '𝓞', '𝕆', '𝗢', '𝘖', '𝙊'],
  'o': ['ο', 'о', '𝐨', '𝑜', '𝒐', '𝓸', '𝔬', '𝕠', '𝗈', '𝗼', '𝘰', '𝙤'],
  'A': ['Α', 'А', '𝐀', '𝐴', '𝑨', '𝒜', '𝓐', '𝔸', '𝗔', '𝘈', '𝘼'],
  'a': ['α', 'а', '𝐚', '𝑎', '𝒂', '𝓪', '𝔞', '𝕒', '𝖆', '𝗮', '𝘢', '𝙖'],
  'E': ['Ε', 'Е', '𝐄', '𝐸', '𝑬', '𝒠', '𝓔', '𝔼', '𝗘', '𝘌', '𝙀'],
  'e': ['ε', 'е', '𝐞', '𝑒', '𝒆', '𝓮', '𝔢', '𝕖', '𝖊', '𝗲', '𝘦', '𝙚'],
  'P': ['Ρ', 'Р', '𝐏', '𝑃', '𝑷', '𝒫', '𝓟', '𝔓', '𝗣', '𝘗', '𝙋'],
  'p': ['ρ', 'р', '𝐩', '𝑝', '𝒑', '𝓹', '𝔭', '𝕡', '𝖕', '𝗽', '𝘱', '𝙥'],
  'T': ['Τ', 'Т', '𝐓', '𝑇', '𝑻', '𝒯', '𝓣', '𝔗', '𝗧', '𝘛', '𝙏'],
  'H': ['Η', 'Н', '𝐇', '𝐻', '𝑯', '𝒽', '𝓗', '𝔥', '𝗛', '𝘏', '𝙃'],
  'B': ['Β', 'В', '𝐁', '𝐵', '𝑩', '𝒷', '𝓑', '𝔅', '𝗕', '𝘉', '𝘽'],
  'K': ['Κ', 'К', '𝐊', '𝐾', '𝑲', '𝒦', '𝓚', '𝔎', '𝗞', '𝘒', '𝙆'],
  'M': ['Μ', 'М', '𝐌', '𝑀', '𝑴', '𝒨', '𝓜', '𝔐', '𝗠', '𝘔', '𝙈'],
  'N': ['Ν', 'Н', '𝐍', '𝑁', '𝑵', '𝒩', '𝓝', '𝔑', '𝗡', '𝘕', '𝙉'],
  'X': ['Χ', 'Х', '𝐗', '𝑋', '𝑿', '𝒳', '𝓧', '𝔛', '𝗫', '𝘟', '𝙓'],
  'Y': ['Υ', 'У', '𝐘', '𝑌', '𝒀', '𝒴', '𝓨', '𝔜', '𝗬', '𝘠', '𝙔'],
  'Z': ['Ζ', 'З', '𝐙', '𝑍', '𝒁', '𝒵', '𝓩', '𝔷', '𝗭', '𝘡', '𝙕'],
  // Turkish-specific characters
  'Ç': ['Ĉ', 'Č', 'Ć', '𝐂', '𝐶', '𝑪', '𝒞', '𝓒', '𝔠', '𝗖', '𝘊', '𝘾'],
  'ç': ['ĉ', 'č', 'ć', '𝐜', '𝑐', '𝒄', '𝓬', '𝔞', '𝕔', '𝖈', '𝗰', '𝘤'],
  'Ğ': ['Ĝ', 'Ģ', 'Ġ', '𝐆', '𝐺', '𝑮', '𝒢', '𝓖', '𝔾', '𝗚', '𝘎', '𝙂'],
  'ğ': ['ĝ', 'ģ', 'ġ', '𝐠', '𝑔', '𝒈', '𝓰', '𝔤', '𝕘', '𝖌', '𝗴', '𝘨'],
  'İ': ['I', 'Ι', 'Ӏ', '𝐈', '𝐼', '𝑰', '𝒊', '𝓘', '𝕀', '𝗜', '𝘐', '𝙄'],
  'ı': ['i', 'і', '𝐢', '𝑖', '𝒾', '𝓲', '𝔦', '𝕚', '𝗂', '𝗶', '𝘪', '𝙞'],
  'Ö': ['Ò', 'Ó', 'Ô', 'Õ', 'Ø', '𝐎', '𝑂', '𝑶', '𝒪', '𝓞', '𝕆', '𝗢'],
  'ö': ['ò', 'ó', 'ô', 'õ', 'ø', '𝐨', '𝑜', '𝒐', '𝓸', '𝔬', '𝕠', '𝗼'],
  'Ş': ['Ŝ', 'Š', 'Ś', '𝐒', '𝑆', '𝑺', '𝒮', '𝓢', '𝔖', '𝗦', '𝘚', '𝙎'],
  'ş': ['ŝ', 'š', 'ś', '𝐬', '𝑠', '𝒔', '𝓼', '𝔰', '𝕤', '𝖘', '𝘀', '𝘴'],
  'Ü': ['Ù', 'Ú', 'Û', 'Ũ', '𝐔', '𝑈', '𝑼', '𝒰', '𝓤', '𝔘', '𝗨', '𝘜'],
  'ü': ['ù', 'ú', 'û', 'ũ', '𝐮', '𝑢', '𝒖', '𝓾', '𝔲', '𝕦', '𝖚', '𝘂']
};

// Extended homoglyph mappings for common Latin characters
const LATIN_HOMOGLYPHS = {
  'A': ['А', 'Α', 'Ꭺ', '𝐀', '𝐴', '𝑨', '𝒜', '𝓐', '𝔸', '𝕬', '𝖠', '𝗔', '𝘈', '𝘼'],
  'B': ['В', 'Β', 'Ᏼ', '𝐁', '𝐵', '𝑩', '𝒷', '𝓑', '𝔅', '𝔹', '𝕭', '𝖡', '𝗕', '𝘉', '𝘽'],
  'C': ['С', 'Ⅽ', 'Ꮯ', '𝐂', '𝐶', '𝑪', '𝒞', '𝓒', '𝔠', '𝕮', '𝖢', '𝗖', '𝘊', '𝘾'],
  'D': ['Ꭰ', '𝐃', '𝐷', '𝑫', '𝒟', '𝓓', '𝔇', '𝔻', '𝕯', '𝖣', '𝗗', '𝘋', '𝘿'],
  'E': ['Е', 'Ε', 'Ꭼ', '𝐄', '𝐸', '𝑬', '𝒠', '𝓔', '𝔼', '𝔈', '𝕰', '𝖤', '𝗘', '𝘌', '𝙀'],
  'F': ['Ϝ', 'ℱ', '𝐅', '𝐹', '𝑭', '𝒻', '𝓕', '𝔉', '𝔽', '𝕱', '𝖥', '𝗙', '𝘍', '𝙁'],
  'G': ['Ԍ', '𝐆', '𝐺', '𝑮', '𝒢', '𝓖', '𝔾', '𝔊', '𝕲', '𝖦', '𝗚', '𝘎', '𝙂'],
  'H': ['Н', 'Η', 'Ꮋ', '𝐇', '𝐻', '𝑯', '𝒽', '𝓗', '𝔥', '𝖧', '𝗛', '𝘏', '𝙃'],
  'I': ['І', 'Ι', 'Ӏ', 'Ꭵ', '𝐈', '𝐼', '𝑰', '𝒊', '𝓘', '𝕀', '𝖨', '𝗜', '𝘐', '𝙄'],
  'J': ['Ј', 'Ꭻ', '𝐉', '𝐽', '𝑱', '𝒿', '𝓙', '𝔍', '𝕁', '𝕵', '𝖩', '𝗝', '𝘑', '𝙅'],
  'K': ['К', 'Κ', 'Ꮶ', '𝐊', '𝐾', '𝑲', '𝒦', '𝓚', '𝔎', '𝕂', '𝕶', '𝖪', '𝗞', '𝘒', '𝙆'],
  'L': ['Ꮮ', '𝐋', '𝐿', '𝑳', '𝒷', '𝓛', '𝔏', '𝕃', '𝕷', '𝖫', '𝗟', '𝘓', '𝙇'],
  'M': ['М', 'Μ', 'Ꮇ', '𝐌', '𝑀', '𝑴', '𝒨', '𝓜', '𝔐', '𝕄', '𝕸', '𝖬', '𝗠', '𝘔', '𝙈'],
  'N': ['Ν', 'ℕ', '𝐍', '𝑁', '𝑵', '𝒩', '𝓝', '𝔑', '𝕹', '𝖭', '𝗡', '𝘕', '𝙉'],
  'O': ['О', 'Ο', 'Ⲟ', '𝐎', '𝑂', '𝑶', '𝒪', '𝓞', '𝔒', '𝕆', '𝕺', '𝗢', '𝘖', '𝙊'],
  'P': ['Р', 'Ρ', 'Ꮲ', 'ℙ', '𝐏', '𝑃', '𝑷', '𝒫', '𝓟', '𝔓', '𝕻', '𝖯', '𝗣', '𝘗', '𝙋'],
  'Q': ['ℚ', '𝐐', '𝑄', '𝑸', '𝒬', '𝓠', '𝔔', '𝕼', '𝖰', '𝗤', '𝘘', '𝙌'],
  'R': ['Ꭱ', 'ℝ', '𝐑', '𝑅', '𝑹', '𝒯', '𝓡', '𝔯', '𝖱', '𝗥', '𝘙', '𝙍'],
  'S': ['Ѕ', 'Ꮪ', '𝐒', '𝑆', '𝑺', '𝒮', '𝓢', '𝔖', '𝒮', '𝔰', '𝖲', '𝗦', '𝘚', '𝙎'],
  'T': ['Т', 'Τ', 'Ꭲ', '𝐓', '𝑇', '𝑻', '𝒯', '𝓣', '𝔗', '𝕋', '𝖳', '𝗧', '𝘛', '𝙏'],
  'U': ['Ս', '𝐔', '𝑈', '𝑼', '𝒰', '𝓤', '𝔘', '𝕌', '𝖀', '𝖴', '𝗨', '𝘜', '𝙐'],
  'V': ['Ѵ', 'Ꮩ', '𝐕', '𝑉', '𝑽', '𝒱', '𝓥', '𝔙', '𝕍', '𝖁', '𝖵', '𝗩', '𝘝', '𝙑'],
  'W': ['Ꮃ', '𝐖', '𝑊', '𝑾', '𝒲', '𝓦', '𝔚', '𝕎', '𝖂', '𝖶', '𝗪', '𝘞', '𝙒'],
  'X': ['Х', 'Χ', 'Ꭓ', '𝐗', '𝑋', '𝑿', '𝒳', '𝓧', '𝔛', '𝕏', '𝖃', '𝖷', '𝗫', '𝘟', '𝙓'],
  'Y': ['У', 'Υ', 'Ꭹ', '𝐘', '𝑌', '𝒀', '𝒴', '𝓨', '𝔜', '𝖄', '𝖸', '𝗬', '𝘠', '𝙔'],
  'Z': ['Ζ', 'ℤ', '𝐙', '𝑍', '𝒁', '𝒵', '𝓩', '𝔷', '𝖅', '𝖹', '𝗭', '𝘡', '𝙕']
};

// Unicode directional override operations
export const unicodeDirectional = {
  // Left-to-Right Override
  ltrOverride: (input) => {
    return UNICODE_BIDI_CONTROLS.LRO + input + UNICODE_BIDI_CONTROLS.PDF;
  },

  // Right-to-Left Override
  rtlOverride: (input) => {
    return UNICODE_BIDI_CONTROLS.RLO + input + UNICODE_BIDI_CONTROLS.PDF;
  },

  // Left-to-Right Embedding
  ltrEmbedding: (input) => {
    return UNICODE_BIDI_CONTROLS.LRE + input + UNICODE_BIDI_CONTROLS.PDF;
  },

  // Right-to-Left Embedding
  rtlEmbedding: (input) => {
    return UNICODE_BIDI_CONTROLS.RLE + input + UNICODE_BIDI_CONTROLS.PDF;
  },

  // Left-to-Right Isolate
  ltrIsolate: (input) => {
    return UNICODE_BIDI_CONTROLS.LRI + input + UNICODE_BIDI_CONTROLS.PDI;
  },

  // Right-to-Left Isolate
  rtlIsolate: (input) => {
    return UNICODE_BIDI_CONTROLS.RLI + input + UNICODE_BIDI_CONTROLS.PDI;
  },

  // First Strong Isolate
  firstStrongIsolate: (input) => {
    return UNICODE_BIDI_CONTROLS.FSI + input + UNICODE_BIDI_CONTROLS.PDI;
  },

  // Remove all directional formatting
  removeDirectional: (input) => {
    return input.replace(/[\u202A-\u202E\u2066-\u2069]/g, '');
  },

  // Show directional characters (for debugging)
  showDirectional: (input) => {
    return input
      .replace(/\u202A/g, '[LRE]')
      .replace(/\u202B/g, '[RLE]')
      .replace(/\u202C/g, '[PDF]')
      .replace(/\u202D/g, '[LRO]')
      .replace(/\u202E/g, '[RLO]')
      .replace(/\u2066/g, '[LRI]')
      .replace(/\u2067/g, '[RLI]')
      .replace(/\u2068/g, '[FSI]')
      .replace(/\u2069/g, '[PDI]');
  }
};

// Homoglyph generation operations
export const homoglyphs = {
  // Generate Turkish homoglyphs
  turkishHomoglyphs: (input, substitutionRate = 0.3) => {
    return input.split('').map(char => {
      const homoglyphArray = TURKISH_HOMOGLYPHS[char];
      if (homoglyphArray && Math.random() < substitutionRate) {
        return homoglyphArray[Math.floor(Math.random() * homoglyphArray.length)];
      }
      return char;
    }).join('');
  },

  // Generate Latin homoglyphs
  latinHomoglyphs: (input, substitutionRate = 0.3) => {
    return input.split('').map(char => {
      const homoglyphArray = LATIN_HOMOGLYPHS[char.toUpperCase()];
      if (homoglyphArray && Math.random() < substitutionRate) {
        const selected = homoglyphArray[Math.floor(Math.random() * homoglyphArray.length)];
        // Preserve case
        return char === char.toLowerCase() ? selected.toLowerCase() : selected;
      }
      return char;
    }).join('');
  },

  // Generate all available homoglyphs for a character
  getAllHomoglyphs: (char) => {
    const turkishOptions = TURKISH_HOMOGLYPHS[char] || [];
    const latinOptions = LATIN_HOMOGLYPHS[char.toUpperCase()] || [];
    return [...new Set([...turkishOptions, ...latinOptions])];
  },

  // Replace specific character with homoglyph
  replaceWithHomoglyph: (input, char, homoglyphIndex = 0) => {
    const allHomoglyphs = homoglyphs.getAllHomoglyphs(char);
    if (allHomoglyphs.length > homoglyphIndex) {
      const replacement = allHomoglyphs[homoglyphIndex];
      return input.replace(new RegExp(char, 'g'), replacement);
    }
    return input;
  },

  // Create confusable text (high substitution rate)
  confusableText: (input, substitutionRate = 0.8) => {
    return input.split('').map(char => {
      const allHomoglyphs = homoglyphs.getAllHomoglyphs(char);
      if (allHomoglyphs.length > 0 && Math.random() < substitutionRate) {
        return allHomoglyphs[Math.floor(Math.random() * allHomoglyphs.length)];
      }
      return char;
    }).join('');
  },

  // Mixed script attack (combine different writing systems)
  mixedScriptAttack: (input) => {
    const scripts = ['latin', 'cyrillic', 'greek'];
    return input.split('').map(char => {
      const allHomoglyphs = homoglyphs.getAllHomoglyphs(char);
      if (allHomoglyphs.length > 0) {
        // Select homoglyph from different script
        const scriptFiltered = allHomoglyphs.filter(h => {
          // Simple heuristic to detect script
          if (/[А-Я]/.test(h)) return 'cyrillic';
          if (/[Α-Ω]/.test(h)) return 'greek';
          return 'latin';
        });
        if (scriptFiltered.length > 0) {
          return scriptFiltered[Math.floor(Math.random() * scriptFiltered.length)];
        }
        return allHomoglyphs[Math.floor(Math.random() * allHomoglyphs.length)];
      }
      return char;
    }).join('');
  }
};

// Combined Unicode operations export
export const unicodeOperations = [
  // Directional operations
  {
    id: 'unicode_ltr_override',
    name: 'Unicode LTR Override',
    type: 'unicode',
    category: 'unicode',
    func: unicodeDirectional.ltrOverride
  },
  {
    id: 'unicode_rtl_override', 
    name: 'Unicode RTL Override',
    type: 'unicode',
    category: 'unicode',
    func: unicodeDirectional.rtlOverride
  },
  {
    id: 'unicode_ltr_embedding',
    name: 'Unicode LTR Embedding',
    type: 'unicode', 
    category: 'unicode',
    func: unicodeDirectional.ltrEmbedding
  },
  {
    id: 'unicode_rtl_embedding',
    name: 'Unicode RTL Embedding',
    type: 'unicode',
    category: 'unicode', 
    func: unicodeDirectional.rtlEmbedding
  },
  {
    id: 'unicode_ltr_isolate',
    name: 'Unicode LTR Isolate',
    type: 'unicode',
    category: 'unicode',
    func: unicodeDirectional.ltrIsolate
  },
  {
    id: 'unicode_rtl_isolate',
    name: 'Unicode RTL Isolate', 
    type: 'unicode',
    category: 'unicode',
    func: unicodeDirectional.rtlIsolate
  },
  {
    id: 'unicode_first_strong_isolate',
    name: 'Unicode First Strong Isolate',
    type: 'unicode',
    category: 'unicode',
    func: unicodeDirectional.firstStrongIsolate
  },
  {
    id: 'unicode_remove_directional',
    name: 'Remove Unicode Directional',
    type: 'unicode',
    category: 'unicode',
    func: unicodeDirectional.removeDirectional
  },
  {
    id: 'unicode_show_directional',
    name: 'Show Unicode Directional',
    type: 'unicode', 
    category: 'unicode',
    func: unicodeDirectional.showDirectional
  },

  // Homoglyph operations
  {
    id: 'turkish_homoglyphs',
    name: 'Turkish Homoglyphs',
    type: 'homoglyph',
    category: 'homoglyphs',
    func: (input, substitutionRate = 30) => homoglyphs.turkishHomoglyphs(input, substitutionRate / 100),
    params: ['substitutionRate']
  },
  {
    id: 'latin_homoglyphs', 
    name: 'Latin Homoglyphs',
    type: 'homoglyph',
    category: 'homoglyphs',
    func: (input, substitutionRate = 30) => homoglyphs.latinHomoglyphs(input, substitutionRate / 100),
    params: ['substitutionRate']
  },
  {
    id: 'confusable_text',
    name: 'Confusable Text',
    type: 'homoglyph',
    category: 'homoglyphs', 
    func: (input, substitutionRate = 80) => homoglyphs.confusableText(input, substitutionRate / 100),
    params: ['substitutionRate']
  },
  {
    id: 'mixed_script_attack',
    name: 'Mixed Script Attack',
    type: 'homoglyph',
    category: 'homoglyphs',
    func: homoglyphs.mixedScriptAttack
  },
  {
    id: 'replace_with_homoglyph',
    name: 'Replace with Homoglyph',
    type: 'homoglyph',
    category: 'homoglyphs',
    func: (input, char = 'A', homoglyphIndex = 0) => homoglyphs.replaceWithHomoglyph(input, char, parseInt(homoglyphIndex)),
    params: ['char', 'homoglyphIndex']
  }
];

export default { unicodeDirectional, homoglyphs, unicodeOperations, UNICODE_BIDI_CONTROLS, TURKISH_HOMOGLYPHS, LATIN_HOMOGLYPHS };