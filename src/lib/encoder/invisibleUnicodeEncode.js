export function invisibleUnicodeEncode(s) {
  const invisibleChars = ['\u200B', '\u200C', '\u200D', '\u2060'];
  return Array.from(s).map(c => {
    const code = c.charCodeAt(0);
    let binary = code.toString(2).padStart(8, '0');
    return binary.split('').map(bit => 
      bit === '0' ? invisibleChars[0] : invisibleChars[1]
    ).join('') + invisibleChars[2];
  }).join('');
}