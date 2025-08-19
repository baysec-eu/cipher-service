export function encodeBase64(s) {
  // Encode string as UTF-8
  const encoder = new TextEncoder();
  const bytes = encoder.encode(s);
  // Convert bytes to binary string
  let binaryString = '';
  for (let i = 0; i < bytes.length; i++) {
    binaryString += String.fromCharCode(bytes[i]);
  }
  // Encode as base64
  return btoa(binaryString);
}