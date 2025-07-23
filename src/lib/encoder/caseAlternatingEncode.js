export function caseAlternatingEncode(s) {
  return Array.from(s).map((c, i) => 
    c.match(/[a-zA-Z]/) ? (i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()) : c
  ).join('');
}