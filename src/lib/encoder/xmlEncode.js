export function xmlEncode(s) {
  return Array.from(s).map(c => `&#x${c.charCodeAt(0).toString(16).toUpperCase()}`).join('');
}