export function powershellCharArray(s) {
  const codes = Array.from(s).map(c => c.charCodeAt(0));
  return `[char[]]@(${codes.join(',')}) -join ''`;
}