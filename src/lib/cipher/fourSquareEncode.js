export function fourSquareEncode(s, keyStr1 = "EXAMPLE", keyStr2 = "KEYWORD") {
  // Create alphabets
  const createAlphabet = (key) => {
    const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // J=I
    const keyStr = (key + alphabet).toUpperCase().replace(/J/g, 'I');
    const result = [];
    const used = new Set();
    
    for (const char of keyStr) {
      if (!used.has(char) && alphabet.includes(char)) {
        result.push(char);
        used.add(char);
      }
    }
    return result;
  };
  
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ";
  const plain1 = Array.from(alphabet);
  const plain2 = Array.from(alphabet);
  const cipher1 = createAlphabet(keyStr1);
  const cipher2 = createAlphabet(keyStr2);
  
  // Create grids
  const grids = [plain1, cipher1, cipher2, plain2].map(chars => {
    const grid = [];
    for (let i = 0; i < 5; i++) {
      grid[i] = chars.slice(i * 5, (i + 1) * 5);
    }
    return grid;
  });
  
  // Find position
  const findPos = (char, gridIndex) => {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (grids[gridIndex][i][j] === char) return [i, j];
      }
    }
    return [0, 0];
  };
  
  // Prepare text
  let text = s.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
  if (text.length % 2 === 1) text += 'X';
  
  let result = '';
  for (let i = 0; i < text.length; i += 2) {
    const [r1, c1] = findPos(text[i], 0);
    const [r2, c2] = findPos(text[i + 1], 3);
    
    result += grids[1][r1][c2] + grids[2][r2][c1];
  }
  
  return result;
}