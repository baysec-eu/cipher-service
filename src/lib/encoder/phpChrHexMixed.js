export function phpChrHexMixed(s) {
  return Array.from(s).map((c, i) => {
    if (i % 2 === 0) {
      return `chr(${c.charCodeAt(0)})`;
    } else {
      return `"\\x${c.charCodeAt(0).toString(16).padStart(2, '0')}"`;
    }
  }).join('.');
}