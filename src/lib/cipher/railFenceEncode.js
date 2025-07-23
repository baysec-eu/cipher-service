export function railFenceEncode(s, rails = 3) {
  if (rails === 1) return s;
  
  const fence = Array(rails).fill().map(() => []);
  let rail = 0;
  let direction = 1;
  
  for (const char of s) {
    fence[rail].push(char);
    rail += direction;
    
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }
  
  return fence.flat().join('');
}