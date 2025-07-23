export function encodeAsn1Der(s) {
  const bytes = new TextEncoder().encode(s);
  const length = bytes.length;
  let result = '04'; // OCTET STRING tag
  
  // Encode length
  if (length < 128) {
    result += length.toString(16).padStart(2, '0');
  } else {
    const lengthBytes = [];
    let temp = length;
    while (temp > 0) {
      lengthBytes.unshift(temp & 0xFF);
      temp >>= 8;
    }
    result += (0x80 | lengthBytes.length).toString(16).padStart(2, '0');
    result += lengthBytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Encode content
  result += Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return result.toUpperCase();
}