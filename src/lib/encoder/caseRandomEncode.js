export function caseRandomEncode(s) {
  return Array.from(s).map(c => 
    c.match(/[a-zA-Z]/) ? (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()) : c
  ).join('');
}