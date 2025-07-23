export function bifidDecode(s, keyStr = "MONARCHY") {
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
  
  // Convert cipher to coordinates
  const text = s.toUpperCase().replace(/[^A-Z]/g, '');
  const combined = [];
  
  for (const char of text) {
    if (coords[char]) {
      combined.push(...coords[char]);
    }
  }
  
  // Split into rows and columns
  const midpoint = combined.length / 2;
  const rows = combined.slice(0, midpoint);
  const cols = combined.slice(midpoint);
  
  // Convert back to letters
  let result = '';
  for (let i = 0; i < rows.length; i++) {
    const key = `${rows[i]},${cols[i]}`;
    result += reverseCoords[key] || '';
  }
  
  return result;
}
