// Linux-style text operations - grep, sed, cut, tr, wc, awk, etc.

// Grep - filter lines matching pattern
export function grepLines(input, pattern = '', invert = 'false', ignoreCase = 'false', count = 'false', lineNumbers = 'false') {
  if (!pattern) return input;
  let flags = 'g';
  if (ignoreCase === 'true') flags += 'i';
  const re = new RegExp(pattern, flags);

  const lines = input.split('\n');
  const inv = invert === 'true';
  const matched = [];

  for (let i = 0; i < lines.length; i++) {
    const match = re.test(lines[i]);
    re.lastIndex = 0;
    if (match !== inv) {
      if (lineNumbers === 'true') {
        matched.push(`${i + 1}:${lines[i]}`);
      } else {
        matched.push(lines[i]);
      }
    }
  }

  if (count === 'true') return `${matched.length} matches`;
  return matched.join('\n');
}

// Sed - stream editor (find/replace with regex)
export function sed(input, expression = '') {
  if (!expression) return input;
  // Parse s/pattern/replacement/flags
  const match = expression.match(/^s(.)(.*?)\1(.*?)\1([gimsuy]*)$/);
  if (!match) return `Error: Invalid sed expression. Use s/pattern/replacement/flags`;
  const [, , pattern, replacement, flags] = match;
  return input.replace(new RegExp(pattern, flags || 'g'), replacement);
}

// Cut - extract fields/columns
export function cut(input, delimiter = '\t', fields = '1', outputDelimiter = '\t') {
  const delim = delimiter === '\\t' ? '\t' : delimiter;
  const outDelim = outputDelimiter === '\\t' ? '\t' : outputDelimiter;
  const fieldList = parseFieldList(fields);

  return input.split('\n').map(line => {
    const parts = line.split(delim);
    return fieldList.map(f => parts[f - 1] || '').join(outDelim);
  }).join('\n');
}

function parseFieldList(fields) {
  const result = [];
  for (const part of fields.split(',')) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= (end || start); i++) result.push(i);
    } else {
      result.push(parseInt(part));
    }
  }
  return result.filter(n => n > 0);
}

// Tr - translate/replace characters
export function tr(input, from = '', to = '', delete_ = 'false', squeeze = 'false') {
  let result = input;

  if (delete_ === 'true') {
    // Delete mode: remove all chars in 'from'
    const chars = expandTrRange(from);
    result = result.split('').filter(c => !chars.includes(c)).join('');
  } else if (from && to) {
    // Translate mode
    const fromChars = expandTrRange(from);
    const toChars = expandTrRange(to);
    result = result.split('').map(c => {
      const idx = fromChars.indexOf(c);
      if (idx !== -1) return toChars[Math.min(idx, toChars.length - 1)] || '';
      return c;
    }).join('');
  }

  if (squeeze === 'true' && to) {
    // Squeeze repeated characters from 'to' set
    const squeezeChars = expandTrRange(to);
    result = result.replace(/(.)\1+/g, (match, char) => {
      if (squeezeChars.includes(char)) return char;
      return match;
    });
  }

  return result;
}

function expandTrRange(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    if (str[i + 1] === '-' && i + 2 < str.length) {
      const start = str.charCodeAt(i);
      const end = str.charCodeAt(i + 2);
      for (let c = start; c <= end; c++) result.push(String.fromCharCode(c));
      i += 2;
    } else {
      result.push(str[i]);
    }
  }
  return result;
}

// Wc - word/line/char/byte count
export function wc(input, mode = 'all') {
  const lines = input.split('\n').length;
  const words = input.trim() ? input.trim().split(/\s+/).length : 0;
  const chars = input.length;
  const bytes = new TextEncoder().encode(input).length;

  switch (mode) {
    case 'lines': return lines.toString();
    case 'words': return words.toString();
    case 'chars': return chars.toString();
    case 'bytes': return bytes.toString();
    default:
      return `Lines: ${lines}\nWords: ${words}\nChars: ${chars}\nBytes: ${bytes}`;
  }
}

// Awk - field extraction (simplified)
export function awk(input, expression = '{print $0}', fieldSeparator = ' ', outputSeparator = ' ') {
  const fs = fieldSeparator === '\\t' ? '\t' : fieldSeparator;
  const ofs = outputSeparator === '\\t' ? '\t' : outputSeparator;

  // Parse print expression: {print $1, $3} or just $1,$2
  const printMatch = expression.match(/\{?\s*print\s+(.*?)\s*\}?$/);
  if (!printMatch) return 'Error: Use format like {print $1, $2}';

  const fieldRefs = printMatch[1].split(/[,\s]+/).filter(Boolean);

  return input.split('\n').map((line, lineIdx) => {
    const NR = lineIdx + 1;
    const fields = line.split(new RegExp(fs === ' ' ? '\\s+' : escRegex(fs)));
    const NF = fields.length;

    return fieldRefs.map(ref => {
      if (ref === '$0') return line;
      if (ref === 'NR') return NR.toString();
      if (ref === 'NF') return NF.toString();
      const m = ref.match(/^\$(\d+)$/);
      if (m) {
        const idx = parseInt(m[1]);
        if (idx === 0) return line;
        return fields[idx - 1] || '';
      }
      // Literal string
      return ref.replace(/^["']|["']$/g, '');
    }).join(ofs);
  }).join('\n');
}

function escRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Tac - reverse line order
export function tac(input) {
  return input.split('\n').reverse().join('\n');
}

// Rev - reverse each line
export function rev(input) {
  return input.split('\n').map(line => line.split('').reverse().join('')).join('\n');
}

// Paste - merge lines from multiple columns (side by side)
export function paste(input, delimiter = '\t') {
  const delim = delimiter === '\\t' ? '\t' : delimiter;
  // Input is expected as blocks separated by empty line
  const blocks = input.split('\n\n');
  if (blocks.length < 2) return input;

  const columns = blocks.map(b => b.split('\n'));
  const maxLen = Math.max(...columns.map(c => c.length));
  const result = [];

  for (let i = 0; i < maxLen; i++) {
    result.push(columns.map(col => col[i] || '').join(delim));
  }
  return result.join('\n');
}

// Fold - wrap lines at N characters
export function fold(input, width = 80) {
  const w = parseInt(width) || 80;
  return input.split('\n').map(line => {
    const chunks = [];
    for (let i = 0; i < line.length; i += w) {
      chunks.push(line.slice(i, i + w));
    }
    return chunks.join('\n');
  }).join('\n');
}

// Expand/Unexpand - tabs to spaces and vice versa
export function expandTabs(input, tabWidth = 4) {
  const w = parseInt(tabWidth) || 4;
  return input.replace(/\t/g, ' '.repeat(w));
}

export function unexpandTabs(input, tabWidth = 4) {
  const w = parseInt(tabWidth) || 4;
  const spaces = ' '.repeat(w);
  return input.split(spaces).join('\t');
}

// Nl - number lines
export function nl(input, format = '%6d\t', startNum = 1) {
  let n = parseInt(startNum) || 1;
  return input.split('\n').map(line => {
    const num = format.replace('%d', n).replace(/%(\d+)d/, (_, w) => String(n).padStart(parseInt(w)));
    n++;
    return num + line;
  }).join('\n');
}

// Colrm - remove columns from each line
export function colrm(input, startCol = 1, endCol = '') {
  const s = parseInt(startCol) - 1 || 0;
  const e = endCol ? parseInt(endCol) : undefined;

  return input.split('\n').map(line => {
    if (e !== undefined) {
      return line.slice(0, s) + line.slice(e);
    }
    return line.slice(0, s);
  }).join('\n');
}

// Regex extract - extract all matches
export function regexExtract(input, pattern = '', group = 0) {
  if (!pattern) return 'Error: No pattern provided';
  const g = parseInt(group) || 0;
  const re = new RegExp(pattern, 'g');
  const results = [];
  let m;
  while ((m = re.exec(input)) !== null) {
    results.push(g > 0 && m[g] !== undefined ? m[g] : m[0]);
  }
  return results.join('\n') || 'No matches found';
}

// Squeeze blank lines
export function squeezeBlankLines(input) {
  return input.replace(/\n{3,}/g, '\n\n');
}

// Strip leading/trailing whitespace per line
export function stripWhitespace(input, leading = 'true', trailing = 'true') {
  return input.split('\n').map(line => {
    if (leading === 'true') line = line.replace(/^\s+/, '');
    if (trailing === 'true') line = line.replace(/\s+$/, '');
    return line;
  }).join('\n');
}

// Join lines
export function joinLines(input, separator = ' ') {
  const sep = separator === '\\n' ? '\n' : separator === '\\t' ? '\t' : separator;
  return input.split('\n').join(sep);
}

// Prepend / Append to each line
export function prependLines(input, prefix = '') {
  return input.split('\n').map(l => prefix + l).join('\n');
}

export function appendLines(input, suffix = '') {
  return input.split('\n').map(l => l + suffix).join('\n');
}
