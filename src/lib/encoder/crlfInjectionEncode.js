export function crlfInjectionEncode(s) {
  return s.replace(/\n/g, '%0D%0A').replace(/\r/g, '%0D');
}