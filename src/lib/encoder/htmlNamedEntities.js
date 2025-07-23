export function htmlNamedEntities(s) {
  const entities = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;',
    ' ': '&nbsp;', '©': '&copy;', '®': '&reg;', '™': '&trade;'
  };
  return Array.from(s).map(c => entities[c] || c).join('');
}