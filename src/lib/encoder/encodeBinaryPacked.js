export function encodeBinaryPacked(s) {
  return Array.from(s).map(c => 
    c.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
}