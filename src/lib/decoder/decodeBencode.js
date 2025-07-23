export function decodeBencode(s) {
  try {
    const colonIndex = s.indexOf(':');
    if (colonIndex === -1) return s;
    
    const length = parseInt(s.substring(0, colonIndex));
    return s.substring(colonIndex + 1, colonIndex + 1 + length);
  } catch {
    return s;
  }
}
