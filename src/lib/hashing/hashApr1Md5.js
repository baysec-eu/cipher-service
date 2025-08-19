import { customMd5Bytes } from "./hashCustomMd5.js";

// APR1-MD5 implementation based on Apache's algorithm
export function hashApr1Md5(password, salt = null) {
  // Generate random salt if not provided
  if (!salt) {
    const chars = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    salt = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } else if (salt.length > 8) {
    salt = salt.substring(0, 8);
  }
  
  const passwordBytes = new TextEncoder().encode(password);
  const saltBytes = new TextEncoder().encode(salt);
  const magicString = '$apr1$';
  
  // Initial MD5 context
  let ctx = [...passwordBytes, ...new TextEncoder().encode(magicString), ...saltBytes];
  
  // Create alternate MD5 context
  let altCtx = [...passwordBytes, ...saltBytes, ...passwordBytes];
  let altDigest = customMd5Bytes(altCtx);
  
  // Add alternate digest to main context
  for (let i = passwordBytes.length; i > 0; i -= 16) {
    if (i > 16) {
      ctx.push(...altDigest);
    } else {
      ctx.push(...altDigest.slice(0, i));
    }
  }
  
  // Add some bits based on password length
  for (let i = passwordBytes.length; i > 0; i >>= 1) {
    if (i & 1) {
      ctx.push(0);
    } else {
      ctx.push(passwordBytes[0]);
    }
  }
  
  // Initial digest
  let digest = customMd5Bytes(ctx);
  
  // 1000 rounds of MD5
  for (let i = 0; i < 1000; i++) {
    ctx = [];
    
    // Add password or previous digest
    if (i & 1) {
      ctx.push(...passwordBytes);
    } else {
      ctx.push(...digest);
    }
    
    // Add salt for rounds not divisible by 3
    if (i % 3 !== 0) {
      ctx.push(...saltBytes);
    }
    
    // Add password for rounds not divisible by 7
    if (i % 7 !== 0) {
      ctx.push(...passwordBytes);
    }
    
    // Add previous digest or password
    if (i & 1) {
      ctx.push(...digest);
    } else {
      ctx.push(...passwordBytes);
    }
    
    digest = customMd5Bytes(ctx);
  }
  
  // Convert to APR1 base64
  const apr1Base64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let output = '';
  
  // Custom base64 encoding with permutation
  const permutation = [
    [0, 6, 12], [1, 7, 13], [2, 8, 14], [3, 9, 15], [4, 10, 5]
  ];
  
  for (let i = 0; i < 5; i++) {
    const [a, b, c] = permutation[i];
    let v = (digest[a] << 16) | (digest[b] << 8) | digest[c];
    
    for (let j = 0; j < 4; j++) {
      output += apr1Base64[v & 0x3f];
      v >>= 6;
    }
  }
  
  // Last group (2 bytes)
  let v = digest[11];
  output += apr1Base64[v & 0x3f];
  output += apr1Base64[(v >> 6) & 0x3f];
  
  return `$apr1$${salt}$${output}`;
}