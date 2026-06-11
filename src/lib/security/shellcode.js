// Shellcode operations for pentesters and CTF players

// Convert between shellcode formats
export function shellcodeToFormat(input, format = 'c_array') {
  const bytes = parseShellcodeInput(input);
  if (!bytes || bytes.length === 0) return 'Error: No valid shellcode bytes found';

  switch (format) {
    case 'c_array':
      return `unsigned char shellcode[] = {\n  ${formatAsC(bytes)}\n};\n// Length: ${bytes.length}`;
    case 'c_string':
      return `"${bytes.map(b => '\\x' + b.toString(16).padStart(2, '0')).join('')}"`;
    case 'python':
      return `shellcode = b"${bytes.map(b => '\\x' + b.toString(16).padStart(2, '0')).join('')}"\n# Length: ${bytes.length}`;
    case 'python_array':
      return `shellcode = bytearray([${bytes.join(', ')}])\n# Length: ${bytes.length}`;
    case 'powershell':
      return `[Byte[]] $shellcode = ${bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(',')}\n# Length: ${bytes.length}`;
    case 'csharp':
      return `byte[] shellcode = new byte[${bytes.length}] {\n  ${bytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}\n};`;
    case 'ruby':
      return `shellcode = "${bytes.map(b => '\\x' + b.toString(16).padStart(2, '0')).join('')}"\n# Length: ${bytes.length}`;
    case 'nasm':
      return bytes.map((b, i) => {
        if (i % 16 === 0) return (i > 0 ? '\n' : '') + 'db ' + '0x' + b.toString(16).padStart(2, '0');
        return ', 0x' + b.toString(16).padStart(2, '0');
      }).join('');
    case 'raw_hex':
      return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
    case 'hex_escaped':
      return bytes.map(b => '\\x' + b.toString(16).padStart(2, '0')).join('');
    case 'hex_spaced':
      return bytes.map(b => b.toString(16).padStart(2, '0')).join(' ');
    case 'decimal':
      return bytes.join(' ');
    case 'base64':
      return btoa(String.fromCharCode(...bytes));
    case 'uuid': {
      // UUID shellcode stager format (16 bytes per UUID)
      const uuids = [];
      for (let i = 0; i < bytes.length; i += 16) {
        const chunk = bytes.slice(i, i + 16);
        while (chunk.length < 16) chunk.push(0x90); // pad with NOP
        const hex = chunk.map(b => b.toString(16).padStart(2, '0')).join('');
        uuids.push(`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`);
      }
      return uuids.join('\n');
    }
    case 'msfvenom':
      return `# msfvenom compatible hex\nbuf = ""\n${chunkString(bytes.map(b => '\\x' + b.toString(16).padStart(2, '0')).join(''), 60).map(l => `buf += "${l}"`).join('\n')}\n# Length: ${bytes.length}`;
    default:
      return bytes.map(b => b.toString(16).padStart(2, '0')).join(' ');
  }
}

function formatAsC(bytes) {
  const lines = [];
  for (let i = 0; i < bytes.length; i += 12) {
    const chunk = bytes.slice(i, i + 12);
    lines.push(chunk.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', '));
  }
  return lines.join(',\n  ');
}

function chunkString(str, size) {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) chunks.push(str.slice(i, i + size));
  return chunks;
}

// Parse shellcode from various formats
function parseShellcodeInput(input) {
  const trimmed = input.trim();

  // Try \x format: \x41\x42\x43
  if (trimmed.includes('\\x')) {
    const matches = trimmed.match(/\\x([0-9a-fA-F]{2})/g);
    if (matches) return matches.map(m => parseInt(m.slice(2), 16));
  }

  // Try 0x format: 0x41, 0x42
  if (trimmed.includes('0x')) {
    const matches = trimmed.match(/0x([0-9a-fA-F]{1,2})/g);
    if (matches) return matches.map(m => parseInt(m.slice(2), 16));
  }

  // Try raw hex: 4142434445
  const cleanHex = trimmed.replace(/[\s,;{}\[\]()'"]+/g, '');
  if (/^[0-9a-fA-F]+$/.test(cleanHex) && cleanHex.length % 2 === 0) {
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes.push(parseInt(cleanHex.substr(i, 2), 16));
    }
    return bytes;
  }

  // Try spaced hex: 41 42 43
  if (/^[0-9a-fA-F]{2}(\s+[0-9a-fA-F]{2})*$/.test(trimmed)) {
    return trimmed.split(/\s+/).map(h => parseInt(h, 16));
  }

  // Try decimal: 65 66 67
  if (/^\d+(\s+\d+)*$/.test(trimmed)) {
    const nums = trimmed.split(/\s+/).map(Number);
    if (nums.every(n => n >= 0 && n <= 255)) return nums;
  }

  // Try base64
  try {
    const decoded = atob(trimmed);
    if (decoded.length > 0) return Array.from(decoded).map(c => c.charCodeAt(0));
  } catch {}

  return null;
}

// Bad character analysis
export function shellcodeBadChars(input, badChars = '\\x00\\x0a\\x0d') {
  const bytes = parseShellcodeInput(input);
  if (!bytes) return 'Error: Could not parse shellcode';

  // Parse bad chars list
  const bad = new Set();
  const badMatches = badChars.match(/\\x([0-9a-fA-F]{2})/g);
  if (badMatches) {
    badMatches.forEach(m => bad.add(parseInt(m.slice(2), 16)));
  } else {
    // Default: null, newline, carriage return
    bad.add(0x00); bad.add(0x0a); bad.add(0x0d);
  }

  const found = [];
  const positions = {};
  bytes.forEach((b, i) => {
    if (bad.has(b)) {
      found.push({ byte: b, position: i });
      const key = '0x' + b.toString(16).padStart(2, '0');
      if (!positions[key]) positions[key] = [];
      positions[key].push(i);
    }
  });

  const allBadChars = Array.from(bad).map(b => '\\x' + b.toString(16).padStart(2, '0')).join(' ');

  if (found.length === 0) {
    return `Shellcode length: ${bytes.length} bytes\nBad chars checked: ${allBadChars}\nResult: CLEAN - No bad characters found`;
  }

  const report = [
    `Shellcode length: ${bytes.length} bytes`,
    `Bad chars checked: ${allBadChars}`,
    `Result: FOUND ${found.length} bad character(s)`,
    ``,
    `Occurrences:`
  ];

  for (const [char, pos] of Object.entries(positions)) {
    report.push(`  ${char}: ${pos.length}x at offset(s) ${pos.join(', ')}`);
  }

  // Generate clean version
  const clean = bytes.filter(b => !bad.has(b));
  report.push('');
  report.push(`Clean shellcode (${clean.length} bytes, ${bytes.length - clean.length} removed):`);
  report.push(clean.map(b => '\\x' + b.toString(16).padStart(2, '0')).join(''));

  return report.join('\n');
}

// XOR encode shellcode (single byte or multi-byte key)
export function shellcodeXorEncode(input, key = '0x41', avoidChars = '\\x00') {
  const bytes = parseShellcodeInput(input);
  if (!bytes) return 'Error: Could not parse shellcode';

  // Parse key
  let keyBytes;
  if (key.startsWith('0x') || key.startsWith('\\x')) {
    const m = key.match(/(?:0x|\\x)([0-9a-fA-F]{2})/g);
    keyBytes = m ? m.map(k => parseInt(k.replace(/0x|\\x/, ''), 16)) : [parseInt(key, 16) || 0x41];
  } else {
    keyBytes = Array.from(new TextEncoder().encode(key));
  }

  // Parse avoid chars
  const avoid = new Set();
  const avoidMatches = avoidChars.match(/\\x([0-9a-fA-F]{2})/g);
  if (avoidMatches) avoidMatches.forEach(m => avoid.add(parseInt(m.slice(2), 16)));

  const encoded = bytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);

  // Check for bad chars in output
  const badInOutput = encoded.filter(b => avoid.has(b));

  const result = [
    `; XOR encoded shellcode`,
    `; Key: ${keyBytes.map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')} (${keyBytes.length} byte(s))`,
    `; Original length: ${bytes.length}`,
    `; Encoded length: ${encoded.length}`,
  ];

  if (badInOutput.length > 0) {
    result.push(`; WARNING: Encoded output contains ${badInOutput.length} bad character(s)`);
  } else {
    result.push(`; Bad char check: CLEAN`);
  }

  result.push('');
  result.push('; Encoded bytes:');
  result.push(encoded.map(b => '\\x' + b.toString(16).padStart(2, '0')).join(''));
  result.push('');
  result.push('; XOR decoder stub (x86):');
  result.push('; jmp short call_decoder');
  result.push('; decoder:');
  result.push(';   pop esi');
  result.push(`;   xor ecx, ecx`);
  result.push(`;   mov cl, ${bytes.length}`);
  result.push('; decode_loop:');
  result.push(`;   xor byte [esi], 0x${keyBytes[0].toString(16).padStart(2, '0')}`);
  result.push(';   inc esi');
  result.push(';   loop decode_loop');
  result.push(';   jmp short encoded');
  result.push('; call_decoder:');
  result.push(';   call decoder');
  result.push('; encoded:');
  result.push(`;   ; ${encoded.length} bytes of XOR-encoded shellcode`);

  return result.join('\n');
}

// Generate NOP sled
export function generateNopSled(input, length = 100, arch = 'x86', variant = 'standard') {
  const len = Math.min(parseInt(length) || 100, 100000);

  const nops = {
    'x86': {
      standard: [0x90],
      multi: [0x90, 0x66, 0x90, 0x87, 0xdb, 0x87, 0xc9, 0x87, 0xd2, 0xf8, 0xf9, 0xf5],
      // Single-byte x86 NOPs that don't affect execution
    },
    'x64': {
      standard: [0x90],
      multi: [0x90, 0x66, 0x90, 0x0f, 0x1f, 0x00],
    },
    'arm': {
      standard: [0x00, 0x00, 0xa0, 0xe1], // MOV R0, R0
    },
    'arm_thumb': {
      standard: [0xc0, 0x46], // MOV R8, R8 (thumb NOP)
    }
  };

  const archNops = nops[arch] || nops['x86'];
  const nopSet = archNops[variant] || archNops.standard;
  const bytes = [];

  if (variant === 'multi' && nopSet.length > 1) {
    // Random NOP sled with multiple NOP-equivalent instructions
    for (let i = 0; i < len; i++) {
      const idx = crypto.getRandomValues(new Uint8Array(1))[0] % nopSet.length;
      bytes.push(nopSet[idx]);
    }
  } else {
    for (let i = 0; i < len; i++) {
      bytes.push(...nopSet);
      if (bytes.length >= len) break;
    }
    bytes.length = len;
  }

  return [
    `; NOP sled - ${arch} ${variant}`,
    `; Length: ${bytes.length} bytes`,
    '',
    bytes.map(b => '\\x' + b.toString(16).padStart(2, '0')).join('')
  ].join('\n');
}

// Shellcode analysis
export function shellcodeAnalyze(input) {
  const bytes = parseShellcodeInput(input);
  if (!bytes) return 'Error: Could not parse shellcode';

  const freq = new Array(256).fill(0);
  bytes.forEach(b => freq[b]++);

  // Common bad chars
  const nullCount = freq[0];
  const newlineCount = freq[0x0a];
  const crCount = freq[0x0d];
  const spaceCount = freq[0x20];

  // Entropy
  let entropy = 0;
  for (let i = 0; i < 256; i++) {
    if (freq[i] > 0) {
      const p = freq[i] / bytes.length;
      entropy -= p * Math.log2(p);
    }
  }

  // Detect common patterns
  const patterns = [];
  const hexStr = bytes.map(b => b.toString(16).padStart(2, '0')).join('');

  // INT 0x80 (Linux syscall)
  if (hexStr.includes('cd80')) patterns.push('INT 0x80 (Linux syscall)');
  // SYSCALL (x64 Linux)
  if (hexStr.includes('0f05')) patterns.push('SYSCALL (x64 Linux)');
  // INT 0x2E (Windows syscall)
  if (hexStr.includes('cd2e')) patterns.push('INT 0x2E (Windows syscall)');
  // WinExec / CreateProcess patterns
  if (hexStr.includes('ff15') || hexStr.includes('ff25')) patterns.push('Indirect CALL/JMP (possible API call)');
  // /bin/sh
  if (hexStr.includes('2f62696e2f7368') || hexStr.includes('2f62696e2f2f7368')) patterns.push('/bin/sh string detected');
  // cmd.exe
  if (hexStr.includes('636d642e657865')) patterns.push('cmd.exe string detected');
  // XOR decoder
  if (hexStr.includes('eb') && hexStr.includes('5e') && hexStr.includes('80') && hexStr.includes('36'))
    patterns.push('Possible XOR decoder stub');
  // GetProcAddress hash
  if (hexStr.includes('6068')) patterns.push('PUSH IMM (possible hash/string push)');
  // WS2_32.dll socket
  if (hexStr.includes('7773325f3332')) patterns.push('ws2_32.dll reference (networking)');

  // Unique bytes
  const uniqueBytes = freq.filter(f => f > 0).length;

  // Printable percentage
  const printable = bytes.filter(b => b >= 0x20 && b <= 0x7e).length;

  const report = [
    `=== Shellcode Analysis ===`,
    ``,
    `Size: ${bytes.length} bytes`,
    `Unique bytes: ${uniqueBytes}/256 (${(uniqueBytes/256*100).toFixed(1)}%)`,
    `Entropy: ${entropy.toFixed(4)} bits/byte (max 8.0)`,
    `Printable: ${printable}/${bytes.length} (${(printable/bytes.length*100).toFixed(1)}%)`,
    ``,
    `=== Bad Character Check ===`,
    `Null bytes (\\x00): ${nullCount}`,
    `Newlines (\\x0a): ${newlineCount}`,
    `Carriage returns (\\x0d): ${crCount}`,
    `Spaces (\\x20): ${spaceCount}`,
    nullCount + newlineCount + crCount === 0 ? `Status: Likely safe for most exploits` : `Status: Contains common bad chars - may need encoding`,
    ``,
  ];

  if (patterns.length > 0) {
    report.push(`=== Detected Patterns ===`);
    patterns.forEach(p => report.push(`  - ${p}`));
    report.push('');
  }

  // Top 10 most frequent bytes
  const topBytes = freq.map((count, byte) => ({ byte, count }))
    .filter(e => e.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  report.push(`=== Byte Frequency (Top 10) ===`);
  topBytes.forEach(({ byte, count }) => {
    const pct = (count / bytes.length * 100).toFixed(1);
    const chr = byte >= 0x20 && byte <= 0x7e ? ` '${String.fromCharCode(byte)}'` : '';
    report.push(`  0x${byte.toString(16).padStart(2, '0')}${chr}: ${count} (${pct}%)`);
  });

  return report.join('\n');
}

// Alpha-numeric encoder (basic)
export function shellcodeAlphanumEncode(input) {
  const bytes = parseShellcodeInput(input);
  if (!bytes) return 'Error: Could not parse shellcode';

  // Simple alphanumeric encoding: split each byte into two nibbles, map to alphanumeric
  // Uses the technique: for byte B, output chr(0x41 + (B >> 4)) + chr(0x41 + (B & 0xF))
  const encoded = [];
  for (const b of bytes) {
    encoded.push(0x41 + (b >> 4));   // A-P
    encoded.push(0x41 + (b & 0x0f)); // A-P
  }

  const result = String.fromCharCode(...encoded);
  const isAlphaNum = /^[A-Pa-p]+$/.test(result);

  return [
    `; Alphanumeric encoded shellcode`,
    `; Original: ${bytes.length} bytes`,
    `; Encoded: ${encoded.length} bytes (2x expansion)`,
    `; All alphanumeric: ${isAlphaNum}`,
    ``,
    `; Encoded payload:`,
    result,
    ``,
    `; Decoder (Python):`,
    `# encoded = "${result}"`,
    `# shellcode = bytes([(ord(encoded[i])-0x41)<<4 | (ord(encoded[i+1])-0x41) for i in range(0,len(encoded),2)])`
  ].join('\n');
}

// Extract strings from shellcode
export function shellcodeStrings(input, minLength = 4) {
  const bytes = parseShellcodeInput(input);
  if (!bytes) return 'Error: Could not parse shellcode';

  const min = parseInt(minLength) || 4;
  const strings = [];
  let current = '';
  let startOffset = 0;

  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] >= 0x20 && bytes[i] <= 0x7e) {
      if (current.length === 0) startOffset = i;
      current += String.fromCharCode(bytes[i]);
    } else {
      if (current.length >= min) {
        strings.push({ offset: startOffset, str: current });
      }
      current = '';
    }
  }
  if (current.length >= min) {
    strings.push({ offset: startOffset, str: current });
  }

  if (strings.length === 0) return `No printable strings found (min length: ${min})`;

  return [
    `Found ${strings.length} string(s) (min length: ${min}):`,
    '',
    ...strings.map(s => `  0x${s.offset.toString(16).padStart(4, '0')}: "${s.str}"`)
  ].join('\n');
}

// Shellcode pattern generator (for offset finding)
export function shellcodePattern(input, length = 200) {
  const len = Math.min(parseInt(length) || 200, 20280);
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  let pattern = '';

  for (let u = 0; u < upper.length && pattern.length < len; u++) {
    for (let l = 0; l < lower.length && pattern.length < len; l++) {
      for (let d = 0; d < digits.length && pattern.length < len; d++) {
        pattern += upper[u] + lower[l] + digits[d];
      }
    }
  }

  return pattern.slice(0, len);
}

// Find offset in pattern
export function shellcodePatternOffset(input, search = '') {
  if (!search) return 'Error: Provide a search value (4 bytes from EIP/RIP)';

  // Generate max pattern
  const pattern = shellcodePattern('', 20280);

  // Try as string directly
  let idx = pattern.indexOf(search);
  if (idx !== -1) return `Pattern offset: ${idx}`;

  // Try as hex (e.g., 0x41326141 or 41326141)
  const hexClean = search.replace(/^0x/i, '').replace(/\s/g, '');
  if (/^[0-9a-fA-F]+$/.test(hexClean) && hexClean.length >= 4) {
    // Little-endian
    const leBytes = [];
    for (let i = hexClean.length - 2; i >= 0; i -= 2) {
      leBytes.push(String.fromCharCode(parseInt(hexClean.substr(i, 2), 16)));
    }
    const leStr = leBytes.join('');
    idx = pattern.indexOf(leStr);
    if (idx !== -1) return `Pattern offset: ${idx} (little-endian: "${leStr}")`;

    // Big-endian
    const beBytes = [];
    for (let i = 0; i < hexClean.length; i += 2) {
      beBytes.push(String.fromCharCode(parseInt(hexClean.substr(i, 2), 16)));
    }
    const beStr = beBytes.join('');
    idx = pattern.indexOf(beStr);
    if (idx !== -1) return `Pattern offset: ${idx} (big-endian: "${beStr}")`;
  }

  return `Pattern "${search}" not found in cyclic pattern`;
}
