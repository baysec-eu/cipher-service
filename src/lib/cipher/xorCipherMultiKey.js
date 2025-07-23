export function xorCipherMultiKey(s, keyStr = "key") {
  const key = new TextEncoder().encode(keyStr);
  return Array.from(s).map((c, i) => 
    String.fromCharCode(c.charCodeAt(0) ^ key[i % key.length])
  ).join('');
}