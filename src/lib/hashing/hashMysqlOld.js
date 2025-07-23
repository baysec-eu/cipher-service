export function hashMysqlOld(password) {
  if (!password) return '';
  
  let nr = 1345345333;
  let add = 7;
  let nr2 = 0x12345671;
  
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    if (char === 32 || char === 9) continue; // Skip spaces and tabs
    
    nr ^= (((nr & 63) + add) * char) + (nr << 8);
    nr2 += (nr2 << 8) ^ nr;
    add += char;
  }
  
  nr &= 0x7fffffff;
  nr2 &= 0x7fffffff;
  
  return (nr.toString(16).padStart(8, '0') + nr2.toString(16).padStart(8, '0')).toUpperCase();
}