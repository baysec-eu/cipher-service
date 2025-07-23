export function decodeInvisibleUnicode(s) {
  const invisibleChars = ['\u200B', '\u200C', '\u200D', '\u2060'];
  
  try {
    // Split by character separator (invisibleChars[2])
    const charGroups = s.split(invisibleChars[2]).filter(group => group.length > 0);
    
    return charGroups.map(group => {
      // Convert invisible chars back to binary
      const binary = group.split('').map(char => {
        if (char === invisibleChars[0]) return '0';
        if (char === invisibleChars[1]) return '1';
        return ''; // ignore other chars
      }).join('');
      
      // Convert 8-bit binary to character
      if (binary.length === 8) {
        const charCode = parseInt(binary, 2);
        return String.fromCharCode(charCode);
      }
      return '';
    }).join('');
  } catch (error) {
    // Fallback to simple invisible char removal
    let result = s;
    invisibleChars.forEach(char => {
      result = result.replace(new RegExp(char, 'g'), '');
    });
    return result;
  }
}
