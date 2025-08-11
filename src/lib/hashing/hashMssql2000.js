import {customMd5Bytes} from "./hashCustomMd5.js"

export function hashMssql2000(password, salt = null) {
  if (!salt) {
    salt = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256));
  } else if (typeof salt === 'string') {
    salt = new TextEncoder().encode(salt).slice(0, 4);
  }
  
  const passwordUcs2 = new TextEncoder().encode(password);
  const combined = new Uint8Array([...salt, ...passwordUcs2]);
  const hash = customMd5Bytes(combined);
  
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `0x0100${saltHex}${hashHex}`;
}