export function sqlCharHexMixed(s) {
  return Array.from(s).map((c, i) => {
    if (i % 2 === 0) {
      return `CHAR(${c.charCodeAt(0)})`;
    } else {
      return `0x${c.charCodeAt(0).toString(16)}`;
    }
  }).join('+');
}