export function decodeJsString(s) {
  let result = s;
  
  // Handle String.fromCharCode patterns
  result = result.replace(/String\.fromCharCode\(([0-9,\s]+)\)/g, (match, codes) => {
    return codes.split(',').map(code => String.fromCharCode(parseInt(code.trim()))).join('');
  });
  
  // Handle unicode escapes
  result = result.replace(/\\u([0-9A-Fa-f]{4})/g, (match, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  );
  
  // Handle hex escapes
  result = result.replace(/\\x([0-9A-Fa-f]{2})/g, (match, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  );
  
  return result;
}
