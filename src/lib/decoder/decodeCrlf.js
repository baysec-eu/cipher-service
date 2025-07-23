export function decodeCrlf(s) {
  return s.replace(/%0D%0A/g, '\n').replace(/%0D/g, '\r').replace(/%0A/g, '\n');
}
