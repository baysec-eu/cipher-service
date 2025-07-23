export function decodeHtmlEntities(s) {
  const entities = {
    '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#x27;': "'",
    '&nbsp;': ' ', '&copy;': '©', '&reg;': '®', '&trade;': '™'
  };
  
  let result = s;
  
  // Named entities
  Object.entries(entities).forEach(([entity, char]) => {
    result = result.replace(new RegExp(entity, 'g'), char);
  });
  
  // Numeric entities (hex)
  result = result.replace(/&#x([0-9A-Fa-f]+);?/g, (match, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  );
  
  // Numeric entities (decimal)
  result = result.replace(/&#(\d+);?/g, (match, dec) => 
    String.fromCharCode(parseInt(dec, 10))
  );
  
  return result;
}
