export function xorCipherMultiKeyDecode(s, keyStr = "key") {
  // XOR is symmetric, so decoding is the same as encoding
  const key = new TextEncoder().encode(keyStr);
  return Array.from(s).map((c, i) => 
    String.fromCharCode(c.charCodeAt(0) ^ key[i % key.length])
  ).join('');
}
