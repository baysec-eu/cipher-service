const NATO_MAP = {
  'A': 'Alpha',   'B': 'Bravo',    'C': 'Charlie', 'D': 'Delta',
  'E': 'Echo',    'F': 'Foxtrot',  'G': 'Golf',    'H': 'Hotel',
  'I': 'India',   'J': 'Juliet',   'K': 'Kilo',    'L': 'Lima',
  'M': 'Mike',    'N': 'November', 'O': 'Oscar',   'P': 'Papa',
  'Q': 'Quebec',  'R': 'Romeo',    'S': 'Sierra',  'T': 'Tango',
  'U': 'Uniform', 'V': 'Victor',   'W': 'Whiskey', 'X': 'X-ray',
  'Y': 'Yankee',  'Z': 'Zulu',

  '0': 'Zero',  '1': 'One',   '2': 'Two',   '3': 'Three',
  '4': 'Four',  '5': 'Five',  '6': 'Six',   '7': 'Seven',
  '8': 'Eight', '9': 'Niner',
};

const REVERSE_NATO = Object.fromEntries(
  Object.entries(NATO_MAP).map(([k, v]) => [v.toUpperCase(), k])
);

export function natoEncode(input) {
  return input
    .toUpperCase()
    .split('')
    .map(ch => {
      if (ch === ' ') return '(space)';
      return NATO_MAP[ch] || '';
    })
    .filter(Boolean)
    .join(' ');
}

export function natoDecode(input) {
  return input
    .split(/\s+/)
    .map(word => {
      if (word.toLowerCase() === '(space)') return ' ';
      return REVERSE_NATO[word.toUpperCase()] || '';
    })
    .join('');
}
