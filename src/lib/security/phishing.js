// Phishing assessment tools - domain permutation fuzzer (inspired by phishlookup/dnstwist)
// Pure client-side - NO network requests

const KEYBOARD_ADJACENT = {
  'a': ['q','w','s','z'], 'b': ['v','g','h','n'], 'c': ['x','d','f','v'],
  'd': ['s','e','r','f','x','c'], 'e': ['w','s','d','r'], 'f': ['d','r','t','g','c','v'],
  'g': ['f','t','y','h','v','b'], 'h': ['g','y','u','j','b','n'], 'i': ['u','j','k','o'],
  'j': ['h','u','i','k','n','m'], 'k': ['j','i','o','l','m'], 'l': ['k','o','p'],
  'm': ['n','j','k'], 'n': ['b','h','j','m'], 'o': ['i','k','l','p'], 'p': ['o','l'],
  'q': ['w','a'], 'r': ['e','d','f','t'], 's': ['a','w','e','d','z','x'],
  't': ['r','f','g','y'], 'u': ['y','h','j','i'], 'v': ['c','f','g','b'],
  'w': ['q','a','s','e'], 'x': ['z','s','d','c'], 'y': ['t','g','h','u'], 'z': ['a','s','x'],
  '1': ['2','q'], '2': ['1','3','q','w'], '3': ['2','4','w','e'], '4': ['3','5','e','r'],
  '5': ['4','6','r','t'], '6': ['5','7','t','y'], '7': ['6','8','y','u'],
  '8': ['7','9','u','i'], '9': ['8','0','i','o'], '0': ['9','o','p'],
};

const HOMOGLYPHS = {
  'a': ['à','á','â','ã','ä','å','а'], 'b': ['d','в'], 'c': ['ç','с','ĉ'],
  'd': ['b','cl'], 'e': ['é','è','ê','ë','е','ё'], 'f': ['t'],
  'g': ['ğ','q','ԍ'], 'h': ['b','һ','н'], 'i': ['í','ì','î','ï','l','1','і'],
  'j': ['ј'], 'k': ['к'], 'l': ['1','i','I'], 'm': ['rn','м'],
  'n': ['ñ','п'], 'o': ['ó','ò','ô','ö','õ','0','о'], 'p': ['р','b'],
  'r': ['г'], 's': ['ş','5','ѕ','z'], 't': ['f','т'], 'u': ['ú','ù','û','ü','v','ц'],
  'v': ['u'], 'w': ['vv','ѡ'], 'x': ['х'], 'y': ['ý','ÿ','у'], 'z': ['s','2','з'],
  '0': ['o','О'], '1': ['l','I'],
};

const VOWELS = new Set('aeiou');

function splitDomain(input) {
  const domain = input.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
  const parts = domain.split('.');
  if (parts.length >= 3) return { sub: parts[0], name: parts[1], tld: parts.slice(2).join('.') };
  if (parts.length === 2) return { sub: '', name: parts[0], tld: parts[1] };
  return { sub: '', name: domain, tld: 'com' };
}

function fullDomain(sub, name, tld) {
  return sub ? `${sub}.${name}.${tld}` : `${name}.${tld}`;
}

// === Permutation Methods (ported from phishlookup) ===

function addition(name) {
  const r = [];
  for (let i = 0; i < 26; i++) r.push(name + String.fromCharCode(97 + i));
  return r;
}

function bitsquatting(name) {
  const r = new Set();
  for (let i = 0; i < name.length; i++) {
    for (let bit = 0; bit < 8; bit++) {
      const c = String.fromCharCode(name.charCodeAt(i) ^ (1 << bit));
      if (/[a-z0-9\-]/.test(c)) r.add(name.slice(0, i) + c + name.slice(i + 1));
    }
  }
  return [...r];
}

function homoglyphs(name) {
  const r = new Set();
  for (let i = 0; i < name.length; i++) {
    const glyphs = HOMOGLYPHS[name[i]];
    if (glyphs) {
      for (const g of glyphs) {
        r.add(name.slice(0, i) + g + name.slice(i + 1));
      }
    }
  }
  return [...r];
}

function hyphenation(name) {
  const r = [];
  for (let i = 1; i < name.length; i++) r.push(name.slice(0, i) + '-' + name.slice(i));
  return r;
}

function dotting(name) {
  const r = [];
  for (let i = 1; i < name.length; i++) r.push(name.slice(0, i) + '.' + name.slice(i));
  return r;
}

function insertion(name) {
  const r = new Set();
  for (let i = 0; i <= name.length; i++) {
    for (let c = 97; c <= 122; c++) {
      r.add(name.slice(0, i) + String.fromCharCode(c) + name.slice(i));
    }
  }
  return [...r];
}

function omission(name) {
  const r = new Set();
  for (let i = 0; i < name.length; i++) r.add(name.slice(0, i) + name.slice(i + 1));
  return [...r];
}

function repetition(name) {
  const r = new Set();
  for (let i = 0; i < name.length; i++) {
    r.add(name.slice(0, i) + name[i] + name[i] + name.slice(i + 1));
  }
  return [...r];
}

function replacement(name) {
  const r = new Set();
  for (let i = 0; i < name.length; i++) {
    const adj = KEYBOARD_ADJACENT[name[i]];
    if (adj) {
      for (const c of adj) r.add(name.slice(0, i) + c + name.slice(i + 1));
    }
  }
  return [...r];
}

function transposition(name) {
  const r = new Set();
  for (let i = 0; i < name.length - 1; i++) {
    r.add(name.slice(0, i) + name[i + 1] + name[i] + name.slice(i + 2));
  }
  return [...r];
}

function vowelSwap(name) {
  const r = new Set();
  const vowelList = 'aeiou';
  for (let i = 0; i < name.length; i++) {
    if (VOWELS.has(name[i])) {
      for (const v of vowelList) {
        if (v !== name[i]) r.add(name.slice(0, i) + v + name.slice(i + 1));
      }
    }
  }
  return [...r];
}

function pluralization(name) {
  const r = [];
  if (!name.endsWith('s')) r.push(name + 's');
  if (!name.endsWith('es')) r.push(name + 'es');
  return r;
}

function allDeletions(name) {
  const r = new Set();
  for (let i = 0; i < name.length; i++) r.add(name.slice(0, i) + name.slice(i + 1));
  return [...r];
}

// === Main exported functions ===

export function domainFuzz(input, methods = 'all') {
  const raw = input.trim();
  if (!raw) return 'Error: Provide a domain name (e.g. example.com)';

  const { sub, name, tld } = splitDomain(raw);

  const allMethods = {
    addition, bitsquatting, homoglyphs, hyphenation, dotting,
    insertion, omission, repetition, replacement, transposition,
    vowelSwap, pluralization, allDeletions
  };

  const selectedMethods = methods === 'all'
    ? Object.entries(allMethods)
    : methods.split(',').map(m => [m.trim(), allMethods[m.trim()]]).filter(([,fn]) => fn);

  const results = new Map();

  for (const [methodName, fn] of selectedMethods) {
    const perms = fn(name);
    for (const p of perms) {
      if (p && p !== name && p.length > 0) {
        const domain = fullDomain(sub, p, tld);
        if (!results.has(domain)) {
          results.set(domain, methodName);
        }
      }
    }
  }

  // Add TLD variations for common TLDs
  const commonTlds = ['com','net','org','io','co','info','biz','dev','app','xyz','me','cc','ru','cn','de','uk','pl'];
  for (const t of commonTlds) {
    if (t !== tld) {
      const domain = fullDomain(sub, name, t);
      if (!results.has(domain)) results.set(domain, 'tld_swap');
    }
  }

  const output = [`=== Domain Permutations for ${raw} ===`,
    `Original: ${fullDomain(sub, name, tld)}`,
    `Total: ${results.size} permutations\n`];

  // Group by method
  const grouped = {};
  for (const [domain, method] of results) {
    if (!grouped[method]) grouped[method] = [];
    grouped[method].push(domain);
  }

  for (const [method, domains] of Object.entries(grouped)) {
    output.push(`--- ${method} (${domains.length}) ---`);
    // Show first 50 per method to avoid huge output
    const shown = domains.slice(0, 50);
    output.push(shown.join('\n'));
    if (domains.length > 50) output.push(`  ... and ${domains.length - 50} more`);
    output.push('');
  }

  return output.join('\n');
}

export function homoglyphDomain(input) {
  const raw = input.trim();
  if (!raw) return 'Error: Provide a domain name';

  const { sub, name, tld } = splitDomain(raw);
  const results = [];

  // Single-char substitutions
  const singleSubs = homoglyphs(name);
  results.push(`=== Homoglyph Domains for ${raw} ===\n`);
  results.push(`--- Single substitution (${singleSubs.length}) ---`);
  for (const p of singleSubs.slice(0, 100)) {
    const domain = fullDomain(sub, p, tld);
    // Try punycode
    let puny = '';
    try {
      const encoded = domain.split('.').map(label => {
        const hasNonAscii = Array.from(label).some(c => c.codePointAt(0) >= 128);
        if (!hasNonAscii) return label;
        // Simple punycode note
        return `xn--[${label}]`;
      }).join('.');
      puny = `  (${encoded})`;
    } catch {}
    results.push(`${domain}${puny}`);
  }

  // Full Cyrillic lookalike
  const cyrillicMap = {
    'a':'а','c':'с','e':'е','o':'о','p':'р','x':'х','y':'у','s':'ѕ',
    'i':'і','j':'ј','h':'һ','k':'к','m':'м','n':'п','t':'т','w':'ѡ'
  };

  let fullCyrillic = '';
  let canFullCyrillic = true;
  for (const ch of name) {
    if (cyrillicMap[ch]) fullCyrillic += cyrillicMap[ch];
    else if (/[a-z0-9\-]/.test(ch)) { canFullCyrillic = false; break; }
    else fullCyrillic += ch;
  }

  if (canFullCyrillic && fullCyrillic !== name) {
    results.push(`\n--- Full Cyrillic lookalike ---`);
    results.push(fullDomain(sub, fullCyrillic, tld));
  }

  return results.join('\n');
}

// === Email Header Parser ===
export function parseEmailHeaders(input) {
  const raw = input.trim();
  if (!raw) return 'Error: Paste raw email headers';

  const result = [];
  const headers = {};
  let currentKey = '';

  // Parse headers (handle multi-line folding)
  for (const line of raw.split(/\r?\n/)) {
    if (/^\s/.test(line) && currentKey) {
      headers[currentKey] += ' ' + line.trim();
    } else {
      const colonIdx = line.indexOf(':');
      if (colonIdx > 0) {
        currentKey = line.slice(0, colonIdx).trim().toLowerCase();
        const value = line.slice(colonIdx + 1).trim();
        if (headers[currentKey]) {
          headers[currentKey] += '\n' + value;
        } else {
          headers[currentKey] = value;
        }
      }
    }
  }

  result.push('=== EMAIL HEADER ANALYSIS ===\n');

  // Basic info
  if (headers['from']) result.push(`From:    ${headers['from']}`);
  if (headers['to']) result.push(`To:      ${headers['to']}`);
  if (headers['subject']) result.push(`Subject: ${headers['subject']}`);
  if (headers['date']) result.push(`Date:    ${headers['date']}`);
  if (headers['reply-to']) result.push(`Reply-To: ${headers['reply-to']}`);
  if (headers['return-path']) result.push(`Return-Path: ${headers['return-path']}`);

  // Authentication results
  result.push('\n=== AUTHENTICATION ===');

  // SPF
  const spf = headers['received-spf'] || '';
  if (spf) {
    const spfResult = spf.match(/^(pass|fail|softfail|neutral|none|temperror|permerror)/i);
    result.push(`SPF: ${spfResult ? spfResult[1].toUpperCase() : 'UNKNOWN'}`);
    result.push(`  ${spf.slice(0, 200)}`);
  } else {
    result.push('SPF: NOT FOUND');
  }

  // DKIM
  const dkim = headers['dkim-signature'] || '';
  if (dkim) {
    const dMatch = dkim.match(/d=([^;\s]+)/);
    const sMatch = dkim.match(/s=([^;\s]+)/);
    result.push(`DKIM: PRESENT`);
    if (dMatch) result.push(`  Domain: ${dMatch[1]}`);
    if (sMatch) result.push(`  Selector: ${sMatch[1]}`);
  } else {
    result.push('DKIM: NOT FOUND');
  }

  // DMARC (from Authentication-Results)
  const authResults = headers['authentication-results'] || '';
  if (authResults) {
    result.push(`Authentication-Results: ${authResults.slice(0, 300)}`);
    const dmarcMatch = authResults.match(/dmarc=(\w+)/i);
    const spfMatch = authResults.match(/spf=(\w+)/i);
    const dkimMatch = authResults.match(/dkim=(\w+)/i);
    if (dmarcMatch) result.push(`  DMARC: ${dmarcMatch[1].toUpperCase()}`);
    if (spfMatch) result.push(`  SPF: ${spfMatch[1].toUpperCase()}`);
    if (dkimMatch) result.push(`  DKIM: ${dkimMatch[1].toUpperCase()}`);
  }

  // ARC
  if (headers['arc-authentication-results']) {
    result.push(`ARC: PRESENT`);
  }

  // Received chain (trace route)
  result.push('\n=== MAIL ROUTE (Received headers, newest first) ===');
  const received = (headers['received'] || '').split('\n');
  for (let i = 0; i < received.length; i++) {
    const r = received[i].trim();
    if (!r) continue;
    const fromMatch = r.match(/from\s+(\S+)/i);
    const byMatch = r.match(/by\s+(\S+)/i);
    const ipMatch = r.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
    result.push(`[${i + 1}] ${fromMatch ? 'from ' + fromMatch[1] : ''} ${byMatch ? '-> ' + byMatch[1] : ''} ${ipMatch ? '(' + ipMatch[1] + ')' : ''}`);
    result.push(`    ${r.slice(0, 200)}`);
  }

  // Phishing indicators
  result.push('\n=== PHISHING INDICATORS ===');
  const indicators = [];

  // From/Reply-To mismatch
  if (headers['from'] && headers['reply-to']) {
    const fromDomain = (headers['from'].match(/@([^>\s]+)/)||[])[1];
    const replyDomain = (headers['reply-to'].match(/@([^>\s]+)/)||[])[1];
    if (fromDomain && replyDomain && fromDomain !== replyDomain) {
      indicators.push(`[!] From/Reply-To domain mismatch: ${fromDomain} vs ${replyDomain}`);
    }
  }

  // From/Return-Path mismatch
  if (headers['from'] && headers['return-path']) {
    const fromDomain = (headers['from'].match(/@([^>\s]+)/)||[])[1];
    const returnDomain = (headers['return-path'].match(/@([^>\s]+)/)||[])[1];
    if (fromDomain && returnDomain && fromDomain !== returnDomain) {
      indicators.push(`[!] From/Return-Path domain mismatch: ${fromDomain} vs ${returnDomain}`);
    }
  }

  // SPF fail
  if (spf && /fail|softfail/i.test(spf)) {
    indicators.push(`[!] SPF ${spf.match(/^(\w+)/)[1]} - sender not authorized`);
  }

  // Missing DKIM
  if (!dkim) indicators.push('[!] No DKIM signature');

  // X-Mailer / User-Agent
  if (headers['x-mailer']) indicators.push(`[i] X-Mailer: ${headers['x-mailer']}`);
  if (headers['user-agent']) indicators.push(`[i] User-Agent: ${headers['user-agent']}`);

  // Content type check
  if (headers['content-type'] && headers['content-type'].includes('multipart/mixed')) {
    indicators.push('[i] Contains attachments (multipart/mixed)');
  }

  // X-Spam headers
  for (const [key, val] of Object.entries(headers)) {
    if (key.includes('spam') || key.includes('x-spam')) {
      indicators.push(`[i] ${key}: ${val.slice(0, 100)}`);
    }
  }

  if (indicators.length === 0) {
    result.push('No obvious phishing indicators found');
  } else {
    result.push(...indicators);
  }

  return result.join('\n');
}
