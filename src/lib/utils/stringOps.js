// String manipulation operations - CyberChef parity

// Find / Replace (regex or literal)
export function findReplace(input, find = '', replace = '', isRegex = 'false', global = 'true', caseInsensitive = 'false') {
  if (!find) return input;
  if (isRegex === 'true') {
    let flags = '';
    if (global === 'true') flags += 'g';
    if (caseInsensitive === 'true') flags += 'i';
    return input.replace(new RegExp(find, flags), replace);
  }
  if (global === 'true') return input.split(find).join(replace);
  const idx = input.indexOf(find);
  if (idx === -1) return input;
  return input.slice(0, idx) + replace + input.slice(idx + find.length);
}

// Remove whitespace
export function removeWhitespace(input, spaces = 'true', tabs = 'true', newlines = 'true') {
  let result = input;
  if (spaces === 'true') result = result.replace(/ /g, '');
  if (tabs === 'true') result = result.replace(/\t/g, '');
  if (newlines === 'true') result = result.replace(/[\r\n]/g, '');
  return result;
}

// Remove null bytes
export function removeNullBytes(input) {
  return input.replace(/\0/g, '');
}

// Remove non-printable characters
export function removeNonPrintable(input) {
  return input.replace(/[^\x20-\x7E\n\r\t]/g, '');
}

// Pad string
export function padString(input, length = 16, char = '0', position = 'left') {
  const len = parseInt(length) || 16;
  const c = char || '0';
  if (position === 'right') return input.padEnd(len, c);
  return input.padStart(len, c);
}

// Truncate
export function truncate(input, length = 100, suffix = '...') {
  const len = parseInt(length) || 100;
  if (input.length <= len) return input;
  return input.slice(0, len) + (suffix || '');
}

// Count occurrences
export function countOccurrences(input, search = '') {
  if (!search) return `Input length: ${input.length}`;
  const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = input.match(new RegExp(escaped, 'g'));
  return `"${search}" found ${matches ? matches.length : 0} times`;
}

// Split
export function splitString(input, delimiter = ',', index = '') {
  const parts = input.split(delimiter);
  if (index !== '' && index !== undefined) {
    const i = parseInt(index);
    return parts[i] || '';
  }
  return parts.join('\n');
}

// Substring / Slice
export function substring(input, start = 0, end = '') {
  const s = parseInt(start) || 0;
  if (end === '' || end === undefined) return input.slice(s);
  return input.slice(s, parseInt(end));
}

// Repeat
export function repeatString(input, count = 2, separator = '') {
  const n = Math.min(parseInt(count) || 2, 10000);
  return Array(n).fill(input).join(separator || '');
}

// To Upper/Lower/Title case
export function toUpperCase(input) { return input.toUpperCase(); }
export function toLowerCase(input) { return input.toLowerCase(); }
export function toTitleCase(input) {
  return input.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}
export function toCamelCase(input) {
  return input.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '').replace(/^./, c => c.toLowerCase());
}
export function toSnakeCase(input) {
  return input.replace(/([A-Z])/g, '_$1').replace(/[-\s]+/g, '_').toLowerCase().replace(/^_/, '');
}
export function toKebabCase(input) {
  return input.replace(/([A-Z])/g, '-$1').replace(/[_\s]+/g, '-').toLowerCase().replace(/^-/, '');
}

// Line numbering
export function addLineNumbers(input, start = 1, separator = ': ') {
  const s = parseInt(start) || 1;
  return input.split('\n').map((line, i) => `${i + s}${separator}${line}`).join('\n');
}

// Remove line numbers
export function removeLineNumbers(input) {
  return input.split('\n').map(line => line.replace(/^\s*\d+[\s:.)\-\t]+/, '')).join('\n');
}

// Escape / Unescape string
export function escapeString(input) {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\0/g, '\\0');
}

export function unescapeString(input) {
  return input
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\0/g, '\0')
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\');
}

// Swap endianness (hex pairs)
export function swapEndianness(input, wordSize = 4) {
  const ws = parseInt(wordSize) || 4;
  const hex = input.replace(/\s/g, '').replace(/^0x/i, '');
  if (!/^[0-9a-fA-F]+$/.test(hex)) return 'Error: Input must be hex';
  if (hex.length % 2 !== 0) return 'Error: Hex must have even length';

  const bytes = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(hex.slice(i, i + 2));
  }

  const result = [];
  for (let i = 0; i < bytes.length; i += ws) {
    const word = bytes.slice(i, i + ws);
    result.push(...word.reverse());
  }
  return result.join('');
}

// Detect file type from magic bytes (hex input)
export function detectFileType(input) {
  const hex = input.replace(/\s/g, '').toLowerCase();
  const magicBytes = [
    { sig: '89504e47', ext: 'PNG', mime: 'image/png' },
    { sig: 'ffd8ff', ext: 'JPEG', mime: 'image/jpeg' },
    { sig: '47494638', ext: 'GIF', mime: 'image/gif' },
    { sig: '25504446', ext: 'PDF', mime: 'application/pdf' },
    { sig: '504b0304', ext: 'ZIP/DOCX/XLSX/JAR', mime: 'application/zip' },
    { sig: '504b0506', ext: 'ZIP (empty)', mime: 'application/zip' },
    { sig: '1f8b', ext: 'GZIP', mime: 'application/gzip' },
    { sig: '377abcaf271c', ext: '7z', mime: 'application/x-7z-compressed' },
    { sig: '526172211a07', ext: 'RAR', mime: 'application/vnd.rar' },
    { sig: '4d5a', ext: 'EXE/DLL (PE)', mime: 'application/x-msdownload' },
    { sig: '7f454c46', ext: 'ELF', mime: 'application/x-elf' },
    { sig: 'cafebabe', ext: 'Java class / Mach-O fat', mime: 'application/java-vm' },
    { sig: 'feedface', ext: 'Mach-O (32-bit)', mime: 'application/x-mach-binary' },
    { sig: 'feedfacf', ext: 'Mach-O (64-bit)', mime: 'application/x-mach-binary' },
    { sig: 'cefaedfe', ext: 'Mach-O (32-bit, reversed)', mime: 'application/x-mach-binary' },
    { sig: 'cffaedfe', ext: 'Mach-O (64-bit, reversed)', mime: 'application/x-mach-binary' },
    { sig: '49492a00', ext: 'TIFF (LE)', mime: 'image/tiff' },
    { sig: '4d4d002a', ext: 'TIFF (BE)', mime: 'image/tiff' },
    { sig: '424d', ext: 'BMP', mime: 'image/bmp' },
    { sig: '52494646', ext: 'RIFF (WAV/AVI/WebP)', mime: 'application/octet-stream' },
    { sig: '4f676753', ext: 'OGG', mime: 'audio/ogg' },
    { sig: 'fffe', ext: 'UTF-16 LE BOM', mime: 'text/plain' },
    { sig: 'feff', ext: 'UTF-16 BE BOM', mime: 'text/plain' },
    { sig: 'efbbbf', ext: 'UTF-8 BOM', mime: 'text/plain' },
    { sig: '000001ba', ext: 'MPEG', mime: 'video/mpeg' },
    { sig: '000001b3', ext: 'MPEG', mime: 'video/mpeg' },
    { sig: '1a45dfa3', ext: 'MKV/WebM', mime: 'video/x-matroska' },
    { sig: '667479704d534e56', ext: 'MP4', mime: 'video/mp4' },
    { sig: '66747970', ext: 'MP4/M4A/MOV', mime: 'video/mp4' },
    { sig: '494433', ext: 'MP3 (ID3)', mime: 'audio/mpeg' },
    { sig: 'fffb', ext: 'MP3', mime: 'audio/mpeg' },
    { sig: 'fff3', ext: 'MP3', mime: 'audio/mpeg' },
    { sig: 'fff2', ext: 'MP3', mime: 'audio/mpeg' },
    { sig: '464c4143', ext: 'FLAC', mime: 'audio/flac' },
    { sig: '53514c69746520666f726d6174', ext: 'SQLite', mime: 'application/x-sqlite3' },
    { sig: 'd0cf11e0a1b11ae1', ext: 'MS Office (OLE2)', mime: 'application/msword' },
    { sig: '7b5c727466', ext: 'RTF', mime: 'application/rtf' },
    { sig: '3c3f786d6c', ext: 'XML', mime: 'text/xml' },
    { sig: '3c21444f43545950', ext: 'HTML', mime: 'text/html' },
    { sig: '3c68746d6c', ext: 'HTML', mime: 'text/html' },
    { sig: '2321', ext: 'Script (shebang)', mime: 'text/x-shellscript' },
    { sig: '28b52ffd', ext: 'ZSTD', mime: 'application/zstd' },
    { sig: '04224d18', ext: 'LZ4', mime: 'application/x-lz4' },
    { sig: '425a68', ext: 'BZ2', mime: 'application/x-bzip2' },
    { sig: 'fd377a585a00', ext: 'XZ', mime: 'application/x-xz' },
  ];

  const matches = magicBytes.filter(m => hex.startsWith(m.sig));
  if (matches.length === 0) return 'Unknown file type';
  return matches.map(m => `${m.ext} (${m.mime}) - magic: ${m.sig}`).join('\n');
}

// Luhn checksum (credit card validation)
export function luhnCheck(input) {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 0) return 'Error: No digits found';

  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i]);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }

  const valid = sum % 10 === 0;
  const checkDigit = (10 - (sum % 10)) % 10;

  return [
    `Input: ${digits}`,
    `Valid: ${valid}`,
    `Check digit: ${checkDigit}`,
    `Sum: ${sum}`,
    valid ? '' : `To make valid, append: ${checkDigit}`
  ].filter(Boolean).join('\n');
}

// Adler-32 checksum
export function adler32(input) {
  const data = new TextEncoder().encode(input);
  let a = 1, b = 0;
  const MOD = 65521;
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % MOD;
    b = (b + a) % MOD;
  }
  const checksum = ((b << 16) | a) >>> 0;
  return checksum.toString(16).padStart(8, '0');
}

// Fletcher-16 checksum
export function fletcher16(input) {
  const data = new TextEncoder().encode(input);
  let sum1 = 0, sum2 = 0;
  for (let i = 0; i < data.length; i++) {
    sum1 = (sum1 + data[i]) % 255;
    sum2 = (sum2 + sum1) % 255;
  }
  return ((sum2 << 8) | sum1).toString(16).padStart(4, '0');
}

// Hamming Distance
export function hammingDistance(input, compare = '') {
  if (!compare) {
    const lines = input.split('\n');
    if (lines.length < 2) return 'Error: Need two inputs (use two lines or provide compare param)';
    return computeHamming(lines[0], lines[1]);
  }
  return computeHamming(input, compare);
}

function computeHamming(a, b) {
  const bytes1 = new TextEncoder().encode(a);
  const bytes2 = new TextEncoder().encode(b);
  const maxLen = Math.max(bytes1.length, bytes2.length);
  let distance = 0;
  let bitDiff = 0;

  for (let i = 0; i < maxLen; i++) {
    const b1 = bytes1[i] || 0;
    const b2 = bytes2[i] || 0;
    if (b1 !== b2) distance++;
    let xor = b1 ^ b2;
    while (xor) { bitDiff += xor & 1; xor >>= 1; }
  }

  return [
    `Byte distance: ${distance}`,
    `Bit distance: ${bitDiff}`,
    `Length A: ${bytes1.length}`,
    `Length B: ${bytes2.length}`,
    `Similarity: ${((1 - distance / maxLen) * 100).toFixed(2)}%`
  ].join('\n');
}

// Frequency analysis
export function frequencyAnalysis(input) {
  const freq = {};
  for (const ch of input) {
    freq[ch] = (freq[ch] || 0) + 1;
  }

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const total = input.length;

  const lines = sorted.map(([ch, count]) => {
    const pct = ((count / total) * 100).toFixed(2);
    const bar = '#'.repeat(Math.min(Math.round(count / total * 50), 50));
    const display = ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : ch === '\t' ? '\\t' : ch === ' ' ? 'SP' : ch;
    return `${display.padEnd(4)} ${String(count).padStart(6)} (${pct.padStart(6)}%) ${bar}`;
  });

  return [
    `Total characters: ${total}`,
    `Unique characters: ${sorted.length}`,
    `---`,
    ...lines
  ].join('\n');
}

// Entropy calculation
export function calculateEntropy(input) {
  const freq = {};
  for (const ch of input) {
    freq[ch] = (freq[ch] || 0) + 1;
  }

  const len = input.length;
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / len;
    entropy -= p * Math.log2(p);
  }

  const maxEntropy = Math.log2(Object.keys(freq).length || 1);
  const normalized = maxEntropy > 0 ? entropy / maxEntropy : 0;

  return [
    `Shannon entropy: ${entropy.toFixed(6)} bits/char`,
    `Max possible: ${maxEntropy.toFixed(6)} bits/char`,
    `Normalized: ${(normalized * 100).toFixed(2)}%`,
    `Unique chars: ${Object.keys(freq).length}`,
    `Total chars: ${len}`,
    `Estimated strength: ${entropy < 3 ? 'Low' : entropy < 4.5 ? 'Medium' : entropy < 6 ? 'High' : 'Very High'}`
  ].join('\n');
}

// Diff two strings (line by line)
export function diffStrings(input, compare = '') {
  const linesA = input.split('\n');
  let linesB;
  if (compare) {
    linesB = compare.split('\n');
  } else {
    // Split input in half at empty line
    const midIdx = input.indexOf('\n\n');
    if (midIdx === -1) return 'Error: Provide compare param or separate inputs with blank line';
    linesA.length = 0;
    linesA.push(...input.slice(0, midIdx).split('\n'));
    linesB = input.slice(midIdx + 2).split('\n');
  }

  const maxLen = Math.max(linesA.length, linesB.length);
  const result = [];
  for (let i = 0; i < maxLen; i++) {
    const a = linesA[i];
    const b = linesB[i];
    if (a === undefined) {
      result.push(`+ ${b}`);
    } else if (b === undefined) {
      result.push(`- ${a}`);
    } else if (a === b) {
      result.push(`  ${a}`);
    } else {
      result.push(`- ${a}`);
      result.push(`+ ${b}`);
    }
  }
  return result.join('\n');
}
