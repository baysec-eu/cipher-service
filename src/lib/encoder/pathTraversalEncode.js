export function pathTraversalEncode(s) {
  return s.replace(/\//g, '%2F').replace(/\\/g, '%5C').replace(/\./g, '%2E');
}