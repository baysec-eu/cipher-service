export function decodePathTraversal(s) {
  return s.replace(/%2F/g, '/').replace(/%5C/g, '\\').replace(/%2E/g, '.');
}
