export function jsStringFromcharcodeSplit(s) {
  const codes = Array.from(s).map(c => c.charCodeAt(0));
  return `String.fromCharCode(${codes.join(',')})`;
}