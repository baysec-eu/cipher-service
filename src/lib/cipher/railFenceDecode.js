export function railFenceDecode(s, rails = 3) {
  if (rails === 1) return s;
  
  const fence = Array(rails).fill().map(() => []);
  const pattern = [];
  let rail = 0;
  let direction = 1;
  
  // Mark positions
  for (let i = 0; i < s.length; i++) {
    pattern.push(rail);
    rail += direction;
    
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }
  
  // Fill fence
  let index = 0;
  for (let r = 0; r < rails; r++) {
    for (let i = 0; i < s.length; i++) {
      if (pattern[i] === r) {
        fence[r].push(s[index++]);
      } else {
        fence[r].push(null);
      }
    }
  }
  
  // Read off
  let result = '';
  rail = 0;
  direction = 1;
  let pos = Array(rails).fill(0);
  
  for (let i = 0; i < s.length; i++) {
    result += fence[rail][pos[rail]++];
    rail += direction;
    
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }
  
  return result;
}