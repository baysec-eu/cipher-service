export function a1z26Decode(s) {
  return s.split(/\s+/).map(part => {
    const num = parseInt(part);
    if (num >= 1 && num <= 26) {
      return String.fromCharCode(num + 64);
    }
    return part;
  }).join('');
}