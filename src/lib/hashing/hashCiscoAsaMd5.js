import {customMd5} from "./hashCustomMd5.js"

export function hashCiscoAsaMd5(username, password, salt = null) {
  if (!salt) {
    salt = Math.random().toString(36).substring(2, 6);
  }
  
  const combined = username + password + salt;
  return customMd5(combined);
}