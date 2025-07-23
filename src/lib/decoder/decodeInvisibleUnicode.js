export function decodeInvisibleUnicode(s) {
  const invisibleChars = ['\u200B', '\u200C', '\u200D', '\u2060', '\uFEFF'];
  let result = s;
  
  invisibleChars.forEach(char => {
    result = result.replace(new RegExp(char, 'g'), '');
  });
  
  return result;
}
