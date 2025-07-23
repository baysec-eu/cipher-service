// Analysis operations inspired by CyberChef
// Text analysis, frequency analysis, file analysis, etc.

// Frequency analysis
export function frequencyAnalysis(input) {
  const freq = {};
  const total = input.length;
  
  // Count character frequencies
  for (const char of input) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  // Convert to percentages and sort
  const sorted = Object.entries(freq)
    .map(([char, count]) => ({
      char: char,
      charCode: char.charCodeAt(0),
      count: count,
      percentage: (count / total * 100).toFixed(2),
      bar: '█'.repeat(Math.round(count / total * 50))
    }))
    .sort((a, b) => b.count - a.count);
  
  return {
    totalCharacters: total,
    uniqueCharacters: Object.keys(freq).length,
    frequencies: sorted,
    mostCommon: sorted[0],
    entropy: calculateEntropy(freq, total)
  };
}

// Index of Coincidence (useful for cryptanalysis)
export function indexOfCoincidence(input) {
  const freq = {};
  const total = input.length;
  
  for (const char of input.toUpperCase()) {
    if (/[A-Z]/.test(char)) {
      freq[char] = (freq[char] || 0) + 1;
    }
  }
  
  let ic = 0;
  for (const count of Object.values(freq)) {
    ic += count * (count - 1);
  }
  
  const alphabetSize = Object.keys(freq).length;
  ic = ic / (total * (total - 1));
  
  return {
    indexOfCoincidence: ic.toFixed(4),
    expectedEnglish: 0.0667,
    expectedRandom: 1/26,
    interpretation: ic > 0.06 ? 'Likely monoalphabetic or plaintext' :
                   ic < 0.045 ? 'Likely polyalphabetic cipher' :
                   'Possibly random or complex cipher',
    alphabetSize: alphabetSize
  };
}

// Chi-squared test for randomness
export function chiSquaredTest(input) {
  const observed = {};
  const total = input.length;
  
  for (const char of input) {
    observed[char] = (observed[char] || 0) + 1;
  }
  
  const expected = total / Object.keys(observed).length;
  let chiSquared = 0;
  
  for (const count of Object.values(observed)) {
    chiSquared += Math.pow(count - expected, 2) / expected;
  }
  
  return {
    chiSquared: chiSquared.toFixed(4),
    degreesOfFreedom: Object.keys(observed).length - 1,
    interpretation: chiSquared < 20 ? 'Appears random' :
                   chiSquared < 100 ? 'Some pattern detected' :
                   'Strong pattern detected'
  };
}

// N-gram analysis
export function ngramAnalysis(input, n = 2) {
  const ngrams = {};
  const total = input.length - n + 1;
  
  for (let i = 0; i <= input.length - n; i++) {
    const ngram = input.substr(i, n);
    ngrams[ngram] = (ngrams[ngram] || 0) + 1;
  }
  
  const sorted = Object.entries(ngrams)
    .map(([ngram, count]) => ({
      ngram: ngram,
      count: count,
      percentage: (count / total * 100).toFixed(2)
    }))
    .sort((a, b) => b.count - a.count);
  
  return {
    ngramSize: n,
    totalNgrams: total,
    uniqueNgrams: Object.keys(ngrams).length,
    topNgrams: sorted.slice(0, 20),
    repetitionRate: (1 - Object.keys(ngrams).length / total).toFixed(4)
  };
}

// Hamming distance calculation
export function hammingDistance(str1, str2) {
  if (str1.length !== str2.length) {
    throw new Error('Strings must be of equal length');
  }
  
  let distance = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) {
      distance++;
    }
  }
  
  return {
    distance: distance,
    similarity: (1 - distance / str1.length).toFixed(4),
    percentage: ((1 - distance / str1.length) * 100).toFixed(2) + '%'
  };
}

// Levenshtein distance (edit distance)
export function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  const distance = matrix[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  
  return {
    distance: distance,
    similarity: (1 - distance / maxLength).toFixed(4),
    percentage: ((1 - distance / maxLength) * 100).toFixed(2) + '%',
    maxLength: maxLength
  };
}

// Byte frequency analysis
export function byteFrequencyAnalysis(input) {
  const bytes = new TextEncoder().encode(input);
  const freq = new Array(256).fill(0);
  
  for (const byte of bytes) {
    freq[byte]++;
  }
  
  const analysis = freq.map((count, byte) => ({
    byte: byte,
    hex: byte.toString(16).padStart(2, '0').toUpperCase(),
    char: byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.',
    count: count,
    percentage: (count / bytes.length * 100).toFixed(2)
  })).filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);
  
  return {
    totalBytes: bytes.length,
    uniqueBytes: analysis.length,
    frequencies: analysis,
    entropy: calculateByteEntropy(freq, bytes.length)
  };
}

// Language detection (basic)
export function detectLanguage(input) {
  const languages = {
    english: { e: 12.7, t: 9.1, a: 8.2, o: 7.5, i: 7.0, n: 6.7, s: 6.3, h: 6.1, r: 6.0 },
    spanish: { a: 12.5, e: 12.2, o: 8.7, s: 8.0, n: 6.8, r: 6.9, i: 6.2, l: 5.0, d: 5.9 },
    french: { e: 14.7, a: 7.6, i: 7.5, s: 7.9, n: 7.1, r: 6.5, t: 7.2, o: 5.4, l: 5.5 },
    german: { e: 17.4, n: 9.8, i: 7.5, s: 7.3, r: 7.0, a: 6.5, t: 6.2, d: 5.1, h: 4.8 }
  };
  
  const textFreq = {};
  const cleanText = input.toLowerCase().replace(/[^a-z]/g, '');
  
  for (const char of cleanText) {
    textFreq[char] = (textFreq[char] || 0) + 1;
  }
  
  // Convert to percentages
  const total = cleanText.length;
  for (const char in textFreq) {
    textFreq[char] = (textFreq[char] / total) * 100;
  }
  
  // Calculate correlation with each language
  const scores = {};
  for (const [lang, langFreq] of Object.entries(languages)) {
    let score = 0;
    for (const [char, expectedFreq] of Object.entries(langFreq)) {
      const actualFreq = textFreq[char] || 0;
      score += Math.abs(expectedFreq - actualFreq);
    }
    scores[lang] = score;
  }
  
  const bestMatch = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
  
  return {
    detectedLanguage: bestMatch[0],
    confidence: Math.max(0, (100 - bestMatch[1]).toFixed(2)),
    allScores: scores,
    textLength: cleanText.length
  };
}

// Helper function for entropy calculation
function calculateEntropy(freq, total) {
  let entropy = 0;
  for (const count of Object.values(freq)) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return entropy.toFixed(4);
}

function calculateByteEntropy(freq, total) {
  let entropy = 0;
  for (const count of freq) {
    if (count > 0) {
      const p = count / total;
      entropy -= p * Math.log2(p);
    }
  }
  return entropy.toFixed(4);
}

// Export all analysis functions
export const analysis = {
  frequencyAnalysis,
  indexOfCoincidence,
  chiSquaredTest,
  ngramAnalysis,
  hammingDistance,
  levenshteinDistance,
  byteFrequencyAnalysis,
  detectLanguage
};