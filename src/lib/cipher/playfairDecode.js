export function playfairDecode(s, keyStr = "MONARCHY") {
  // Generate 5x5 key matrix
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ"; // J=I
  const cleanKey = (String(keyStr) + alphabet).toUpperCase().replace(/J/g, 'I');
  const matrix = [];
  const used = new Set();
  
  for (const char of cleanKey) {
    if (!used.has(char) && alphabet.includes(char)) {
      matrix.push(char);
      used.add(char);
    }
  }
  
  // Create 5x5 grid
  const grid = [];
  for (let i = 0; i < 5; i++) {
    grid[i] = matrix.slice(i * 5, (i + 1) * 5);
  }
  
  // Find position of character
  const findPos = (char) => {
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (grid[i][j] === char) return [i, j];
      }
    }
    return [0, 0];
  };
  
  // Prepare text - ensure even length
  let text = s.toUpperCase().replace(/[^A-Z]/g, '');
  let pairs = [];
  
  for (let i = 0; i < text.length; i += 2) {
    if (i + 1 < text.length) {
      pairs.push(text[i] + text[i + 1]);
    }
  }
  
  // Decode pairs
  return pairs.map(pair => {
    const [r1, c1] = findPos(pair[0]);
    const [r2, c2] = findPos(pair[1]);
    
    if (r1 === r2) {
      // Same row - move left
      return grid[r1][(c1 + 4) % 5] + grid[r2][(c2 + 4) % 5];
    } else if (c1 === c2) {
      // Same column - move up
      return grid[(r1 + 4) % 5][c1] + grid[(r2 + 4) % 5][c2];
    } else {
      // Rectangle
      return grid[r1][c2] + grid[r2][c1];
    }
  }).join('');
}
