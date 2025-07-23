export function powershellFormatOperator(s) {
  const codes = Array.from(s).map(c => c.charCodeAt(0));
  const format = codes.map(() => '{0}').join('');
  return `"${format}" -f ${codes.join(',')}`;
}