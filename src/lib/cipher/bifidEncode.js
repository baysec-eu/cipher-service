export function bifidEncode(s, keyStr = "MONARCHY") {
  // Create 5x5 key square
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // J=I
  const cleanKey = (String(keyStr) + alphabet).toUpperCase().replace(/J/g, 'I');
  const square = [];
  const used = new Set();
  
  for (const char of cleanKey) {
    if (!used.has(char) && alphabet.includes(char)) {
      square.push(char);
      used.add(char);
    }
  }
  
  // Create coordinate mappings
  const coords = {};
  const reverseCoords = {};
  
  for (let i = 0; i < 25; i++) {
    const char = square[i];
    const row = Math.floor(i / 5) + 1;
    const col = (i % 5) + 1;
    coords[char] = [row, col];
    reverseCoords[`${row},${col}`] = char;
  }
  
  // Convert to coordinates
  const text = s.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  const rows = [];
  const cols = [];
  
  for (const char of text) {
    if (coords[char]) {
      rows.push(coords[char][0]);
      cols.push(coords[char][1]);
    }
  }
  
  // Combine coordinates
  const combined = [...rows, ...cols];
  
  // Convert back to letters
  let result = '';
  for (let i = 0; i < combined.length; i += 2) {
    if (i + 1 < combined.length) {
      const key = `${combined[i]},${combined[i + 1]}`;
      result += reverseCoords[key] || '';
    }
  }
  
  return result;
}