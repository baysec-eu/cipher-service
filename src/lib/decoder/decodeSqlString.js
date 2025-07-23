export function decodeSqlString(s) {
  let result = s;
  
  // Handle CHAR() functions
  result = result.replace(/CHAR\((\d+)\)/g, (match, code) => 
    String.fromCharCode(parseInt(code))
  );
  
  // Handle hex literals
  result = result.replace(/0x([0-9A-Fa-f]+)/g, (match, hex) => 
    decodeHex(hex)
  );
  
  // Handle UNHEX function
  result = result.replace(/UNHEX\('([0-9A-Fa-f]+)'\)/g, (match, hex) => 
    decodeHex(hex)
  );
  
  return result;
}
