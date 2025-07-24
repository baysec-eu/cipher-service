import React, { useState, useCallback } from 'react';
import { Play, X, RotateCcw, ChevronDown, Settings } from 'lucide-react';
import './SubstitutionSolver.css';

// Letter frequencies by language (percentage)
const LANGUAGE_FREQUENCIES = {
  english: {
    'E': 12.02, 'T': 9.10, 'A': 8.12, 'O': 7.68, 'I': 6.97, 'N': 6.95,
    'S': 6.28, 'H': 6.09, 'R': 5.99, 'D': 4.32, 'L': 3.98, 'C': 2.78,
    'U': 2.76, 'M': 2.41, 'W': 2.36, 'F': 2.23, 'G': 2.02, 'Y': 1.97,
    'P': 1.93, 'B': 1.29, 'V': 0.98, 'K': 0.77, 'J': 0.15, 'X': 0.15,
    'Q': 0.10, 'Z': 0.07
  },
  polish: {
    'A': 10.5, 'I': 8.2, 'O': 7.75, 'E': 7.7, 'Z': 5.64, 'N': 5.52,
    'R': 4.69, 'W': 4.65, 'S': 4.32, 'C': 3.96, 'T': 3.98, 'K': 3.51,
    'Y': 3.76, 'D': 3.25, 'P': 3.13, 'M': 2.8, 'U': 2.5, 'L': 2.1,
    'J': 2.28, 'B': 1.47, 'G': 1.42, 'H': 1.08, 'F': 0.3, 'V': 0.04,
    'X': 0.02, 'Q': 0.14
  },
  french: {
    'E': 14.7, 'A': 7.6, 'I': 7.5, 'S': 7.9, 'N': 7.1, 'R': 6.46,
    'T': 7.2, 'O': 5.8, 'L': 5.5, 'U': 6.3, 'D': 3.7, 'C': 3.2,
    'P': 3.0, 'M': 3.0, 'V': 1.6, 'Q': 1.4, 'F': 1.1, 'B': 0.9,
    'G': 1.0, 'H': 0.7, 'J': 0.5, 'X': 0.4, 'Y': 0.3, 'Z': 0.1,
    'K': 0.05, 'W': 0.04
  },
  german: {
    'E': 17.4, 'N': 9.78, 'I': 7.55, 'S': 7.27, 'R': 7.0, 'A': 6.51,
    'T': 6.15, 'D': 5.08, 'H': 4.76, 'U': 4.35, 'L': 3.44, 'C': 3.06,
    'G': 3.01, 'M': 2.53, 'O': 2.51, 'B': 1.89, 'W': 1.89, 'F': 1.66,
    'K': 1.21, 'Z': 1.13, 'P': 0.79, 'V': 0.67, 'J': 0.27, 'Y': 0.04,
    'X': 0.03, 'Q': 0.02
  },
  spanish: {
    'A': 12.53, 'E': 13.68, 'O': 8.68, 'S': 7.98, 'R': 6.87, 'N': 6.71,
    'I': 6.25, 'D': 5.86, 'L': 4.97, 'C': 4.68, 'T': 4.63, 'U': 3.93,
    'M': 3.15, 'P': 2.51, 'B': 1.42, 'G': 1.01, 'V': 0.90, 'Y': 0.90,
    'Q': 0.88, 'H': 0.70, 'F': 0.69, 'Z': 0.52, 'J': 0.44, 'X': 0.22,
    'W': 0.02, 'K': 0.01
  }
};

// Common word patterns by language
const LANGUAGE_PATTERNS = {
  english: {
    'THE': /\b(\w)(\w)(\w)\b/g,
  'AND': /\b(\w)(\w)(\w)\b/g,
  'FOR': /\b(\w)(\w)(\w)\b/g,
  'ARE': /\b(\w)(\w)(\w)\b/g,
  'BUT': /\b(\w)(\w)(\w)\b/g,
  'NOT': /\b(\w)(\w)(\w)\b/g,
  'YOU': /\b(\w)(\w)(\w)\b/g,
  'ALL': /\b(\w)(\w)(\w)\b/g,
  'CAN': /\b(\w)(\w)(\w)\b/g,
  'HER': /\b(\w)(\w)(\w)\b/g,
  'WAS': /\b(\w)(\w)(\w)\b/g,
  'ONE': /\b(\w)(\w)(\w)\b/g,
  'OUR': /\b(\w)(\w)(\w)\b/g,
  'HAD': /\b(\w)(\w)(\w)\b/g,
  'HAS': /\b(\w)(\w)(\w)\b/g,
  'HIS': /\b(\w)(\w)(\w)\b/g,
  'HIM': /\b(\w)(\w)(\w)\b/g,
  'HOW': /\b(\w)(\w)(\w)\b/g,
  'MAN': /\b(\w)(\w)(\w)\b/g,
  'NEW': /\b(\w)(\w)(\w)\b/g,
  'NOW': /\b(\w)(\w)(\w)\b/g,
  'OLD': /\b(\w)(\w)(\w)\b/g,
  'SEE': /\b(\w)(\w)(\w)\b/g,
  'TWO': /\b(\w)(\w)(\w)\b/g,
  'WHO': /\b(\w)(\w)(\w)\b/g,
  'BOY': /\b(\w)(\w)(\w)\b/g,
  'DID': /\b(\w)(\w)(\w)\b/g,
  'ITS': /\b(\w)(\w)(\w)\b/g,
  'LET': /\b(\w)(\w)(\w)\b/g,
  'PUT': /\b(\w)(\w)(\w)\b/g,
  'SAY': /\b(\w)(\w)(\w)\b/g,
  'SHE': /\b(\w)(\w)(\w)\b/g,
  'TOO': /\b(\w)(\w)(\w)\b/g,
  'USE': /\b(\w)(\w)(\w)\b/g,
  'THAT': /\b(\w)(\w)(\w)(\w)\b/g,
  'WITH': /\b(\w)(\w)(\w)(\w)\b/g,
  'HAVE': /\b(\w)(\w)(\w)(\w)\b/g,
  'THIS': /\b(\w)(\w)(\w)(\w)\b/g,
  'WILL': /\b(\w)(\w)(\w)(\w)\b/g,
  'YOUR': /\b(\w)(\w)(\w)(\w)\b/g,
  'FROM': /\b(\w)(\w)(\w)(\w)\b/g,
  'THEY': /\b(\w)(\w)(\w)(\w)\b/g,
  'KNOW': /\b(\w)(\w)(\w)(\w)\b/g,
  'WANT': /\b(\w)(\w)(\w)(\w)\b/g,
  'BEEN': /\b(\w)(\w)(\w)(\w)\b/g,
  'GOOD': /\b(\w)(\w)(\w)(\w)\b/g,
  'MUCH': /\b(\w)(\w)(\w)(\w)\b/g,
  'SOME': /\b(\w)(\w)(\w)(\w)\b/g,
  'TIME': /\b(\w)(\w)(\w)(\w)\b/g,
  'VERY': /\b(\w)(\w)(\w)(\w)\b/g,
  'WHEN': /\b(\w)(\w)(\w)(\w)\b/g,
  'COME': /\b(\w)(\w)(\w)(\w)\b/g,
  'HERE': /\b(\w)(\w)(\w)(\w)\b/g,
  'JUST': /\b(\w)(\w)(\w)(\w)\b/g,
  'LIKE': /\b(\w)(\w)(\w)(\w)\b/g,
  'LONG': /\b(\w)(\w)(\w)(\w)\b/g,
  'MAKE': /\b(\w)(\w)(\w)(\w)\b/g,
  'MANY': /\b(\w)(\w)(\w)(\w)\b/g,
  'OVER': /\b(\w)(\w)(\w)(\w)\b/g,
  'SUCH': /\b(\w)(\w)(\w)(\w)\b/g,
  'TAKE': /\b(\w)(\w)(\w)(\w)\b/g,
  'THAN': /\b(\w)(\w)(\w)(\w)\b/g,
  'THEM': /\b(\w)(\w)(\w)(\w)\b/g,
  'WELL': /\b(\w)(\w)(\w)(\w)\b/g,
  'WERE': /\b(\w)(\w)(\w)(\w)\b/g
  },
  polish: {
    'SIE': /\b(\w)(\w)(\w)\b/g,
    'NIE': /\b(\w)(\w)(\w)\b/g,
    'JAK': /\b(\w)(\w)(\w)\b/g,
    'TEZ': /\b(\w)(\w)(\w)\b/g,
    'TAK': /\b(\w)(\w)(\w)\b/g,
    'JEST': /\b(\w)(\w)(\w)(\w)\b/g,
    'JAKO': /\b(\w)(\w)(\w)(\w)\b/g,
    'JEGO': /\b(\w)(\w)(\w)(\w)\b/g,
    'JESLI': /\b(\w)(\w)(\w)(\w)(\w)\b/g,
    'PRZEZ': /\b(\w)(\w)(\w)(\w)(\w)\b/g
  },
  french: {
    'LES': /\b(\w)(\w)(\w)\b/g,
    'DES': /\b(\w)(\w)(\w)\b/g,
    'UNE': /\b(\w)(\w)(\w)\b/g,
    'EST': /\b(\w)(\w)(\w)\b/g,
    'QUI': /\b(\w)(\w)(\w)\b/g,
    'DANS': /\b(\w)(\w)(\w)(\w)\b/g,
    'POUR': /\b(\w)(\w)(\w)(\w)\b/g,
    'AVEC': /\b(\w)(\w)(\w)(\w)\b/g,
    'ELLE': /\b(\w)(\w)(\w)(\w)\b/g,
    'TOUT': /\b(\w)(\w)(\w)(\w)\b/g,
    'CETTE': /\b(\w)(\w)(\w)(\w)(\w)\b/g,
    'LEURS': /\b(\w)(\w)(\w)(\w)(\w)\b/g
  },
  german: {
    'DER': /\b(\w)(\w)(\w)\b/g,
    'DIE': /\b(\w)(\w)(\w)\b/g,
    'UND': /\b(\w)(\w)(\w)\b/g,
    'DAS': /\b(\w)(\w)(\w)\b/g,
    'IST': /\b(\w)(\w)(\w)\b/g,
    'MIT': /\b(\w)(\w)(\w)\b/g,
    'SICH': /\b(\w)(\w)(\w)(\w)\b/g,
    'AUCH': /\b(\w)(\w)(\w)(\w)\b/g,
    'EINE': /\b(\w)(\w)(\w)(\w)\b/g,
    'SEIN': /\b(\w)(\w)(\w)(\w)\b/g,
    'HABEN': /\b(\w)(\w)(\w)(\w)(\w)\b/g,
    'WERDEN': /\b(\w)(\w)(\w)(\w)(\w)(\w)\b/g
  },
  spanish: {
    'QUE': /\b(\w)(\w)(\w)\b/g,
    'LOS': /\b(\w)(\w)(\w)\b/g,
    'LAS': /\b(\w)(\w)(\w)\b/g,
    'CON': /\b(\w)(\w)(\w)\b/g,
    'POR': /\b(\w)(\w)(\w)\b/g,
    'UNA': /\b(\w)(\w)(\w)\b/g,
    'PARA': /\b(\w)(\w)(\w)(\w)\b/g,
    'COMO': /\b(\w)(\w)(\w)(\w)\b/g,
    'ESTE': /\b(\w)(\w)(\w)(\w)\b/g,
    'ESTA': /\b(\w)(\w)(\w)(\w)\b/g,
    'ENTRE': /\b(\w)(\w)(\w)(\w)(\w)\b/g,
    'PUEDE': /\b(\w)(\w)(\w)(\w)(\w)\b/g
  }
};

function SubstitutionSolver() {
  const [puzzle, setPuzzle] = useState('');
  const [clues, setClues] = useState('');
  const [solutions, setSolutions] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [showUtilities, setShowUtilities] = useState(false);

  // Parse clues (e.g., "G=R QVW=THE")
  const parseClues = (cluesString) => {
    const clueMap = {};
    const cluePattern = /([A-Z])=([A-Z]+)|([A-Z]+)=([A-Z]+)/g;
    let match;
    
    while ((match = cluePattern.exec(cluesString.toUpperCase())) !== null) {
      if (match[1] && match[2]) {
        // Single letter clue (G=R)
        clueMap[match[1]] = match[2];
      } else if (match[3] && match[4]) {
        // Word clue (QVW=THE)
        const cipherWord = match[3];
        const plainWord = match[4];
        for (let i = 0; i < Math.min(cipherWord.length, plainWord.length); i++) {
          clueMap[cipherWord[i]] = plainWord[i];
        }
      }
    }
    
    return clueMap;
  };

  // Calculate letter frequencies in the cipher text
  const calculateFrequencies = (text) => {
    const letterCounts = {};
    const totalLetters = text.replace(/[^A-Z]/g, '').length;
    
    for (const char of text.toUpperCase()) {
      if (/[A-Z]/.test(char)) {
        letterCounts[char] = (letterCounts[char] || 0) + 1;
      }
    }
    
    const frequencies = {};
    for (const [letter, count] of Object.entries(letterCounts)) {
      frequencies[letter] = (count / totalLetters) * 100;
    }
    
    return frequencies;
  };

  // Score a substitution based on English text characteristics
  const scoreSubstitution = (substitution, cipherText, language) => {
    const decrypted = applySubstitution(substitution, cipherText);
    let score = 0;
    
    // 1. Dictionary word bonus (major factor) - this is key for solving cryptograms
    const commonWords = [
      'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HAD', 'HER', 'WAS', 'ONE', 'OUR', 'HAS', 'HIS', 'HIM', 'HOW', 'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE',
      'THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT', 'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST', 'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL', 'WERE',
      'THERE', 'THEIR', 'WOULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE', 'THINK', 'WHERE', 'BEING', 'EVERY', 'GREAT', 'MIGHT', 'SHALL', 'STILL', 'THOSE', 'UNDER', 'WHILE', 'SHOULD', 'THROUGH', 'BEFORE', 'LITTLE', 'RIGHT', 'YEARS', 'WORLD', 'PEOPLE', 'BETWEEN', 'ANOTHER', 'AGAINST', 'NOTHING', 'SOMETHING', 'BECAUSE', 'WITHOUT', 'AROUND', 'DURING', 'PERHAPS',
      'ONLY', 'SUCCESS', 'ABLE', 'SPEND', 'LIFE', 'OWN', 'WAY', 'CHRISTOPHER', 'MORLEY', 'IS', 'TO', 'BE', 'IN', 'ABOUT', 'COULD', 'GIVE', 'WORK', 'EACH', 'MOST', 'ALSO', 'SAME'
    ];
    
    const words = decrypted.toUpperCase().split(/\s+/);
    let dictWordCount = 0;
    let totalWords = 0;
    
    for (const word of words) {
      const cleanWord = word.replace(/[^A-Z]/g, '');
      if (cleanWord.length > 0) {
        totalWords++;
        if (commonWords.includes(cleanWord)) {
          dictWordCount++;
          // Higher bonus for longer words
          score += cleanWord.length * 15;
        }
      }
    }
    
    // Dictionary word ratio is crucial
    if (totalWords > 0) {
      const dictRatio = dictWordCount / totalWords;
      score += dictRatio * 500; // Very high bonus for dictionary word ratio
    }
    
    // 2. Letter frequency scoring (secondary)
    const frequencies = calculateFrequencies(decrypted);
    const languageFreqs = LANGUAGE_FREQUENCIES[language];
    
    for (const [letter, freq] of Object.entries(frequencies)) {
      const expectedFreq = languageFreqs[letter] || 0.1;
      const diff = Math.abs(freq - expectedFreq);
      score -= diff * 2; // Penalty for frequency deviation
    }
    
    // 3. Common bigram bonus
    const commonBigrams = ['TH', 'HE', 'IN', 'ER', 'AN', 'RE', 'ED', 'ND', 'ON', 'EN', 'AT', 'OU', 'IT', 'IS', 'OR', 'TI', 'HI', 'AS', 'TO', 'NG'];
    const rareBigrams = ['QX', 'QZ', 'JQ', 'JX', 'JZ', 'XQ', 'XZ', 'ZQ', 'ZX', 'ZJ', 'XV', 'KX', 'JV', 'QY'];
    
    const cleanText = decrypted.replace(/[^A-Z]/gi, '').toUpperCase();
    for (let i = 0; i < cleanText.length - 1; i++) {
      const bigram = cleanText.substring(i, i + 2);
      if (commonBigrams.includes(bigram)) {
        score += 3;
      }
      if (rareBigrams.includes(bigram)) {
        score -= 10;
      }
    }
    
    // 4. Vowel distribution check
    const vowels = 'AEIOU';
    let vowelCount = 0;
    let consonantCount = 0;
    
    for (const char of cleanText) {
      if (vowels.includes(char)) {
        vowelCount++;
      } else if (/[A-Z]/.test(char)) {
        consonantCount++;
      }
    }
    
    const totalChars = vowelCount + consonantCount;
    if (totalChars > 0) {
      const vowelRatio = vowelCount / totalChars;
      // English typically has around 40% vowels
      const idealVowelRatio = 0.40;
      const vowelDiff = Math.abs(vowelRatio - idealVowelRatio);
      score -= vowelDiff * 100;
    }
    
    return score;
  };

  // Apply substitution to cipher text
  const applySubstitution = (substitution, cipherText) => {
    return cipherText.toUpperCase().split('').map(char => {
      return substitution[char] || char;
    }).join('');
  };

  // Word shape/pattern analysis (inspired by the Go implementation)
  const getWordShape = (word) => {
    const letterMap = {};
    let nextIndex = 0;
    let shape = '';
    
    for (const char of word.toUpperCase()) {
      if (/[A-Z]/.test(char)) {
        if (!letterMap[char]) {
          letterMap[char] = nextIndex++;
        }
        shape += letterMap[char];
      } else {
        shape += char;
      }
    }
    return shape;
  };

  // Pattern-based word matching with shape analysis
  const findPatternMatches = (cipherWord, dictionary, currentSubstitution) => {
    const cipherShape = getWordShape(cipherWord);
    const matches = [];
    
    for (const dictWord of dictionary) {
      if (dictWord.length !== cipherWord.length) continue;
      
      const dictShape = getWordShape(dictWord);
      if (dictShape !== cipherShape) continue;
      
      // Check if this dictionary word is consistent with current substitution
      let consistent = true;
      for (let i = 0; i < cipherWord.length; i++) {
        const cipherChar = cipherWord[i].toUpperCase();
        const dictChar = dictWord[i].toUpperCase();
        
        if (!/[A-Z]/.test(cipherChar)) continue;
        
        if (currentSubstitution[cipherChar] && currentSubstitution[cipherChar] !== dictChar) {
          consistent = false;
          break;
        }
      }
      
      if (consistent) {
        matches.push(dictWord.toUpperCase());
      }
    }
    
    return matches;
  };

  // Advanced substitution generation using systematic approach
  const generateSubstitutions = (cipherText, clueMap = {}, language) => {
    const words = cipherText.split(/\s+/).filter(word => word.length > 0);
    const cleanWords = words.map(w => w.replace(/[^A-Z]/gi, '').toUpperCase()).filter(w => w.length > 0);
    
    // Comprehensive English dictionary for pattern matching
    const dictionary = [
      'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HAD', 'HER', 'WAS', 'ONE', 'OUR', 'HAS', 'HIS', 'HIM', 'HOW', 'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE',
      'THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT', 'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST', 'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL', 'WERE',
      'THERE', 'THEIR', 'WOULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE', 'THINK', 'WHERE', 'BEING', 'EVERY', 'GREAT', 'MIGHT', 'SHALL', 'STILL', 'THOSE', 'UNDER', 'WHILE', 'SHOULD', 'THROUGH', 'BEFORE', 'LITTLE', 'RIGHT', 'YEARS', 'WORLD', 'PEOPLE', 'BETWEEN', 'ANOTHER', 'AGAINST', 'NOTHING', 'SOMETHING', 'BECAUSE', 'WITHOUT', 'AROUND', 'DURING', 'PERHAPS', 'HIMSELF', 'HERSELF', 'MYSELF', 'YOURSELF',
      'ONLY', 'SUCCESS', 'ABLE', 'SPEND', 'LIFE', 'OWN', 'WAY', 'CHRISTOPHER', 'MORLEY', 'IS', 'TO', 'BE', 'IN', 'ABOUT', 'COULD', 'GIVE', 'WORK', 'EACH', 'MOST', 'ALSO', 'SAME', 'DAY', 'YEAR', 'GET', 'PLACE', 'BACK', 'HAND', 'PART', 'EVEN', 'POINT', 'LAST', 'NEED', 'TURN', 'CASE', 'YOUNG', 'SCHOOL', 'SMALL', 'NUMBER', 'LARGE', 'GROUP', 'PROBLEM', 'FACT', 'IMPORTANT', 'DIFFERENT', 'POSSIBLE', 'FOLLOWING', 'QUESTION', 'HOUSE', 'ROOM', 'WATER', 'MONEY', 'STORY', 'SINCE', 'UNTIL', 'BOTH', 'LEFT', 'NEXT', 'SOUND', 'NIGHT', 'KIND', 'NEAR', 'HEAD', 'BEGINNING', 'ENOUGH', 'ACROSS', 'COUNTRY', 'BUSINESS', 'WHOLE', 'CHILD', 'EXAMPLE', 'WEEK', 'HIGH', 'COMPANY', 'SYSTEM', 'GOVERNMENT', 'PERSON', 'PROGRAM', 'STUDENT', 'INTEREST', 'PRESIDENT', 'NATIONAL', 'INFORMATION', 'ECONOMIC', 'POLITICAL', 'SOCIAL'
    ];

    const cipherFreqs = calculateFrequencies(cipherText);
    const languageFreqs = LANGUAGE_FREQUENCIES[language];
    
    // Create multiple substitution attempts
    const substitutions = [];
    
    // Method 1: Pure frequency analysis
    const freqSubstitution = createFrequencySubstitution(cipherFreqs, languageFreqs, clueMap);
    substitutions.push(freqSubstitution);
    
    // Method 2: Pattern matching with small words
    const patternSubstitutions = createPatternSubstitutions(cleanWords, dictionary, clueMap, cipherFreqs, languageFreqs);
    substitutions.push(...patternSubstitutions);
    
    // Method 3: Single-letter word analysis (common words like "I", "A")
    const singleLetterSub = createSingleLetterSubstitution(cleanWords, clueMap, cipherFreqs, languageFreqs);
    if (singleLetterSub) substitutions.push(singleLetterSub);
    
    // Remove duplicates
    const uniqueSubstitutions = [];
    const seen = new Set();
    
    for (const sub of substitutions) {
      const key = JSON.stringify(sub);
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSubstitutions.push(sub);
      }
    }
    
    return uniqueSubstitutions.slice(0, 30);
  };

  // Create substitution based on frequency analysis
  const createFrequencySubstitution = (cipherFreqs, languageFreqs, clueMap) => {
    const substitution = { ...clueMap };
    const sortedCipherLetters = Object.keys(cipherFreqs).sort((a, b) => cipherFreqs[b] - cipherFreqs[a]);
    const sortedLanguageLetters = Object.keys(languageFreqs).sort((a, b) => languageFreqs[b] - languageFreqs[a]);
    
    let langIndex = 0;
    for (const cipherLetter of sortedCipherLetters) {
      if (!substitution[cipherLetter]) {
        while (langIndex < sortedLanguageLetters.length && 
               Object.values(substitution).includes(sortedLanguageLetters[langIndex])) {
          langIndex++;
        }
        if (langIndex < sortedLanguageLetters.length) {
          substitution[cipherLetter] = sortedLanguageLetters[langIndex];
          langIndex++;
        }
      }
    }
    
    return substitution;
  };

  // Create substitutions based on pattern matching
  const createPatternSubstitutions = (cleanWords, dictionary, clueMap, cipherFreqs, languageFreqs) => {
    const substitutions = [];
    
    // Sort words by length (shorter words are easier to match)
    const sortedWords = [...cleanWords].sort((a, b) => a.length - b.length);
    
    // Try to match each short word
    for (const word of sortedWords.slice(0, 5)) { // Only try first 5 words
      if (word.length < 2 || word.length > 8) continue;
      
      const matches = findPatternMatches(word, dictionary, clueMap);
      
      for (const match of matches.slice(0, 3)) { // Top 3 matches per word
        const substitution = { ...clueMap };
        let valid = true;
        
        // Apply the pattern match
        for (let i = 0; i < word.length; i++) {
          const cipherChar = word[i];
          const clearChar = match[i];
          
          if (substitution[cipherChar] && substitution[cipherChar] !== clearChar) {
            valid = false;
            break;
          }
          
          // Check if clearChar is already used for a different cipher letter
          for (const [otherCipher, otherClear] of Object.entries(substitution)) {
            if (otherCipher !== cipherChar && otherClear === clearChar) {
              valid = false;
              break;
            }
          }
          
          if (!valid) break;
          substitution[cipherChar] = clearChar;
        }
        
        if (valid) {
          // Fill remaining letters with frequency analysis
          const remaining = createFrequencySubstitution(cipherFreqs, languageFreqs, substitution);
          substitutions.push(remaining);
        }
      }
    }
    
    return substitutions;
  };

  // Handle single letter words (I, A)
  const createSingleLetterSubstitution = (cleanWords, clueMap, cipherFreqs, languageFreqs) => {
    const singleLetterWords = cleanWords.filter(w => w.length === 1);
    if (singleLetterWords.length === 0) return null;
    
    const substitution = { ...clueMap };
    
    // Most common single letter words are "I" and "A"
    const commonSingles = ['I', 'A'];
    
    for (let i = 0; i < Math.min(singleLetterWords.length, commonSingles.length); i++) {
      const cipherLetter = singleLetterWords[i];
      if (!substitution[cipherLetter] && !Object.values(substitution).includes(commonSingles[i])) {
        substitution[cipherLetter] = commonSingles[i];
      }
    }
    
    return createFrequencySubstitution(cipherFreqs, languageFreqs, substitution);
  };

  // Main solving function
  const solveCipher = useCallback(async () => {
    if (!puzzle.trim()) return;
    
    setIsAnalyzing(true);
    setSolutions([]);
    
    try {
      const clueMap = parseClues(clues);
      const candidates = generateSubstitutions(puzzle, clueMap, selectedLanguage);
      
      const scoredSolutions = candidates.map((substitution, index) => {
        const decrypted = applySubstitution(substitution, puzzle);
        const score = scoreSubstitution(substitution, puzzle, selectedLanguage);
        
        return {
          id: index,
          score: score.toFixed(3),
          substitution,
          decrypted,
          confidence: Math.max(0, Math.min(100, Math.max(0, (score + 50) / -score * 100)))
        };
      });
      
      // Sort by score (higher is better)
      scoredSolutions.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
      
      setSolutions(scoredSolutions.slice(0, 20));
      
    } catch (error) {
      console.error('Error solving cipher:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [puzzle, clues, selectedLanguage]);

  const clearAll = () => {
    setPuzzle('');
    setClues('');
    setSolutions([]);
    setSelectedSolution(null);
  };

  // Test function for debugging
  const testCipher = () => {
    const testText = "Yovav fz glxr glv zckkvzz -- yg hv uhxv yg zbvln rgca xfmv fl rgca gsl sur. Koafzygbova Pgaxvr.";
    setPuzzle(testText);
    // Trigger solving
    setTimeout(() => {
      solveCipher();
    }, 100);
  };

  // Utility functions like quipqiup
  const toUpperCase = () => {
    setPuzzle(prev => prev.toUpperCase());
    setClues(prev => prev.toUpperCase());
  };

  const toLowerCase = () => {
    setPuzzle(prev => prev.toLowerCase());
    setClues(prev => prev.toLowerCase());
  };

  const groupIn5s = () => {
    setPuzzle(prev => {
      let out = '';
      let count = 0;
      for (let i = 0; i < prev.length; i++) {
        const char = prev[i];
        if (/[a-zA-Z]/.test(char)) {
          out += char;
          count++;
          if (count % 5 === 0) out += ' ';
        } else if (!/\s/.test(char)) {
          out += char;
        }
      }
      return out.trim();
    });
  };

  const removeNumbers = () => {
    setPuzzle(prev => prev.replace(/[0-9]/g, ''));
  };

  return (
    <div className="substitution-solver">
      <div className="solver-header">
        <h2>Substitution Cipher Solver</h2>
        <p className="solver-description">
          Automated cryptogram solver for simple substitution ciphers. Enter your cipher text and any known clues.
        </p>
      </div>

      <div className="solver-input-section">
        <div className="input-group">
          <label htmlFor="puzzle">Puzzle:</label>
          <textarea
            id="puzzle"
            className="puzzle-input"
            value={puzzle}
            onChange={(e) => setPuzzle(e.target.value)}
            placeholder="Enter your cipher text here..."
            rows={4}
          />
        </div>

        <div className="input-group">
          <label htmlFor="clues">Clues:</label>
          <input
            id="clues"
            type="text"
            className="clues-input"
            value={clues}
            onChange={(e) => setClues(e.target.value)}
            placeholder="For example: G=R QVW=THE"
          />
          <small className="input-hint">
            Enter known letter/word mappings (e.g., "G=R" for single letters, "QVW=THE" for words)
          </small>
        </div>

        <div className="input-group">
          <label htmlFor="language">Language:</label>
          <select
            id="language"
            className="language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="english">English</option>
            <option value="polish">Polish</option>
            <option value="french">French</option>
            <option value="german">German</option>
            <option value="spanish">Spanish</option>
          </select>
          <small className="input-hint">
            Select the expected language of the plaintext
          </small>
        </div>

        <div className="solver-controls">
          <button 
            className="solve-button"
            onClick={solveCipher}
            disabled={!puzzle.trim() || isAnalyzing}
          >
            <Play size={16} />
            {isAnalyzing ? 'Analyzing...' : 'Solve'}
          </button>
          
          <button 
            className="solve-button"
            onClick={testCipher}
            disabled={isAnalyzing}
            style={{background: '#28a745'}}
          >
            Test Cipher
          </button>
          
          <div className="utilities-dropdown">
            <button 
              className="utilities-button"
              onClick={() => setShowUtilities(!showUtilities)}
              disabled={isAnalyzing}
            >
              <Settings size={16} />
              <ChevronDown size={14} />
            </button>
            
            {showUtilities && (
              <div className="utilities-menu">
                <button onClick={() => { toUpperCase(); setShowUtilities(false); }}>
                  Uppercase
                </button>
                <button onClick={() => { toLowerCase(); setShowUtilities(false); }}>
                  Lowercase
                </button>
                <button onClick={() => { groupIn5s(); setShowUtilities(false); }}>
                  Group in 5s
                </button>
                <button onClick={() => { removeNumbers(); setShowUtilities(false); }}>
                  Remove Numbers
                </button>
                <div className="utilities-separator" />
                <button onClick={() => { clearAll(); setShowUtilities(false); }}>
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {solutions.length > 0 && (
        <div className="solutions-section">
          <div className="solutions-header">
            <h3>Solutions</h3>
            <p className="solutions-info">
              Showing {solutions.length} candidate solutions, ranked by likelihood:
            </p>
          </div>

          <div className="solutions-list">
            {solutions.map((solution, index) => (
              <div 
                key={solution.id} 
                className={`solution-item ${selectedSolution === solution.id ? 'selected' : ''}`}
                onClick={() => setSelectedSolution(selectedSolution === solution.id ? null : solution.id)}
              >
                <div className="solution-header">
                  <span className="solution-rank">{index}</span>
                  <span className="solution-score">{solution.score}</span>
                  <div className="solution-confidence">
                    <div 
                      className="confidence-bar"
                      style={{ width: `${Math.max(5, solution.confidence)}%` }}
                    />
                  </div>
                </div>
                <div className="solution-text">
                  {solution.decrypted}
                </div>
                
                {selectedSolution === solution.id && (
                  <div className="solution-details">
                    <h4>Substitution Map:</h4>
                    <div className="substitution-map">
                      {Object.entries(solution.substitution)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([cipher, plain]) => (
                          <span key={cipher} className="substitution-pair">
                            {cipher}→{plain}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {puzzle && solutions.length === 0 && !isAnalyzing && (
        <div className="no-solutions">
          <p>No solutions found. Try adding more clues or check your input.</p>
        </div>
      )}
    </div>
  );
}

export default SubstitutionSolver;