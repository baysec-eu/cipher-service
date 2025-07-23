export function decodeXml(s) {
  return s.replace(/&#x([0-9A-Fa-f]+);?/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
          .replace(/&#(\d+);?/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));
}
