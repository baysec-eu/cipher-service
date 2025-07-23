export function jsEvalFromcharcode(s) {
  const codes = Array.from(s).map(c => c.charCodeAt(0));
  return `eval(String.fromCharCode(${codes.join(',')}))`;
}