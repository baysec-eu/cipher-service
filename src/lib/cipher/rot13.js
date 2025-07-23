export function rot13(s) {
  return s.replace(/[A-Za-z]/g, c => 
    String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)
  );
}