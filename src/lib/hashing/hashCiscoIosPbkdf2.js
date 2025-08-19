import { hashPbkdf2Sha256 } from './hashPbkdf2Sha256.js';

// Cisco IOS PBKDF2-SHA256 (Hashcat mode 9200)
export async function hashCiscoIosPbkdf2(password, salt = null, iterations = 20000) {
  if (!salt) {
    salt = Array.from({ length: 14 }, () => Math.floor(Math.random() * 64));
  }
  
  const derived = await hashPbkdf2Sha256(password, salt, iterations);
  const saltStr = Array.from(salt).map(b => String.fromCharCode(b)).join('');
  
  return `$8$${btoa(saltStr).replace(/=/g, '')}$${derived}`;
}