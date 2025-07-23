export function decodeMathUnicodeChr(s) {
  // Decode mathematical Unicode chr() format back to original string
  
  if (!s) return '';
  
  try {
    // Match patterns like 𝚌𝚑𝚛(123) with optional + and spaces
    const chrPattern = /𝚌𝚑𝚛\((\d+)\)/g;
    const matches = [];
    let match;
    
    while ((match = chrPattern.exec(s)) !== null) {
      matches.push(parseInt(match[1], 10));
    }
    
    // Convert character codes back to string
    return matches.map(code => String.fromCharCode(code)).join('');
    
  } catch (error) {
    // Fallback: try to extract numbers and convert them
    const numbers = s.match(/\d+/g);
    if (numbers) {
      return numbers.map(num => String.fromCharCode(parseInt(num, 10))).join('');
    }
    return s;
  }
}