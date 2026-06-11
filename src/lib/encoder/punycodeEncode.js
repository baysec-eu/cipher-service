// Punycode encode/decode - RFC 3492 / RFC 5891 (IDN)

const BASE = 36;
const TMIN = 1;
const TMAX = 26;
const SKEW = 38;
const DAMP = 700;
const INITIAL_BIAS = 72;
const INITIAL_N = 128;

function adapt(delta, numPoints, firstTime) {
  delta = firstTime ? Math.floor(delta / DAMP) : Math.floor(delta / 2);
  delta += Math.floor(delta / numPoints);
  let k = 0;
  while (delta > ((BASE - TMIN) * TMAX) / 2) {
    delta = Math.floor(delta / (BASE - TMIN));
    k += BASE;
  }
  return k + Math.floor(((BASE - TMIN + 1) * delta) / (delta + SKEW));
}

function encodeDigit(d) {
  return d < 26 ? d + 97 : d + 22; // a-z : 0-9
}

function decodeDigit(cp) {
  if (cp >= 48 && cp <= 57) return cp - 22; // 0-9
  if (cp >= 65 && cp <= 90) return cp - 65; // A-Z
  if (cp >= 97 && cp <= 122) return cp - 97; // a-z
  return BASE;
}

function punycodeEncodeRaw(input) {
  const codePoints = Array.from(input).map(c => c.codePointAt(0));
  const basic = codePoints.filter(cp => cp < 128);
  const output = basic.map(cp => String.fromCodePoint(cp));
  let h = basic.length;
  const b = basic.length;

  if (b > 0) output.push('-');

  let n = INITIAL_N;
  let delta = 0;
  let bias = INITIAL_BIAS;

  while (h < codePoints.length) {
    let m = Infinity;
    for (const cp of codePoints) {
      if (cp >= n && cp < m) m = cp;
    }

    delta += (m - n) * (h + 1);
    n = m;

    for (const cp of codePoints) {
      if (cp < n) delta++;
      if (cp === n) {
        let q = delta;
        for (let k = BASE; ; k += BASE) {
          const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
          if (q < t) break;
          output.push(String.fromCharCode(encodeDigit(t + ((q - t) % (BASE - t)))));
          q = Math.floor((q - t) / (BASE - t));
        }
        output.push(String.fromCharCode(encodeDigit(q)));
        bias = adapt(delta, h + 1, h === b);
        delta = 0;
        h++;
      }
    }
    delta++;
    n++;
  }

  return output.join('');
}

function punycodeDecodeRaw(input) {
  const output = [];
  let i = 0;
  let n = INITIAL_N;
  let bias = INITIAL_BIAS;

  let basic = input.lastIndexOf('-');
  if (basic < 0) basic = 0;

  for (let j = 0; j < basic; j++) {
    output.push(input.charCodeAt(j));
  }

  let ic = basic > 0 ? basic + 1 : 0;

  while (ic < input.length) {
    const oldi = i;
    let w = 1;
    for (let k = BASE; ; k += BASE) {
      if (ic >= input.length) throw new Error('Invalid punycode');
      const digit = decodeDigit(input.charCodeAt(ic++));
      if (digit >= BASE) throw new Error('Invalid punycode');
      i += digit * w;
      const t = k <= bias ? TMIN : k >= bias + TMAX ? TMAX : k - bias;
      if (digit < t) break;
      w *= (BASE - t);
    }
    bias = adapt(i - oldi, output.length + 1, oldi === 0);
    n += Math.floor(i / (output.length + 1));
    i = i % (output.length + 1);
    output.splice(i, 0, n);
    i++;
  }

  return String.fromCodePoint(...output);
}

export function punycodeEncode(input) {
  if (!input) return '';
  // Handle full domain names (IDN)
  return input.split('.').map(label => {
    const hasNonAscii = Array.from(label).some(c => c.codePointAt(0) >= 128);
    if (!hasNonAscii) return label;
    return 'xn--' + punycodeEncodeRaw(label);
  }).join('.');
}

export function punycodeDecode(input) {
  if (!input) return '';
  return input.split('.').map(label => {
    if (label.toLowerCase().startsWith('xn--')) {
      return punycodeDecodeRaw(label.slice(4));
    }
    return label;
  }).join('.');
}
