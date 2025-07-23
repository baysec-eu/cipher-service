export function decodePlist(s) {
  try {
    const stringMatch = s.match(/<string>(.*?)<\/string>/s);
    if (stringMatch) {
      return stringMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    }
    return s;
  } catch {
    return s;
  }
}
