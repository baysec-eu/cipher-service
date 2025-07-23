export function hashNtlm(password) {
  // Convert password to UTF-16LE
  const utf16le = new TextEncoder().encode(password);
  const utf16Buffer = new ArrayBuffer(password.length * 2);
  const utf16View = new Uint16Array(utf16Buffer);
  
  for (let i = 0; i < password.length; i++) {
    utf16View[i] = password.charCodeAt(i);
  }
  
  // Calculate MD4 hash of UTF-16LE password
  return customMd4(new Uint8Array(utf16Buffer));
}