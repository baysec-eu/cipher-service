import {customMd5} from "./hashMd5"

export function hashPostgresMd5(username, password, salt = null) {
  if (!salt) {
    salt = Math.random().toString(36).substring(2, 6);
  }
  
  const combined = password + username;
  const hash1 = customMd5(combined);
  const hash2 = customMd5(hash1 + salt);
  
  return `md5${hash2}`;
}