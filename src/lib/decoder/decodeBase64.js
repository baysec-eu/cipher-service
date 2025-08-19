export function decodeBase64(s) {
  try {
    // Decode base64 to binary string
    const binaryString = atob(s);
    // Convert binary string to bytes
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    // Decode bytes as UTF-8
    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return s;
  }
}
