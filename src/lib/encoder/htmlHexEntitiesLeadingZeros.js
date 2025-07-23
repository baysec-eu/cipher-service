export function htmlHexEntitiesLeadingZeros(s) {
  return Array.from(s).map(c => `&#x${c.charCodeAt(0).toString(16).padStart(8, '0')};`).join('');
}