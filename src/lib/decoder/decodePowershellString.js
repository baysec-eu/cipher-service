export function decodePowershellString(s) {
  let result = s;
  
  // Handle char arrays
  result = result.replace(/\[char\[\]\]@\(([0-9,\s]+)\) -join ''/g, (match, codes) => {
    return codes.split(',').map(code => String.fromCharCode(parseInt(code.trim()))).join('');
  });
  
  // Handle format operator
  result = result.replace(/"([^"]*)" -f ([0-9,\s]+)/g, (match, format, codes) => {
    const codeArray = codes.split(',').map(code => String.fromCharCode(parseInt(code.trim())));
    return codeArray.join('');
  });
  
  return result;
}
