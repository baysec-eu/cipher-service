export function printfFormatEncode(s) {
  return Array.from(s).map(c => `%${c.charCodeAt(0)}c`).join('');
}