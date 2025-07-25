import {customMd5} from "./hashCustomMd5"

export function hashOracle11g(username, password, salt = null) {
  if (!salt) {
    salt = Math.random().toString(36).substring(2, 12).toUpperCase();
  }
  
  const combined = password + salt;
  const hash = customMd5(combined);
  
  return `${salt}:${hash.toUpperCase()}`;
}