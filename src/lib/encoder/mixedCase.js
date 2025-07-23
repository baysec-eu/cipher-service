export function mixedCase(s) {
  return Array.from(s).map((c, i) => 
    i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()
  ).join('');
}