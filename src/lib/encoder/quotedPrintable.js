export function quotedPrintableEncode(input) {
  let result = '';
  let lineLen = 0;

  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i);
    let encoded;

    if (
      (code >= 33 && code <= 126 && code !== 61) || // printable, not '='
      (code === 9 || code === 32)                    // tab or space
    ) {
      encoded = input[i];
    } else {
      encoded = '=' + code.toString(16).toUpperCase().padStart(2, '0');
    }

    // Soft line break if line would exceed 76 chars
    if (lineLen + encoded.length > 75) {
      result += '=\r\n';
      lineLen = 0;
    }

    result += encoded;
    lineLen += encoded.length;

    // Handle native line breaks
    if (code === 13 && input.charCodeAt(i + 1) === 10) {
      result += '\n';
      i++; // skip the \n
      lineLen = 0;
    } else if (code === 10) {
      lineLen = 0;
    }
  }

  return result;
}

export function quotedPrintableDecode(input) {
  return input
    // Remove soft line breaks
    .replace(/=\r\n/g, '')
    .replace(/=\n/g, '')
    // Decode =XX hex sequences
    .replace(/=([0-9A-Fa-f]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
}
