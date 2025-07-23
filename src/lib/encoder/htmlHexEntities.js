export function htmlHexEntities(s) {
  return Array.from(s).map(c => `&#x${c.charCodeAt(0).toString(16)};`).join('');
}