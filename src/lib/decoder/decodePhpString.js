export function decodePhpString(s) {
  let result = s;
  
  // Handle chr() functions
  result = result.replace(/chr\((\d+)\)/g, (match, code) => 
    String.fromCharCode(parseInt(code))
  );
  
  // Handle hex strings
  result = result.replace(/"\\x([0-9A-Fa-f]{2})"/g, (match, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  );
  
  // Handle pack function
  result = result.replace(/pack\("C\*",([0-9,\s]+)\)/g, (match, codes) => {
    return codes.split(',').map(code => String.fromCharCode(parseInt(code.trim()))).join('');
  });
  
  return result;
}
